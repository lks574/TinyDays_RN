import { createBabyPhoto } from "../../domain/photos";
import { createMemorySQLiteDatabase } from "../../shared/local-db/test-database";
import { createLocalBabyPhotoRepository } from "./local-baby-photo-repository";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}

function createPhoto(id: string, capturedAt: string) {
  return createBabyPhoto(
    {
      family_id: "local-family",
      child_id: "local-child",
      created_by: "local-parent",
      uri: `file://${id}.jpg`,
      captured_at: capturedAt,
    },
    { id, now: capturedAt },
  );
}

describe("createLocalBabyPhotoRepository", () => {
  it("loads stored baby photos in recent-first order", async () => {
    const olderPhoto = createPhoto("older", "2026-04-28T01:00:00.000Z");
    const newerPhoto = createPhoto("newer", "2026-04-28T02:00:00.000Z");
    const repository = createLocalBabyPhotoRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: createMemoryStorage(
        JSON.stringify([olderPhoto, newerPhoto]),
      ),
    });

    await expect(repository.listPhotos()).resolves.toEqual([
      newerPhoto,
      olderPhoto,
    ]);
  });

  it("saves a new photo and returns the persisted list", async () => {
    const repository = createLocalBabyPhotoRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: null,
    });
    const photo = createPhoto("photo-1", "2026-04-28T03:00:00.000Z");

    await expect(repository.savePhoto(photo)).resolves.toEqual([photo]);
  });

  it("deletes a photo by id and keeps the remaining photos", async () => {
    const olderPhoto = createPhoto("older", "2026-04-28T01:00:00.000Z");
    const newerPhoto = createPhoto("newer", "2026-04-28T02:00:00.000Z");
    const repository = createLocalBabyPhotoRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: createMemoryStorage(
        JSON.stringify([newerPhoto, olderPhoto]),
      ),
    });

    await expect(repository.deletePhoto("newer")).resolves.toEqual([
      olderPhoto,
    ]);
  });

  it("recovers with an empty list when stored JSON is invalid", async () => {
    const repository = createLocalBabyPhotoRepository({
      database: createMemorySQLiteDatabase(),
      legacyStorage: createMemoryStorage("{"),
    });

    await expect(repository.listPhotos()).resolves.toEqual([]);
  });
});
