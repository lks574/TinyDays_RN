import type { RemoteFamilyMapping } from "../family";
import { createBabyPhoto } from "./photo";
import {
  createRemoteBabyPhotoUploadRequest,
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
