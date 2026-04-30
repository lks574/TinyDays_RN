import type { SupabaseClient } from "@supabase/supabase-js";

import { createBabyLog } from "../../domain/baby-logs";
import type { RemoteFamilyMapping } from "../../domain/family";
import { saveBabyLogWithRemoteBackup } from "./baby-log-backup-service";
import {
  createRemoteBabyLogBackupQueueItem,
  type RemoteBabyLogBackupQueueItem,
  type RemoteBabyLogBackupQueueRepository,
} from "./remote-baby-log-backup-queue-repository";

const userId = "00000000-0000-0000-0000-000000000016";
const mapping: RemoteFamilyMapping = {
  user_id: userId,
  local_family_id: "local-family",
  remote_family_id: "10000000-0000-0000-0000-000000000016",
  local_child_id: "local-child",
  remote_child_id: "30000000-0000-0000-0000-000000000016",
  local_member_id: "local-parent",
  remote_member_id: "20000000-0000-0000-0000-000000000016",
  bootstrapped_at: "2026-04-30T12:00:00.000Z",
  updated_at: "2026-04-30T12:00:00.000Z",
};
const log = createBabyLog(
  {
    child_id: "local-child",
    family_id: "local-family",
    created_by: "local-parent",
    log_type: "feeding",
    recorded_at: "2026-04-30T13:00:00.000Z",
    amount: 120,
    unit: "ml",
    source: "quick_button",
  },
  {
    id: "local-log",
    now: "2026-04-30T13:00:00.000Z",
  },
);

describe("saveBabyLogWithRemoteBackup", () => {
  it("saves locally first and backs up remotely when session and mapping exist", async () => {
    const localRepository = {
      listLogs: jest.fn(async () => []),
      saveLog: jest.fn(async () => [log]),
    };
    const mappingRepository = {
      getMapping: jest.fn(async () => mapping),
      saveMapping: jest.fn(),
    };
    const backupRemoteLog = jest.fn(async () => undefined);

    const result = await saveBabyLogWithRemoteBackup(log, {
      backupRemoteLog,
      getClient: () => createClientWithSession(userId),
      localRepository,
      mappingRepository,
      queueRepository: createMemoryQueueRepository(),
    });

    expect(result.logs).toEqual([log]);
    expect(result.remoteBackupStatus).toBe("pending");
    await expect(result.remoteBackup).resolves.toBe("backed_up");
    expect(localRepository.saveLog).toHaveBeenCalledWith(log);
    expect(backupRemoteLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        family_id: mapping.remote_family_id,
        child_id: mapping.remote_child_id,
        created_by: userId,
      }),
    );
  });

  it("queues a remote backup failure without failing local save", async () => {
    const queueRepository = createMemoryQueueRepository();
    const backupRemoteLog = jest.fn(async () => {
      throw new Error("network");
    });

    const result = await saveBabyLogWithRemoteBackup(log, {
      backupRemoteLog,
      getClient: () => createClientWithSession(userId),
      localRepository: {
        listLogs: jest.fn(async () => []),
        saveLog: jest.fn(async () => [log]),
      },
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      now: () => "2026-04-30T13:01:00.000Z",
      queueRepository,
    });

    expect(result.logs).toEqual([log]);
    expect(result.remoteBackupStatus).toBe("pending");
    await expect(result.remoteBackup).resolves.toBe("queued");
    await expect(queueRepository.listItems()).resolves.toEqual([
      createRemoteBabyLogBackupQueueItem({
        attemptCount: 1,
        lastAttemptAt: "2026-04-30T13:01:00.000Z",
        lastError: "network",
        log,
        now: "2026-04-30T13:01:00.000Z",
        userId,
      }),
    ]);
  });

  it("skips remote backup when there is no session", async () => {
    const backupRemoteLog = jest.fn(async () => undefined);

    const result = await saveBabyLogWithRemoteBackup(log, {
      backupRemoteLog,
      getClient: () => createClientWithoutSession(),
      localRepository: {
        listLogs: jest.fn(async () => []),
        saveLog: jest.fn(async () => [log]),
      },
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result.logs).toEqual([log]);
    expect(result.remoteBackupStatus).toBe("pending");
    await expect(result.remoteBackup).resolves.toBe("skipped");
    expect(backupRemoteLog).not.toHaveBeenCalled();
  });

  it("retries queued items before backing up the new log", async () => {
    const queuedLog = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "memo",
        recorded_at: "2026-04-30T12:59:00.000Z",
      },
      {
        id: "queued-log",
        now: "2026-04-30T12:59:00.000Z",
      },
    );
    const queueRepository = createMemoryQueueRepository([
      createRemoteBabyLogBackupQueueItem({
        attemptCount: 1,
        lastAttemptAt: "2026-04-30T13:00:00.000Z",
        lastError: "network",
        log: queuedLog,
        now: "2026-04-30T13:00:00.000Z",
        userId,
      }),
    ]);
    const backupRemoteLog = jest.fn(async () => undefined);

    const result = await saveBabyLogWithRemoteBackup(log, {
      backupRemoteLog,
      getClient: () => createClientWithSession(userId),
      localRepository: {
        listLogs: jest.fn(async () => []),
        saveLog: jest.fn(async () => [log]),
      },
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      queueRepository,
    });

    await expect(result.remoteBackup).resolves.toBe("backed_up");
    expect(backupRemoteLog).toHaveBeenCalledTimes(2);
    await expect(queueRepository.listItems()).resolves.toEqual([]);
  });
});

function createClientWithSession(id: string): SupabaseClient {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: { session: { user: { id } } },
        error: null,
      })),
    },
  } as unknown as SupabaseClient;
}

function createClientWithoutSession(): SupabaseClient {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: { session: null },
        error: null,
      })),
    },
  } as unknown as SupabaseClient;
}

function createMemoryQueueRepository(
  initialItems: RemoteBabyLogBackupQueueItem[] = [],
): RemoteBabyLogBackupQueueRepository {
  let items = initialItems;

  return {
    listItems: jest.fn(async () => items),
    saveItem: jest.fn(async (item) => {
      items = [
        item,
        ...items.filter(
          (currentItem) => currentItem.local_log_id !== item.local_log_id,
        ),
      ];
      return items;
    }),
    removeItem: jest.fn(async (localLogId) => {
      items = items.filter((item) => item.local_log_id !== localLogId);
      return items;
    }),
  };
}
