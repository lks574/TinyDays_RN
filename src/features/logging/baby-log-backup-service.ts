import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createRemoteBabyLogInsert,
  type BabyLog,
  type BabyLogRepository,
  type RemoteBabyLogInsert,
} from "../../domain/baby-logs";
import type { RemoteFamilyMappingRepository } from "../family";
import { getSupabaseClient } from "../auth";
import { backupRemoteBabyLog } from "./remote-baby-log-repository";
import {
  createRemoteBabyLogBackupQueueItem,
  remoteBabyLogBackupQueueRepository,
  type RemoteBabyLogBackupQueueItem,
  type RemoteBabyLogBackupQueueRepository,
} from "./remote-baby-log-backup-queue-repository";

type RemoteBackupStatus = "backed_up" | "queued" | "skipped";
type InitialRemoteBackupStatus = "pending" | "skipped";

export type SaveBabyLogWithRemoteBackupResult = {
  logs: BabyLog[];
  remoteBackup: Promise<RemoteBackupStatus> | null;
  remoteBackupStatus: InitialRemoteBackupStatus;
};

export type SaveBabyLogWithRemoteBackupDependencies = {
  localRepository: BabyLogRepository;
  mappingRepository: RemoteFamilyMappingRepository;
  queueRepository?: RemoteBabyLogBackupQueueRepository;
  getClient?: () => SupabaseClient | null;
  backupRemoteLog?: (
    client: SupabaseClient,
    row: RemoteBabyLogInsert,
  ) => Promise<void>;
  now?: () => string;
};

export async function saveBabyLogWithRemoteBackup(
  log: BabyLog,
  dependencies: SaveBabyLogWithRemoteBackupDependencies,
): Promise<SaveBabyLogWithRemoteBackupResult> {
  const logs = await dependencies.localRepository.saveLog(log);
  const client = (dependencies.getClient ?? getSupabaseClient)();

  if (client === null) {
    return { logs, remoteBackup: null, remoteBackupStatus: "skipped" };
  }

  return {
    logs,
    remoteBackup: runRemoteBackup(log, client, dependencies),
    remoteBackupStatus: "pending",
  };
}

async function runRemoteBackup(
  log: BabyLog,
  client: SupabaseClient,
  dependencies: SaveBabyLogWithRemoteBackupDependencies,
): Promise<RemoteBackupStatus> {
  const userId = await getCurrentUserId(client);

  if (userId === null) {
    return "skipped";
  }

  const mapping = await dependencies.mappingRepository.getMapping(userId);

  if (mapping === null) {
    return "skipped";
  }

  const queueRepository =
    dependencies.queueRepository ?? remoteBabyLogBackupQueueRepository;
  const backupRemoteLog = dependencies.backupRemoteLog ?? backupRemoteBabyLog;
  const now = dependencies.now ?? (() => new Date().toISOString());

  await retryQueuedBackups({
    backupRemoteLog,
    client,
    mapping,
    now,
    queueRepository,
    userId,
  });

  const remoteRow = createRemoteBabyLogInsert(log, mapping, userId);

  if (remoteRow === null) {
    return "skipped";
  }

  try {
    await backupRemoteLog(client, remoteRow);

    return "backed_up";
  } catch (error) {
    const attemptAt = now();
    await queueRepository.saveItem(
      createRemoteBabyLogBackupQueueItem({
        log,
        userId,
        now: attemptAt,
        attemptCount: 1,
        lastAttemptAt: attemptAt,
        lastError: getErrorMessage(error),
      }),
    );

    return "queued";
  }
}

async function retryQueuedBackups(options: {
  backupRemoteLog: NonNullable<
    SaveBabyLogWithRemoteBackupDependencies["backupRemoteLog"]
  >;
  client: SupabaseClient;
  mapping: NonNullable<
    Awaited<ReturnType<RemoteFamilyMappingRepository["getMapping"]>>
  >;
  now: () => string;
  queueRepository: RemoteBabyLogBackupQueueRepository;
  userId: string;
}): Promise<void> {
  const queuedItems = await options.queueRepository.listItems();

  for (const item of queuedItems) {
    if (item.user_id !== options.userId) {
      continue;
    }

    const remoteRow = createRemoteBabyLogInsert(
      item.log,
      options.mapping,
      options.userId,
    );

    if (remoteRow === null) {
      continue;
    }

    try {
      await options.backupRemoteLog(options.client, remoteRow);
      await options.queueRepository.removeItem(item.local_log_id);
    } catch (error) {
      await options.queueRepository.saveItem(
        createRetriedQueueItem(item, options.now(), getErrorMessage(error)),
      );
    }
  }
}

async function getCurrentUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getSession();

  if (error !== null) {
    return null;
  }

  return data.session?.user.id ?? null;
}

function createRetriedQueueItem(
  item: RemoteBabyLogBackupQueueItem,
  now: string,
  lastError: string,
): RemoteBabyLogBackupQueueItem {
  return {
    ...item,
    attempt_count: item.attempt_count + 1,
    updated_at: now,
    last_attempt_at: now,
    last_error: lastError,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "원격 백업에 실패했습니다.";
}
