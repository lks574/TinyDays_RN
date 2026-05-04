import { createBabyLog } from "../../domain/baby-logs";
import { createMemorySQLiteDatabase } from "../../shared/local-db/test-database";
import { createLocalBabyLogRepository } from "./local-baby-log-repository";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}

describe("createLocalBabyLogRepository", () => {
  it("loads stored baby logs in recent-first order", async () => {
    const olderLog = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "feeding",
        recorded_at: "2026-04-28T01:00:00.000Z",
        source: "quick_button",
      },
      { id: "older", now: "2026-04-28T01:00:00.000Z" },
    );
    const newerLog = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "memo",
        recorded_at: "2026-04-28T02:00:00.000Z",
        source: "manual",
      },
      { id: "newer", now: "2026-04-28T02:00:00.000Z" },
    );
    const database = createMemorySQLiteDatabase();
    const repository = createLocalBabyLogRepository(
      {
        database,
        legacyStorage: createMemoryStorage(JSON.stringify([olderLog, newerLog])),
      },
    );

    await expect(repository.listLogs()).resolves.toEqual([newerLog, olderLog]);
  });

  it("saves a new log and returns the persisted list", async () => {
    const repository = createLocalBabyLogRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: null,
    });
    const log = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "bath",
        recorded_at: "2026-04-28T03:00:00.000Z",
      },
      { id: "bath-log", now: "2026-04-28T03:00:00.000Z" },
    );

    await expect(repository.saveLog(log)).resolves.toEqual([log]);
  });

  it("serializes overlapping save requests", async () => {
    const repository = createLocalBabyLogRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: null,
    });
    const firstLog = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "feeding",
        recorded_at: "2026-04-28T03:00:00.000Z",
      },
      { id: "first-log", now: "2026-04-28T03:00:00.000Z" },
    );
    const secondLog = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "memo",
        recorded_at: "2026-04-28T04:00:00.000Z",
      },
      { id: "second-log", now: "2026-04-28T04:00:00.000Z" },
    );

    await Promise.all([repository.saveLog(firstLog), repository.saveLog(secondLog)]);

    await expect(repository.listLogs()).resolves.toEqual([secondLog, firstLog]);
  });

  it("recovers with an empty list when stored JSON is invalid", async () => {
    const repository = createLocalBabyLogRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: createMemoryStorage("{"),
    });

    await expect(repository.listLogs()).resolves.toEqual([]);
  });
});
