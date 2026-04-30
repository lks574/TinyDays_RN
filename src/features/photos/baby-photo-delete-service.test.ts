import type { SupabaseClient } from "@supabase/supabase-js";

import { createBabyPhoto, type BabyPhoto } from "../../domain/photos";
import type { RemoteFamilyMapping } from "../../domain/family";
import { deleteBabyPhotoWithRemoteCleanup } from "./baby-photo-delete-service";
import type { BabyPhotoRepository } from "./local-baby-photo-repository";
import {
  createRemoteBabyPhotoUploadQueueItem,
  type RemoteBabyPhotoUploadQueueItem,
  type RemoteBabyPhotoUploadQueueRepository,
} from "./remote-baby-photo-upload-queue-repository";

const userId = "00000000-0000-0000-0000-000000000017";
const mapping: RemoteFamilyMapping = {
  user_id: userId,
  local_family_id: "local-family",
  remote_family_id: "10000000-0000-0000-0000-000000000017",
  local_child_id: "local-child",
  remote_child_id: "30000000-0000-0000-0000-000000000017",
  local_member_id: "local-parent",
  remote_member_id: "20000000-0000-0000-0000-000000000017",
  bootstrapped_at: "2026-04-30T12:00:00.000Z",
  updated_at: "2026-04-30T12:00:00.000Z",
};
const photo = createBabyPhoto(
  {
    family_id: "local-family",
    child_id: "local-child",
    created_by: "local-parent",
    uri: "file://photo.jpg",
    remote_media_asset_id: "media-1",
    remote_object_key:
      "families/remote-family/children/remote-child/photos/media-1.jpg",
    remote_status: "uploaded",
    captured_at: "2026-04-30T13:00:00.000Z",
  },
  { id: "photo-1", now: "2026-04-30T13:00:00.000Z" },
);

describe("deleteBabyPhotoWithRemoteCleanup", () => {
  it("deletes local metadata, removes queued upload, and deletes remote asset", async () => {
    const localRepository = createMemoryPhotoRepository([photo]);
    const queueRepository = createMemoryQueueRepository([
      createRemoteBabyPhotoUploadQueueItem({
        attemptCount: 1,
        lastAttemptAt: "2026-04-30T13:01:00.000Z",
        lastError: "network",
        now: "2026-04-30T13:01:00.000Z",
        photo,
        userId,
      }),
    ]);
    const deleteRemote = jest.fn(async () => undefined);

    const result = await deleteBabyPhotoWithRemoteCleanup(photo, {
      deleteRemote,
      getClient: () => createClientWithSession(userId),
      localRepository,
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      queueRepository,
    });

    expect(result.photos).toEqual([]);
    expect(result.remoteDeleteStatus).toBe("pending");
    await expect(result.remoteDelete).resolves.toBe("deleted");
    expect(deleteRemote).toHaveBeenCalledWith(expect.anything(), "media-1");
    await expect(queueRepository.listItems()).resolves.toEqual([]);
  });

  it("keeps local deletion when remote delete fails", async () => {
    const localRepository = createMemoryPhotoRepository([photo]);

    const result = await deleteBabyPhotoWithRemoteCleanup(photo, {
      deleteRemote: jest.fn(async () => {
        throw new Error("r2");
      }),
      getClient: () => createClientWithSession(userId),
      localRepository,
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      queueRepository: createMemoryQueueRepository(),
    });

    expect(result.photos).toEqual([]);
    await expect(result.remoteDelete).resolves.toBe("failed");
    await expect(localRepository.listPhotos()).resolves.toEqual([]);
  });

  it("skips remote cleanup when there is no session", async () => {
    const deleteRemote = jest.fn(async () => undefined);

    const result = await deleteBabyPhotoWithRemoteCleanup(photo, {
      deleteRemote,
      getClient: () => createClientWithoutSession(),
      localRepository: createMemoryPhotoRepository([photo]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      queueRepository: createMemoryQueueRepository(),
    });

    expect(result.remoteDeleteStatus).toBe("pending");
    await expect(result.remoteDelete).resolves.toBe("skipped");
    expect(deleteRemote).not.toHaveBeenCalled();
  });

  it("skips remote cleanup for local-only photos", async () => {
    const localOnlyPhoto = {
      ...photo,
      remote_media_asset_id: null,
      remote_object_key: null,
      remote_status: null,
    };
    const deleteRemote = jest.fn(async () => undefined);

    const result = await deleteBabyPhotoWithRemoteCleanup(localOnlyPhoto, {
      deleteRemote,
      getClient: () => createClientWithSession(userId),
      localRepository: createMemoryPhotoRepository([localOnlyPhoto]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      queueRepository: createMemoryQueueRepository(),
    });

    expect(result.remoteDeleteStatus).toBe("skipped");
    expect(result.remoteDelete).toBeNull();
    expect(deleteRemote).not.toHaveBeenCalled();
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

function createMemoryPhotoRepository(initialPhotos: BabyPhoto[]): BabyPhotoRepository {
  let photos = initialPhotos;

  return {
    listPhotos: jest.fn(async () => photos),
    savePhoto: jest.fn(async (nextPhoto) => {
      photos = [nextPhoto, ...photos.filter((photo) => photo.id !== nextPhoto.id)];
      return photos;
    }),
    deletePhoto: jest.fn(async (photoId) => {
      photos = photos.filter((photo) => photo.id !== photoId);
      return photos;
    }),
  };
}

function createMemoryQueueRepository(
  initialItems: RemoteBabyPhotoUploadQueueItem[] = [],
): RemoteBabyPhotoUploadQueueRepository {
  let items = initialItems;

  return {
    listItems: jest.fn(async () => items),
    saveItem: jest.fn(async (item) => {
      items = [
        item,
        ...items.filter(
          (currentItem) => currentItem.local_photo_id !== item.local_photo_id,
        ),
      ];
      return items;
    }),
    removeItem: jest.fn(async (localPhotoId) => {
      items = items.filter((item) => item.local_photo_id !== localPhotoId);
      return items;
    }),
  };
}
