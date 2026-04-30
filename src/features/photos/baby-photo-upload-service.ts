import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createRemoteBabyPhotoUploadRequest,
  withBabyPhotoRemoteUpload,
  type BabyPhoto,
  type RemoteBabyPhotoUploadPlan,
  type RemoteBabyPhotoUploadRequest,
} from "../../domain/photos";
import { getSupabaseClient } from "../auth";
import type { RemoteFamilyMappingRepository } from "../family";
import type { BabyPhotoRepository } from "./local-baby-photo-repository";
import {
  completeRemoteBabyPhotoUpload,
  createRemoteBabyPhotoUpload,
} from "./remote-baby-photo-repository";

type RemoteUploadStatus = "uploaded" | "failed" | "skipped";
type InitialRemoteUploadStatus = "pending" | "skipped";

export type SaveBabyPhotoWithRemoteUploadResult = {
  photos: BabyPhoto[];
  remoteUpload: Promise<RemoteUploadStatus> | null;
  remoteUploadStatus: InitialRemoteUploadStatus;
};

export type SaveBabyPhotoWithRemoteUploadDependencies = {
  localRepository: BabyPhotoRepository;
  mappingRepository: RemoteFamilyMappingRepository;
  getClient?: () => SupabaseClient | null;
  requestUploadPlan?: (
    client: SupabaseClient,
    request: RemoteBabyPhotoUploadRequest,
  ) => Promise<RemoteBabyPhotoUploadPlan>;
  uploadFile?: (
    photo: BabyPhoto,
    plan: RemoteBabyPhotoUploadPlan,
  ) => Promise<void>;
  completeUpload?: (client: SupabaseClient, mediaAssetId: string) => Promise<void>;
  now?: () => string;
};

export async function saveBabyPhotoWithRemoteUpload(
  photo: BabyPhoto,
  dependencies: SaveBabyPhotoWithRemoteUploadDependencies,
): Promise<SaveBabyPhotoWithRemoteUploadResult> {
  const photos = await dependencies.localRepository.savePhoto(photo);
  const client = (dependencies.getClient ?? getSupabaseClient)();

  if (client === null) {
    return { photos, remoteUpload: null, remoteUploadStatus: "skipped" };
  }

  return {
    photos,
    remoteUpload: runRemoteUpload(photo, client, dependencies),
    remoteUploadStatus: "pending",
  };
}

async function runRemoteUpload(
  photo: BabyPhoto,
  client: SupabaseClient,
  dependencies: SaveBabyPhotoWithRemoteUploadDependencies,
): Promise<RemoteUploadStatus> {
  const userId = await getCurrentUserId(client);

  if (userId === null) {
    return "skipped";
  }

  const mapping = await dependencies.mappingRepository.getMapping(userId);

  if (mapping === null) {
    return "skipped";
  }

  const uploadRequest = createRemoteBabyPhotoUploadRequest(photo, mapping, userId);

  if (uploadRequest === null) {
    return "skipped";
  }

  const requestUploadPlan =
    dependencies.requestUploadPlan ?? createRemoteBabyPhotoUpload;
  const uploadFile = dependencies.uploadFile ?? uploadBabyPhotoFile;
  const completeUpload =
    dependencies.completeUpload ?? completeRemoteBabyPhotoUpload;
  const now = dependencies.now ?? (() => new Date().toISOString());
  let plan: RemoteBabyPhotoUploadPlan | null = null;

  try {
    plan = await requestUploadPlan(client, uploadRequest);
    await dependencies.localRepository.savePhoto(
      withBabyPhotoRemoteUpload(photo, {
        mediaAssetId: plan.media_asset_id,
        objectKey: plan.object_key,
        status: "uploading",
        now: now(),
      }),
    );
    await uploadFile(photo, plan);
    await completeUpload(client, plan.media_asset_id);
    await dependencies.localRepository.savePhoto(
      withBabyPhotoRemoteUpload(photo, {
        mediaAssetId: plan.media_asset_id,
        objectKey: plan.object_key,
        status: "uploaded",
        now: now(),
      }),
    );

    return "uploaded";
  } catch {
    if (plan !== null) {
      await dependencies.localRepository.savePhoto(
        withBabyPhotoRemoteUpload(photo, {
          mediaAssetId: plan.media_asset_id,
          objectKey: plan.object_key,
          status: "failed",
          now: now(),
        }),
      );
    }

    return "failed";
  }
}

async function getCurrentUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getSession();

  if (error !== null) {
    return null;
  }

  return data.session?.user.id ?? null;
}

async function uploadBabyPhotoFile(
  photo: BabyPhoto,
  plan: RemoteBabyPhotoUploadPlan,
): Promise<void> {
  const fileResponse = await fetch(photo.uri);
  const fileBody = await fileResponse.blob();
  const uploadResponse = await fetch(plan.upload_url, {
    method: "PUT",
    body: fileBody,
    headers: createUploadHeaders(photo),
  });

  if (!uploadResponse.ok) {
    throw new Error("사진 원본 업로드에 실패했습니다.");
  }
}

function createUploadHeaders(photo: BabyPhoto): Record<string, string> {
  if (photo.mime_type === null) {
    return {};
  }

  return {
    "content-type": photo.mime_type,
  };
}
