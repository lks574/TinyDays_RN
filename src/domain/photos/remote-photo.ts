import type { RemoteFamilyMapping } from "../family";
import type { BabyPhoto } from "./photo";

export type RemoteBabyPhotoUploadRequest = {
  family_id: string;
  child_id: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  captured_at: string;
};

export type RemoteBabyPhotoUploadPlan = {
  media_asset_id: string;
  object_key: string;
  upload_url: string;
  expires_at: string;
};

export type RemoteBabyPhotoDownloadUrl = {
  media_asset_id: string;
  download_url: string;
  expires_at: string;
};

export function createRemoteBabyPhotoUploadRequest(
  photo: BabyPhoto,
  mapping: RemoteFamilyMapping,
  userId: string,
): RemoteBabyPhotoUploadRequest | null {
  if (
    mapping.user_id !== userId ||
    photo.family_id !== mapping.local_family_id ||
    photo.child_id !== mapping.local_child_id ||
    photo.created_by !== mapping.local_member_id
  ) {
    return null;
  }

  return {
    family_id: mapping.remote_family_id,
    child_id: mapping.remote_child_id,
    file_name: photo.file_name,
    file_size: photo.file_size,
    mime_type: photo.mime_type,
    width: photo.width,
    height: photo.height,
    captured_at: photo.captured_at,
  };
}

export function normalizeRemoteBabyPhotoUploadPlan(
  value: unknown,
): RemoteBabyPhotoUploadPlan | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.media_asset_id !== "string" ||
    typeof candidate.object_key !== "string" ||
    typeof candidate.upload_url !== "string" ||
    typeof candidate.expires_at !== "string"
  ) {
    return null;
  }

  return {
    media_asset_id: candidate.media_asset_id,
    object_key: candidate.object_key,
    upload_url: candidate.upload_url,
    expires_at: candidate.expires_at,
  };
}
