import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  isBabyLogType,
  type BabyLog,
  type BabyLogRepository,
  type BabyLogSource,
} from "../../domain/baby-logs";
import {
  createSQLiteJsonTable,
  type KeyValueStorage,
  type TinyDaysSQLiteDatabase,
} from "../../shared/local-db/tinydays-sqlite";

const BABY_LOGS_STORAGE_KEY = "tinydays:baby_logs";
const BABY_LOG_SOURCES: readonly BabyLogSource[] = [
  "manual",
  "quick_button",
  "voice",
  "siri",
  "imported",
];

export type CreateLocalBabyLogRepositoryOptions = {
  database?: TinyDaysSQLiteDatabase | Promise<TinyDaysSQLiteDatabase>;
  legacyStorage?: KeyValueStorage | null;
};

export function createLocalBabyLogRepository({
  database,
  legacyStorage = AsyncStorage,
}: CreateLocalBabyLogRepositoryOptions = {}): BabyLogRepository {
  const table = createSQLiteJsonTable({
    database,
    tableName: "baby_logs",
    legacyStorage,
    legacyStorageKey: BABY_LOGS_STORAGE_KEY,
    isRecord: isBabyLog,
    getId: (log) => log.id,
    getSortValue: (log) => log.recorded_at,
    sort: sortLogsByRecent,
  });

  return {
    async listLogs() {
      return table.list();
    },
    async saveLog(log) {
      return table.upsert(log);
    },
  };
}

export const localBabyLogRepository = createLocalBabyLogRepository();

function sortLogsByRecent(logs: readonly BabyLog[]): BabyLog[] {
  return [...logs].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() - new Date(left.recorded_at).getTime(),
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
