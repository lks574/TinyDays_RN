import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  isBabyLogType,
  type BabyLog,
  type BabyLogSource,
} from "../../domain/baby-logs";
import {
  createSQLiteSyncQueue,
  type KeyValueStorage,
  type TinyDaysSQLiteDatabase,
} from "../../shared/local-db/tinydays-sqlite";

const REMOTE_BABY_LOG_BACKUP_QUEUE_STORAGE_KEY =
  "tinydays:remote_baby_log_backup_queue";
const BABY_LOG_SOURCES: readonly BabyLogSource[] = [
  "manual",
  "quick_button",
  "voice",
  "siri",
  "imported",
];

export type RemoteBabyLogBackupQueueItem = {
  local_log_id: string;
  user_id: string;
  log: BabyLog;
  attempt_count: number;
  created_at: string;
  updated_at: string;
  last_attempt_at: string | null;
  last_error: string | null;
};

export type RemoteBabyLogBackupQueueRepository = {
  listItems: () => Promise<RemoteBabyLogBackupQueueItem[]>;
  saveItem: (
    item: RemoteBabyLogBackupQueueItem,
  ) => Promise<RemoteBabyLogBackupQueueItem[]>;
  removeItem: (localLogId: string) => Promise<RemoteBabyLogBackupQueueItem[]>;
};

export type CreateRemoteBabyLogBackupQueueRepositoryOptions = {
  database?: TinyDaysSQLiteDatabase | Promise<TinyDaysSQLiteDatabase>;
  legacyStorage?: KeyValueStorage | null;
};

export function createRemoteBabyLogBackupQueueRepository({
  database,
  legacyStorage = AsyncStorage,
}: CreateRemoteBabyLogBackupQueueRepositoryOptions = {}): RemoteBabyLogBackupQueueRepository {
  const queue = createSQLiteSyncQueue({
    database,
    queueType: "baby_log_backup",
    legacyStorage,
    legacyStorageKey: REMOTE_BABY_LOG_BACKUP_QUEUE_STORAGE_KEY,
    isRecord: isRemoteBabyLogBackupQueueItem,
    getId: (item) => item.local_log_id,
    getUserId: (item) => item.user_id,
    getCreatedAt: (item) => item.created_at,
    sort: sortQueueItems,
  });

  return {
    async listItems() {
      return queue.list();
    },
    async saveItem(item) {
      return queue.upsert(item);
    },
    async removeItem(localLogId) {
      return queue.remove(localLogId);
    },
  };
}

export function createRemoteBabyLogBackupQueueItem(options: {
  log: BabyLog;
  userId: string;
  now: string;
  attemptCount?: number;
  lastAttemptAt?: string | null;
  lastError?: string | null;
}): RemoteBabyLogBackupQueueItem {
  return {
    local_log_id: options.log.id,
    user_id: options.userId,
    log: options.log,
    attempt_count: options.attemptCount ?? 0,
    created_at: options.now,
    updated_at: options.now,
    last_attempt_at: options.lastAttemptAt ?? null,
    last_error: options.lastError ?? null,
  };
}

export const remoteBabyLogBackupQueueRepository =
  createRemoteBabyLogBackupQueueRepository();

function sortQueueItems(
  items: readonly RemoteBabyLogBackupQueueItem[],
): RemoteBabyLogBackupQueueItem[] {
  return [...items].sort(
    (left, right) =>
      new Date(left.created_at).getTime() -
      new Date(right.created_at).getTime(),
  );
}

function isRemoteBabyLogBackupQueueItem(
  value: unknown,
): value is RemoteBabyLogBackupQueueItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.local_log_id === "string" &&
    typeof candidate.user_id === "string" &&
    isBabyLog(candidate.log) &&
    typeof candidate.attempt_count === "number" &&
    typeof candidate.created_at === "string" &&
    typeof candidate.updated_at === "string" &&
    (typeof candidate.last_attempt_at === "string" ||
      candidate.last_attempt_at === null) &&
    (typeof candidate.last_error === "string" || candidate.last_error === null)
  );
}

function isBabyLog(value: unknown): value is BabyLog {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.child_id === "string" &&
    typeof candidate.family_id === "string" &&
    typeof candidate.created_by === "string" &&
    typeof candidate.log_type === "string" &&
    isBabyLogType(candidate.log_type) &&
    typeof candidate.recorded_at === "string" &&
    isNullableNumber(candidate.amount) &&
    isNullableString(candidate.unit) &&
    isNullableString(candidate.memo) &&
    typeof candidate.source === "string" &&
    BABY_LOG_SOURCES.includes(candidate.source as BabyLogSource) &&
    isNullableString(candidate.original_text) &&
    typeof candidate.confidence === "number" &&
    typeof candidate.created_at === "string" &&
    typeof candidate.updated_at === "string"
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === "number" || value === null;
}
