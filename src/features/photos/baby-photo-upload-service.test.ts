import type { SupabaseClient } from "@supabase/supabase-js";

import { createBabyPhoto, type BabyPhoto } from "../../domain/photos";
import type { RemoteFamilyMapping } from "../../domain/family";
import { saveBabyPhotoWithRemoteUpload } from "./baby-photo-upload-service";
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
    file_name: "photo.jpg",
    file_size: 1024,
    mime_type: "image/jpeg",
    captured_at: "2026-04-30T13:00:00.000Z",
  },
  { id: "photo-1", now: "2026-04-30T13:00:00.000Z" },
);

describe("saveBabyPhotoWithRemoteUpload", () => {
  it("saves locally first and uploads remotely when session and mapping exist", async () => {
    const localRepository = createMemoryPhotoRepository();
    const requestUploadPlan = jest.fn(async () => ({
      media_asset_id: "media-1",
      object_key: "families/remote-family/children/remote-child/photos/media-1.jpg",
      upload_url: "https://r2.example.test/upload",
      expires_at: "2026-04-30T13:10:00.000Z",
    }));
    const uploadFile = jest.fn(async () => undefined);
    const completeUpload = jest.fn(async () => undefined);

    const result = await saveBabyPhotoWithRemoteUpload(photo, {
      completeUpload,
      getClient: () => createClientWithSession(userId),
      localRepository,
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      now: () => "2026-04-30T13:01:00.000Z",
      requestUploadPlan,
      uploadFile,
    });

    expect(result.photos).toEqual([photo]);
    expect(result.remoteUploadStatus).toBe("pending");
    await expect(result.remoteUpload).resolves.toBe("uploaded");
    expect(requestUploadPlan).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        family_id: mapping.remote_family_id,
        child_id: mapping.remote_child_id,
      }),
    );
    expect(uploadFile).toHaveBeenCalledWith(
      photo,
      expect.objectContaining({ media_asset_id: "media-1" }),
    );
    expect(completeUpload).toHaveBeenCalledWith(expect.anything(), "media-1");
    expect(localRepository.savedPhotos.at(-1)).toEqual(
      expect.objectContaining({
        id: "photo-1",
        remote_media_asset_id: "media-1",
        remote_object_key:
          "families/remote-family/children/remote-child/photos/media-1.jpg",
        remote_status: "uploaded",
      }),
    );
  });

  it("queues the local photo when remote upload fails", async () => {
    const localRepository = createMemoryPhotoRepository();
    const queueRepository = createMemoryQueueRepository();

    const result = await saveBabyPhotoWithRemoteUpload(photo, {
      getClient: () => createClientWithSession(userId),
      localRepository,
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      now: () => "2026-04-30T13:01:00.000Z",
      queueRepository,
      requestUploadPlan: jest.fn(async () => {
        throw new Error("network");
      }),
    });

    expect(result.photos).toEqual([photo]);
    await expect(result.remoteUpload).resolves.toBe("queued");
    expect(localRepository.savedPhotos).toEqual([photo]);
    await expect(queueRepository.listItems()).resolves.toEqual([
      createRemoteBabyPhotoUploadQueueItem({
        attemptCount: 1,
        lastAttemptAt: "2026-04-30T13:01:00.000Z",
        lastError: "network",
        now: "2026-04-30T13:01:00.000Z",
        photo,
        userId,
      }),
    ]);
  });

  it("queues and marks local remote metadata as failed when R2 upload fails after a plan", async () => {
    const localRepository = createMemoryPhotoRepository();
    const queueRepository = createMemoryQueueRepository();

    const result = await saveBabyPhotoWithRemoteUpload(photo, {
      getClient: () => createClientWithSession(userId),
      localRepository,
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      now: () => "2026-04-30T13:01:00.000Z",
      queueRepository,
      requestUploadPlan: jest.fn(async () => ({
        media_asset_id: "media-1",
        object_key:
          "families/remote-family/children/remote-child/photos/media-1.jpg",
        upload_url: "https://r2.example.test/upload",
        expires_at: "2026-04-30T13:10:00.000Z",
      })),
      uploadFile: jest.fn(async () => {
        throw new Error("r2");
      }),
    });

    await expect(result.remoteUpload).resolves.toBe("queued");
    expect(localRepository.savedPhotos.at(-1)).toEqual(
      expect.objectContaining({
        remote_media_asset_id: "media-1",
        remote_status: "failed",
      }),
    );
    await expect(queueRepository.listItems()).resolves.toHaveLength(1);
  });

  it("skips remote upload when there is no session", async () => {
    const result = await saveBabyPhotoWithRemoteUpload(photo, {
      getClient: () => createClientWithoutSession(),
      localRepository: createMemoryPhotoRepository(),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result.remoteUploadStatus).toBe("pending");
    await expect(result.remoteUpload).resolves.toBe("skipped");
  });

  it("retries queued photos before uploading the new photo", async () => {
    const queuedPhoto = createBabyPhoto(
      {
        family_id: "local-family",
        child_id: "local-child",
        created_by: "local-parent",
        uri: "file://queued.jpg",
        captured_at: "2026-04-30T12:59:00.000Z",
      },
      { id: "queued-photo", now: "2026-04-30T12:59:00.000Z" },
    );
    const queueRepository = createMemoryQueueRepository([
      createRemoteBabyPhotoUploadQueueItem({
        attemptCount: 1,
        lastAttemptAt: "2026-04-30T13:00:00.000Z",
        lastError: "network",
        now: "2026-04-30T13:00:00.000Z",
        photo: queuedPhoto,
        userId,
      }),
    ]);
    const requestUploadPlan = jest
      .fn()
      .mockResolvedValueOnce({
        media_asset_id: "queued-media",
        object_key:
          "families/remote-family/children/remote-child/photos/queued-media.jpg",
        upload_url: "https://r2.example.test/queued",
        expires_at: "2026-04-30T13:10:00.000Z",
      })
      .mockResolvedValueOnce({
        media_asset_id: "media-1",
        object_key:
          "families/remote-family/children/remote-child/photos/media-1.jpg",
        upload_url: "https://r2.example.test/upload",
        expires_at: "2026-04-30T13:10:00.000Z",
      });
    const uploadFile = jest.fn(async () => undefined);
    const completeUpload = jest.fn(async () => undefined);

    const result = await saveBabyPhotoWithRemoteUpload(photo, {
      completeUpload,
      getClient: () => createClientWithSession(userId),
      localRepository: createMemoryPhotoRepository(),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
      queueRepository,
      requestUploadPlan,
      uploadFile,
    });

    await expect(result.remoteUpload).resolves.toBe("uploaded");
    expect(requestUploadPlan).toHaveBeenCalledTimes(2);
    expect(uploadFile).toHaveBeenNthCalledWith(
      1,
      queuedPhoto,
      expect.objectContaining({ media_asset_id: "queued-media" }),
    );
    await expect(queueRepository.listItems()).resolves.toEqual([]);
  });

  it("updates queued photo attempts when retry fails again", async () => {
    const queuedItem = createRemoteBabyPhotoUploadQueueItem({
      attemptCount: 1,
      lastAttemptAt: "2026-04-30T13:00:00.000Z",
      lastError: "network",
      now: "2026-04-30T13:00:00.000Z",
      photo,
      userId,
    });
    const queueRepository = createMemoryQueueRepository([queuedItem]);
    const requestUploadPlan = jest
      .fn()
      .mockRejectedValueOnce(new Error("r2"))
      .mockResolvedValueOnce({
        media_asset_id: "media-1",
        object_key:
          "families/remote-family/children/remote-child/photos/media-1.jpg",
        upload_url: "https://r2.example.test/upload",
        expires_at: "2026-04-30T13:10:00.000Z",
      });

    const result = await saveBabyPhotoWithRemoteUpload(
      { ...photo, id: "new-photo" },
      {
        getClient: () => createClientWithSession(userId),
        localRepository: createMemoryPhotoRepository(),
        mappingRepository: {
          getMapping: jest.fn(async () => mapping),
          saveMapping: jest.fn(),
        },
        now: () => "2026-04-30T13:02:00.000Z",
        queueRepository,
        requestUploadPlan,
        completeUpload: jest.fn(async () => undefined),
        uploadFile: jest.fn(async () => undefined),
      },
    );

    await expect(result.remoteUpload).resolves.toBe("uploaded");
    await expect(queueRepository.listItems()).resolves.toEqual([
      {
        ...queuedItem,
        attempt_count: 2,
        updated_at: "2026-04-30T13:02:00.000Z",
        last_attempt_at: "2026-04-30T13:02:00.000Z",
        last_error: "r2",
      },
    ]);
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

function createMemoryPhotoRepository(): BabyPhotoRepository & {
  savedPhotos: BabyPhoto[];
} {
  const savedPhotos: BabyPhoto[] = [];

  return {
    savedPhotos,
    listPhotos: jest.fn(async () => savedPhotos),
    savePhoto: jest.fn(async (nextPhoto) => {
      savedPhotos.push(nextPhoto);
      return [nextPhoto];
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
      ].sort(
        (left, right) =>
          new Date(left.created_at).getTime() -
          new Date(right.created_at).getTime(),
      );
      return items;
    }),
    removeItem: jest.fn(async (localPhotoId) => {
      items = items.filter((item) => item.local_photo_id !== localPhotoId);
      return items;
    }),
  };
}
