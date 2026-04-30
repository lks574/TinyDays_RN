import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeRemoteBabyPhotoAsset,
  normalizeRemoteBabyPhotoDownloadUrl,
  normalizeRemoteBabyPhotoUploadPlan,
  type RemoteBabyPhotoAsset,
  type RemoteBabyPhotoDownloadUrl,
  type RemoteBabyPhotoUploadPlan,
  type RemoteBabyPhotoUploadRequest,
} from "../../domain/photos";
import type { RemoteFamilyMapping } from "../../domain/family";

type FunctionInvokeResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

const REMOTE_PHOTO_SELECT = [
  "id",
  "family_id",
  "child_id",
  "created_by",
  "bucket",
  "object_key",
  "file_name",
  "file_size",
  "mime_type",
  "width",
  "height",
  "captured_at",
  "created_at",
  "updated_at",
].join(", ");

export async function createRemoteBabyPhotoUpload(
  client: SupabaseClient,
  request: RemoteBabyPhotoUploadRequest,
): Promise<RemoteBabyPhotoUploadPlan> {
  const { data, error } = (await client.functions.invoke("media-r2-url", {
    body: {
      action: "create_upload",
      ...request,
    },
  })) as FunctionInvokeResult<unknown>;

  if (error !== null) {
    throw new Error(error.message);
  }

  const plan = normalizeRemoteBabyPhotoUploadPlan(data);

  if (plan === null) {
    throw new Error("원격 사진 업로드 응답이 올바르지 않습니다.");
  }

  return plan;
}

export async function completeRemoteBabyPhotoUpload(
  client: SupabaseClient,
  mediaAssetId: string,
): Promise<void> {
  const { error } = (await client.functions.invoke("media-r2-url", {
    body: {
      action: "complete_upload",
      media_asset_id: mediaAssetId,
    },
  })) as FunctionInvokeResult<unknown>;

  if (error !== null) {
    throw new Error(error.message);
  }
}

export async function getRemoteBabyPhotoDownloadUrl(
  client: SupabaseClient,
  mediaAssetId: string,
): Promise<RemoteBabyPhotoDownloadUrl> {
  const { data, error } = (await client.functions.invoke("media-r2-url", {
    body: {
      action: "create_download",
      media_asset_id: mediaAssetId,
    },
  })) as FunctionInvokeResult<unknown>;

  if (error !== null) {
    throw new Error(error.message);
  }

  const downloadUrl = normalizeRemoteBabyPhotoDownloadUrl(data);

  if (downloadUrl === null) {
    throw new Error("원격 사진 다운로드 응답이 올바르지 않습니다.");
  }

  return downloadUrl;
}

export async function deleteRemoteBabyPhoto(
  client: SupabaseClient,
  mediaAssetId: string,
): Promise<void> {
  const { error } = (await client.functions.invoke("media-r2-url", {
    body: {
      action: "delete_photo",
      media_asset_id: mediaAssetId,
    },
  })) as FunctionInvokeResult<unknown>;

  if (error !== null) {
    throw new Error(error.message);
  }
}

export async function listUploadedRemoteBabyPhotoAssets(
  client: SupabaseClient,
  mapping: RemoteFamilyMapping,
): Promise<RemoteBabyPhotoAsset[]> {
  const { data, error } = (await client
    .from("media_assets")
    .select(REMOTE_PHOTO_SELECT)
    .eq("family_id", mapping.remote_family_id)
    .eq("child_id", mapping.remote_child_id)
    .eq("asset_type", "photo")
    .eq("status", "uploaded")
    .order("captured_at", { ascending: false })) as QueryResult<unknown>;

  if (error !== null) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => normalizeRemoteBabyPhotoAsset(row))
    .filter((asset): asset is RemoteBabyPhotoAsset => asset !== null);
}
