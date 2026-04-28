import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  isBabyLogType,
  type BabyLog,
  type BabyLogRepository,
  type BabyLogSource,
} from "../../domain/baby-logs";

type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const BABY_LOGS_STORAGE_KEY = "tinydays:baby_logs";
const BABY_LOG_SOURCES: readonly BabyLogSource[] = [
  "manual",
  "quick_button",
  "voice",
  "siri",
  "imported",
];

export function createLocalBabyLogRepository(
  storage: KeyValueStorage = AsyncStorage,
): BabyLogRepository {
  let pendingSave: Promise<void> = Promise.resolve();

  return {
    async listLogs() {
      return readLogs(storage);
    },
    async saveLog(log) {
      const saveOperation = pendingSave.then(async () => {
        const logs = await readLogs(storage);
        const nextLogs = sortLogsByRecent([
          log,
          ...logs.filter((item) => item.id !== log.id),
        ]);

        await storage.setItem(BABY_LOGS_STORAGE_KEY, JSON.stringify(nextLogs));

        return nextLogs;
      });

      pendingSave = saveOperation.then(
        () => undefined,
        () => undefined,
      );

      return saveOperation;
    },
  };
}

export const localBabyLogRepository = createLocalBabyLogRepository();

async function readLogs(storage: KeyValueStorage): Promise<BabyLog[]> {
  const rawLogs = await storage.getItem(BABY_LOGS_STORAGE_KEY);

  if (rawLogs === null) {
    return [];
  }

  try {
    const parsedLogs: unknown = JSON.parse(rawLogs);

    if (!Array.isArray(parsedLogs)) {
      return [];
    }

    return sortLogsByRecent(parsedLogs.filter(isBabyLog));
  } catch {
    return [];
  }
}

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
