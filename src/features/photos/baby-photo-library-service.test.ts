import type { SupabaseClient } from "@supabase/supabase-js";

import type { RemoteFamilyMapping } from "../../domain/family";
import { createBabyPhoto, type BabyPhoto } from "../../domain/photos";
import {
  loadBabyPhotosWithRemoteDownloads,
  refreshBabyPhotoDownloadUrl,
} from "./baby-photo-library-service";
import type { BabyPhotoRepository } from "./local-baby-photo-repository";
import { createMemoryBabyPhotoDownloadUrlCacheRepository } from "./remote-baby-photo-download-url-cache-repository";

const userId = "00000000-0000-0000-0000-000000000018";
const mapping: RemoteFamilyMapping = {
  user_id: userId,
  local_family_id: "local-family",
  remote_family_id: "10000000-0000-0000-0000-000000000018",
  local_child_id: "local-child",
  remote_child_id: "30000000-0000-0000-0000-000000000018",
  local_member_id: "local-parent",
  remote_member_id: "20000000-0000-0000-0000-000000000018",
  bootstrapped_at: "2026-04-30T12:00:00.000Z",
  updated_at: "2026-04-30T12:00:00.000Z",
};

const localPhoto = createBabyPhoto(
  {
    family_id: "local-family",
    child_id: "local-child",
    created_by: "local-parent",
    uri: "file://local.jpg",
    captured_at: "2026-04-30T13:00:00.000Z",
  },
  { id: "local-photo", now: "2026-04-30T13:00:00.000Z" },
);

describe("loadBabyPhotosWithRemoteDownloads", () => {
  it("loads local photos and appends remote uploaded photos with signed urls", async () => {
    const result = await loadBabyPhotosWithRemoteDownloads({
      getClient: () => createClientWithSession(userId),
      getDownloadUrl: jest.fn(async (_client, mediaAssetId) => ({
        media_asset_id: mediaAssetId,
        download_url: `https://r2.example.test/${mediaAssetId}`,
        expires_at: "2026-04-30T13:10:00.000Z",
      })),
      listRemoteAssets: jest.fn(async () => [
        {
          id: "media-remote",
          family_id: mapping.remote_family_id,
          child_id: mapping.remote_child_id,
          created_by: userId,
          bucket: "tinydays-media-dev",
          object_key: "families/family/photos/media-remote.jpg",
          file_name: "remote.jpg",
          file_size: 2048,
          mime_type: "image/jpeg",
          width: 1000,
          height: 800,
          captured_at: "2026-04-30T14:00:00.000Z",
          created_at: "2026-04-30T14:00:00.000Z",
          updated_at: "2026-04-30T14:00:00.000Z",
        },
      ]),
      localRepository: createMemoryPhotoRepository([localPhoto]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result.remoteStatus).toBe("loaded");
    expect(result.photos).toEqual([
      expect.objectContaining({
        id: "remote-photo-media-remote",
        uri: "https://r2.example.test/media-remote",
        remote_media_asset_id: "media-remote",
      }),
      localPhoto,
    ]);
  });

  it("returns local photos when there is no session", async () => {
    const result = await loadBabyPhotosWithRemoteDownloads({
      getClient: () => createClientWithoutSession(),
      localRepository: createMemoryPhotoRepository([localPhoto]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result).toEqual({
      photos: [localPhoto],
      remoteStatus: "skipped",
    });
  });

  it("keeps local photos when remote loading fails", async () => {
    const result = await loadBabyPhotosWithRemoteDownloads({
      getClient: () => createClientWithSession(userId),
      listRemoteAssets: jest.fn(async () => {
        throw new Error("rls");
      }),
      localRepository: createMemoryPhotoRepository([localPhoto]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result).toEqual({
      photos: [localPhoto],
      remoteStatus: "failed",
    });
  });

  it("keeps local photos when mapping loading fails", async () => {
    const result = await loadBabyPhotosWithRemoteDownloads({
      getClient: () => createClientWithSession(userId),
      localRepository: createMemoryPhotoRepository([localPhoto]),
      mappingRepository: {
        getMapping: jest.fn(async () => {
          throw new Error("storage");
        }),
        saveMapping: jest.fn(),
      },
    });

    expect(result).toEqual({
      photos: [localPhoto],
      remoteStatus: "failed",
    });
  });

  it("uses cached signed urls without requesting a new download url", async () => {
    const cacheRepository = createMemoryBabyPhotoDownloadUrlCacheRepository();
    const getDownloadUrl = jest.fn();
    cacheRepository.saveUrl({
      media_asset_id: "media-remote",
      download_url: "https://r2.example.test/cached-media-remote",
      expires_at: "2026-04-30T13:10:00.000Z",
    });

    const result = await loadBabyPhotosWithRemoteDownloads({
      getClient: () => createClientWithSession(userId),
      getDownloadUrl,
      now: () => "2026-04-30T13:08:30.000Z",
      downloadUrlCacheRepository: cacheRepository,
      listRemoteAssets: jest.fn(async () => [createRemoteAsset("media-remote")]),
      localRepository: createMemoryPhotoRepository([]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(getDownloadUrl).not.toHaveBeenCalled();
    expect(result.photos[0]).toEqual(
      expect.objectContaining({
        uri: "https://r2.example.test/cached-media-remote",
      }),
    );
  });

  it("refreshes stale signed urls and stores the new download url in cache", async () => {
    const cacheRepository = createMemoryBabyPhotoDownloadUrlCacheRepository();
    const getDownloadUrl = jest.fn(async (_client, mediaAssetId) => ({
      media_asset_id: mediaAssetId,
      download_url: `https://r2.example.test/fresh-${mediaAssetId}`,
      expires_at: "2026-04-30T13:20:00.000Z",
    }));
    cacheRepository.saveUrl({
      media_asset_id: "media-remote",
      download_url: "https://r2.example.test/stale-media-remote",
      expires_at: "2026-04-30T13:10:00.000Z",
    });

    const result = await loadBabyPhotosWithRemoteDownloads({
      getClient: () => createClientWithSession(userId),
      getDownloadUrl,
      now: () => "2026-04-30T13:09:30.000Z",
      downloadUrlCacheRepository: cacheRepository,
      listRemoteAssets: jest.fn(async () => [createRemoteAsset("media-remote")]),
      localRepository: createMemoryPhotoRepository([]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(getDownloadUrl).toHaveBeenCalledTimes(1);
    expect(result.photos[0]).toEqual(
      expect.objectContaining({
        uri: "https://r2.example.test/fresh-media-remote",
      }),
    );
    expect(
      cacheRepository.getFreshUrl("media-remote", {
        now: "2026-04-30T13:10:00.000Z",
      }),
    ).toEqual({
      media_asset_id: "media-remote",
      download_url: "https://r2.example.test/fresh-media-remote",
      expires_at: "2026-04-30T13:20:00.000Z",
    });
  });
});

describe("refreshBabyPhotoDownloadUrl", () => {
  it("replaces one remote photo uri with a fresh signed url", async () => {
    const cacheRepository = createMemoryBabyPhotoDownloadUrlCacheRepository();
    const getDownloadUrl = jest.fn(async (_client, mediaAssetId) => ({
      media_asset_id: mediaAssetId,
      download_url: "https://r2.example.test/refreshed-media-remote",
      expires_at: "2026-04-30T13:20:00.000Z",
    }));
    const photo = {
      ...localPhoto,
      remote_media_asset_id: "media-remote",
      remote_status: "uploaded" as const,
      uri: "https://r2.example.test/expired-media-remote",
    };

    const result = await refreshBabyPhotoDownloadUrl(photo, {
      getClient: () => createClientWithSession(userId),
      getDownloadUrl,
      downloadUrlCacheRepository: cacheRepository,
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result).toEqual({
      status: "refreshed",
      photo: {
        ...photo,
        uri: "https://r2.example.test/refreshed-media-remote",
      },
    });
    expect(
      cacheRepository.getFreshUrl("media-remote", {
        now: "2026-04-30T13:10:00.000Z",
      }),
    ).toEqual({
      media_asset_id: "media-remote",
      download_url: "https://r2.example.test/refreshed-media-remote",
      expires_at: "2026-04-30T13:20:00.000Z",
    });
  });

  it("skips refresh when the user has no session", async () => {
    const photo = {
      ...localPhoto,
      remote_media_asset_id: "media-remote",
      remote_status: "uploaded" as const,
    };

    await expect(
      refreshBabyPhotoDownloadUrl(photo, {
        getClient: () => createClientWithoutSession(),
        getDownloadUrl: jest.fn(),
        mappingRepository: {
          getMapping: jest.fn(async () => mapping),
          saveMapping: jest.fn(),
        },
      }),
    ).resolves.toEqual({ photo, status: "skipped" });
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

function createRemoteAsset(id: string) {
  return {
    id,
    family_id: mapping.remote_family_id,
    child_id: mapping.remote_child_id,
    created_by: userId,
    bucket: "tinydays-media-dev",
    object_key: `families/family/photos/${id}.jpg`,
    file_name: `${id}.jpg`,
    file_size: 2048,
    mime_type: "image/jpeg",
    width: 1000,
    height: 800,
    captured_at: "2026-04-30T14:00:00.000Z",
    created_at: "2026-04-30T14:00:00.000Z",
    updated_at: "2026-04-30T14:00:00.000Z",
  };
}

function createMemoryPhotoRepository(photos: BabyPhoto[]): BabyPhotoRepository {
  return {
    listPhotos: jest.fn(async () => photos),
    savePhoto: jest.fn(async (nextPhoto) => [nextPhoto, ...photos]),
    deletePhoto: jest.fn(async (photoId) =>
      photos.filter((photo) => photo.id !== photoId),
    ),
  };
}
