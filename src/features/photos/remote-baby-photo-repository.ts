import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeRemoteBabyPhotoUploadPlan,
  type RemoteBabyPhotoDownloadUrl,
  type RemoteBabyPhotoUploadPlan,
  type RemoteBabyPhotoUploadRequest,
} from "../../domain/photos";

type FunctionInvokeResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

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

  if (
    typeof data !== "object" ||
    data === null ||
    typeof (data as Record<string, unknown>).media_asset_id !== "string" ||
    typeof (data as Record<string, unknown>).download_url !== "string" ||
    typeof (data as Record<string, unknown>).expires_at !== "string"
  ) {
    throw new Error("원격 사진 다운로드 응답이 올바르지 않습니다.");
  }

  return data as RemoteBabyPhotoDownloadUrl;
}
