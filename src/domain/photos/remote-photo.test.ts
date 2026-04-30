import type { RemoteFamilyMapping } from "../family";
import { createBabyPhoto } from "./photo";
import {
  createBabyPhotoFromRemoteAsset,
  createRemoteBabyPhotoUploadRequest,
  mergeLocalAndRemoteBabyPhotos,
  normalizeRemoteBabyPhotoAsset,
  normalizeRemoteBabyPhotoDownloadUrl,
  normalizeRemoteBabyPhotoUploadPlan,
} from "./remote-photo";

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

describe("createRemoteBabyPhotoUploadRequest", () => {
  it("maps a local photo to remote family and child ids", () => {
    const photo = createBabyPhoto(
      {
        family_id: "local-family",
        child_id: "local-child",
        created_by: "local-parent",
        uri: "file://photo.jpg",
        file_name: "photo.jpg",
        file_size: 1024,
        mime_type: "image/jpeg",
        width: 1200,
        height: 900,
        captured_at: "2026-04-30T13:00:00.000Z",
      },
      { id: "photo-1", now: "2026-04-30T13:00:00.000Z" },
    );

    expect(createRemoteBabyPhotoUploadRequest(photo, mapping, userId)).toEqual({
      family_id: mapping.remote_family_id,
      child_id: mapping.remote_child_id,
      file_name: "photo.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      width: 1200,
      height: 900,
      captured_at: "2026-04-30T13:00:00.000Z",
    });
  });

  it("returns null when the local photo does not match the mapping", () => {
    const photo = createBabyPhoto(
      {
        family_id: "other-family",
        child_id: "local-child",
        created_by: "local-parent",
        uri: "file://photo.jpg",
      },
      { id: "photo-1", now: "2026-04-30T13:00:00.000Z" },
    );

    expect(createRemoteBabyPhotoUploadRequest(photo, mapping, userId)).toBeNull();
  });
});

describe("normalizeRemoteBabyPhotoUploadPlan", () => {
  it("accepts a valid upload plan", () => {
    expect(
      normalizeRemoteBabyPhotoUploadPlan({
        media_asset_id: "media-1",
        object_key: "families/family/photos/media-1.jpg",
        upload_url: "https://example.test/upload",
        expires_at: "2026-04-30T13:10:00.000Z",
      }),
    ).toEqual({
      media_asset_id: "media-1",
      object_key: "families/family/photos/media-1.jpg",
      upload_url: "https://example.test/upload",
      expires_at: "2026-04-30T13:10:00.000Z",
    });
  });

  it("rejects an incomplete upload plan", () => {
    expect(normalizeRemoteBabyPhotoUploadPlan({ upload_url: "x" })).toBeNull();
  });
});

describe("remote baby photo download mapping", () => {
  const asset = {
    id: "media-1",
    family_id: mapping.remote_family_id,
    child_id: mapping.remote_child_id,
    created_by: userId,
    bucket: "tinydays-media-dev",
    object_key: "families/family/photos/media-1.jpg",
    file_name: "photo.jpg",
    file_size: 1024,
    mime_type: "image/jpeg",
    width: 1200,
    height: 900,
    captured_at: "2026-04-30T13:00:00.000Z",
    created_at: "2026-04-30T13:01:00.000Z",
    updated_at: "2026-04-30T13:02:00.000Z",
  };

  it("accepts valid remote asset and download url responses", () => {
    expect(normalizeRemoteBabyPhotoAsset(asset)).toEqual(asset);
    expect(
      normalizeRemoteBabyPhotoDownloadUrl({
        media_asset_id: "media-1",
        download_url: "https://r2.example.test/download",
        expires_at: "2026-04-30T13:10:00.000Z",
      }),
    ).toEqual({
      media_asset_id: "media-1",
      download_url: "https://r2.example.test/download",
      expires_at: "2026-04-30T13:10:00.000Z",
    });
  });

  it("maps a remote uploaded asset to a local-scoped baby photo", () => {
    expect(
      createBabyPhotoFromRemoteAsset(
        asset,
        {
          media_asset_id: "media-1",
          download_url: "https://r2.example.test/download",
          expires_at: "2026-04-30T13:10:00.000Z",
        },
        mapping,
        userId,
      ),
    ).toEqual({
      id: "remote-photo-media-1",
      family_id: mapping.local_family_id,
      child_id: mapping.local_child_id,
      created_by: mapping.local_member_id,
      uri: "https://r2.example.test/download",
      width: 1200,
      height: 900,
      file_name: "photo.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      remote_media_asset_id: "media-1",
      remote_object_key: "families/family/photos/media-1.jpg",
      remote_status: "uploaded",
      captured_at: "2026-04-30T13:00:00.000Z",
      created_at: "2026-04-30T13:01:00.000Z",
      updated_at: "2026-04-30T13:02:00.000Z",
    });
  });

  it("rejects remote assets outside the mapping", () => {
    expect(
      createBabyPhotoFromRemoteAsset(
        { ...asset, family_id: "other-family" },
        {
          media_asset_id: "media-1",
          download_url: "https://r2.example.test/download",
          expires_at: "2026-04-30T13:10:00.000Z",
        },
        mapping,
        userId,
      ),
    ).toBeNull();
  });
});

describe("mergeLocalAndRemoteBabyPhotos", () => {
  it("keeps local photos and appends remote-only photos in recent-first order", () => {
    const localPhoto = createBabyPhoto(
      {
        family_id: "local-family",
        child_id: "local-child",
        created_by: "local-parent",
        uri: "file://local.jpg",
        remote_media_asset_id: "media-local",
        captured_at: "2026-04-30T13:00:00.000Z",
      },
      { id: "local", now: "2026-04-30T13:00:00.000Z" },
    );
    const duplicateRemotePhoto = {
      ...localPhoto,
      id: "remote-photo-media-local",
      uri: "https://r2.example.test/local",
      remote_status: "uploaded" as const,
    };
    const remoteOnlyPhoto = {
      ...localPhoto,
      id: "remote-photo-media-2",
      uri: "https://r2.example.test/remote",
      remote_media_asset_id: "media-2",
      captured_at: "2026-04-30T14:00:00.000Z",
    };

    expect(
      mergeLocalAndRemoteBabyPhotos(localPhoto ? [localPhoto] : [], [
        duplicateRemotePhoto,
        remoteOnlyPhoto,
      ]),
    ).toEqual([remoteOnlyPhoto, localPhoto]);
  });
});
