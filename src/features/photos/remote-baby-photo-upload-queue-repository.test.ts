import { createBabyPhoto } from "../../domain/photos";
import { createMemorySQLiteDatabase } from "../../shared/local-db/test-database";
import {
  createRemoteBabyPhotoUploadQueueItem,
  createRemoteBabyPhotoUploadQueueRepository,
} from "./remote-baby-photo-upload-queue-repository";

const photo = createBabyPhoto(
  {
    family_id: "local-family",
    child_id: "local-child",
    created_by: "local-parent",
    uri: "file://photo.jpg",
    captured_at: "2026-04-30T13:00:00.000Z",
  },
  { id: "photo-1", now: "2026-04-30T13:00:00.000Z" },
);

describe("remoteBabyPhotoUploadQueueRepository", () => {
  it("saves and loads queue items oldest first", async () => {
    const repository = createRemoteBabyPhotoUploadQueueRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: null,
    });
    const newerItem = createRemoteBabyPhotoUploadQueueItem({
      photo,
      userId: "user-1",
      now: "2026-04-30T13:02:00.000Z",
    });
    const olderItem = createRemoteBabyPhotoUploadQueueItem({
      photo: { ...photo, id: "photo-2" },
      userId: "user-1",
      now: "2026-04-30T13:01:00.000Z",
    });

    await repository.saveItem(newerItem);
    await repository.saveItem(olderItem);

    await expect(repository.listItems()).resolves.toEqual([
      olderItem,
      newerItem,
    ]);
  });

  it("replaces an existing item with the same local photo id", async () => {
    const repository = createRemoteBabyPhotoUploadQueueRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: null,
    });
    const firstItem = createRemoteBabyPhotoUploadQueueItem({
      attemptCount: 1,
      lastError: "network",
      photo,
      userId: "user-1",
      now: "2026-04-30T13:01:00.000Z",
    });
    const nextItem = createRemoteBabyPhotoUploadQueueItem({
      attemptCount: 2,
      lastError: "r2",
      photo,
      userId: "user-1",
      now: "2026-04-30T13:02:00.000Z",
    });

    await repository.saveItem(firstItem);
    await repository.saveItem(nextItem);

    await expect(repository.listItems()).resolves.toEqual([nextItem]);
  });

  it("removes an item by local photo id", async () => {
    const repository = createRemoteBabyPhotoUploadQueueRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: null,
    });
    const item = createRemoteBabyPhotoUploadQueueItem({
      photo,
      userId: "user-1",
      now: "2026-04-30T13:01:00.000Z",
    });

    await repository.saveItem(item);
    await repository.removeItem("photo-1");

    await expect(repository.listItems()).resolves.toEqual([]);
  });

  it("recovers with an empty list when stored JSON is invalid", async () => {
    const repository = createRemoteBabyPhotoUploadQueueRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: createMemoryStorage("not-json"),
    });

    await expect(repository.listItems()).resolves.toEqual([]);
  });
});

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}
