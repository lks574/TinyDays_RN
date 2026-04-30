import { createBabyLog } from "../../domain/baby-logs";
import {
  createRemoteBabyLogBackupQueueItem,
  createRemoteBabyLogBackupQueueRepository,
} from "./remote-baby-log-backup-queue-repository";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}

const log = createBabyLog(
  {
    child_id: "local-child",
    family_id: "local-family",
    created_by: "local-parent",
    log_type: "memo",
    recorded_at: "2026-04-30T13:00:00.000Z",
  },
  {
    id: "local-log",
    now: "2026-04-30T13:00:00.000Z",
  },
);

describe("createRemoteBabyLogBackupQueueRepository", () => {
  it("saves and loads queue items oldest first", async () => {
    const storage = createMemoryStorage();
    const repository = createRemoteBabyLogBackupQueueRepository(storage);
    const item = createRemoteBabyLogBackupQueueItem({
      log,
      userId: "remote-user",
      now: "2026-04-30T13:00:00.000Z",
    });

    await expect(repository.saveItem(item)).resolves.toEqual([item]);
    await expect(repository.listItems()).resolves.toEqual([item]);
    expect(storage.setItem).toHaveBeenCalledWith(
      "tinydays:remote_baby_log_backup_queue",
      JSON.stringify([item]),
    );
  });

  it("replaces an existing item with the same local log id", async () => {
    const repository = createRemoteBabyLogBackupQueueRepository(
      createMemoryStorage(),
    );
    const firstItem = createRemoteBabyLogBackupQueueItem({
      log,
      userId: "remote-user",
      now: "2026-04-30T13:00:00.000Z",
    });
    const retriedItem = {
      ...firstItem,
      attempt_count: 2,
      updated_at: "2026-04-30T13:01:00.000Z",
      last_attempt_at: "2026-04-30T13:01:00.000Z",
      last_error: "network",
    };

    await repository.saveItem(firstItem);
    await expect(repository.saveItem(retriedItem)).resolves.toEqual([
      retriedItem,
    ]);
  });

  it("removes an item by local log id", async () => {
    const repository = createRemoteBabyLogBackupQueueRepository(
      createMemoryStorage(),
    );
    const item = createRemoteBabyLogBackupQueueItem({
      log,
      userId: "remote-user",
      now: "2026-04-30T13:00:00.000Z",
    });

    await repository.saveItem(item);
    await expect(repository.removeItem(log.id)).resolves.toEqual([]);
  });

  it("recovers with an empty list when stored JSON is invalid", async () => {
    const repository = createRemoteBabyLogBackupQueueRepository(
      createMemoryStorage("{"),
    );

    await expect(repository.listItems()).resolves.toEqual([]);
  });
});
