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

export const REMOTE_BABY_PHOTO_DOWNLOAD_URL_REFRESH_BUFFER_MS = 60 * 1000;

export type RemoteBabyPhotoAsset = {
  id: string;
  family_id: string;
  child_id: string;
  created_by: string;
  bucket: string;
  object_key: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  captured_at: string;
  created_at: string;
  updated_at: string;
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

export function normalizeRemoteBabyPhotoDownloadUrl(
  value: unknown,
): RemoteBabyPhotoDownloadUrl | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.media_asset_id !== "string" ||
    typeof candidate.download_url !== "string" ||
    typeof candidate.expires_at !== "string"
  ) {
    return null;
  }

  return {
    media_asset_id: candidate.media_asset_id,
    download_url: candidate.download_url,
    expires_at: candidate.expires_at,
  };
}

export function isRemoteBabyPhotoDownloadUrlFresh(
  downloadUrl: RemoteBabyPhotoDownloadUrl,
  options: {
    now: string;
    refreshBufferMs?: number;
  },
): boolean {
  const expiresAt = new Date(downloadUrl.expires_at).getTime();
  const now = new Date(options.now).getTime();

  if (!Number.isFinite(expiresAt) || !Number.isFinite(now)) {
    return false;
  }

  const refreshBufferMs =
    options.refreshBufferMs ??
    REMOTE_BABY_PHOTO_DOWNLOAD_URL_REFRESH_BUFFER_MS;

  return expiresAt - now > refreshBufferMs;
}

export function normalizeRemoteBabyPhotoAsset(
  value: unknown,
): RemoteBabyPhotoAsset | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.family_id !== "string" ||
    typeof candidate.child_id !== "string" ||
    typeof candidate.created_by !== "string" ||
    typeof candidate.bucket !== "string" ||
    typeof candidate.object_key !== "string" ||
    !isNullableString(candidate.file_name) ||
    !isNullableNumber(candidate.file_size) ||
    !isNullableString(candidate.mime_type) ||
    !isNullableNumber(candidate.width) ||
    !isNullableNumber(candidate.height) ||
    !isNullableString(candidate.captured_at) ||
    typeof candidate.created_at !== "string" ||
    typeof candidate.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    family_id: candidate.family_id,
    child_id: candidate.child_id,
    created_by: candidate.created_by,
    bucket: candidate.bucket,
    object_key: candidate.object_key,
    file_name: candidate.file_name,
    file_size: candidate.file_size,
    mime_type: candidate.mime_type,
    width: candidate.width,
    height: candidate.height,
    captured_at: candidate.captured_at ?? candidate.created_at,
    created_at: candidate.created_at,
    updated_at: candidate.updated_at,
  };
}

export function createBabyPhotoFromRemoteAsset(
  asset: RemoteBabyPhotoAsset,
  downloadUrl: RemoteBabyPhotoDownloadUrl,
  mapping: RemoteFamilyMapping,
  userId: string,
): BabyPhoto | null {
  if (
    mapping.user_id !== userId ||
    asset.family_id !== mapping.remote_family_id ||
    asset.child_id !== mapping.remote_child_id ||
    downloadUrl.media_asset_id !== asset.id
  ) {
    return null;
  }

  return {
    id: `remote-photo-${asset.id}`,
    family_id: mapping.local_family_id,
    child_id: mapping.local_child_id,
    created_by: mapping.local_member_id,
    uri: downloadUrl.download_url,
    width: asset.width,
    height: asset.height,
    file_name: asset.file_name,
    file_size: asset.file_size,
    mime_type: asset.mime_type,
    remote_media_asset_id: asset.id,
    remote_object_key: asset.object_key,
    remote_status: "uploaded",
    captured_at: asset.captured_at,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
  };
}

export function mergeLocalAndRemoteBabyPhotos(
  localPhotos: readonly BabyPhoto[],
  remotePhotos: readonly BabyPhoto[],
): BabyPhoto[] {
  const localRemoteAssetIds = new Set(
    localPhotos
      .map((photo) => photo.remote_media_asset_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0),
  );
  const seenRemoteAssetIds = new Set<string>();
  const uniqueRemotePhotos = remotePhotos.filter((photo) => {
    const remoteAssetId = photo.remote_media_asset_id;

    if (remoteAssetId === null || remoteAssetId === undefined) {
      return false;
    }

    if (
      localRemoteAssetIds.has(remoteAssetId) ||
      seenRemoteAssetIds.has(remoteAssetId)
    ) {
      return false;
    }

    seenRemoteAssetIds.add(remoteAssetId);

    return true;
  });

  return [...localPhotos, ...uniqueRemotePhotos].sort(
    (left, right) =>
      new Date(right.captured_at).getTime() -
      new Date(left.captured_at).getTime(),
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === "number" || value === null;
}
