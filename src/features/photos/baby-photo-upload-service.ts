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
import {
  createRemoteBabyPhotoUploadQueueItem,
  remoteBabyPhotoUploadQueueRepository,
  type RemoteBabyPhotoUploadQueueItem,
  type RemoteBabyPhotoUploadQueueRepository,
} from "./remote-baby-photo-upload-queue-repository";

type RemoteUploadStatus = "uploaded" | "queued" | "failed" | "skipped";
type InitialRemoteUploadStatus = "pending" | "skipped";

export type SaveBabyPhotoWithRemoteUploadResult = {
  photos: BabyPhoto[];
  remoteUpload: Promise<RemoteUploadStatus> | null;
  remoteUploadStatus: InitialRemoteUploadStatus;
};

export type SaveBabyPhotoWithRemoteUploadDependencies = {
  localRepository: BabyPhotoRepository;
  mappingRepository: RemoteFamilyMappingRepository;
  queueRepository?: RemoteBabyPhotoUploadQueueRepository;
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
  const queueRepository =
    dependencies.queueRepository ?? remoteBabyPhotoUploadQueueRepository;
  const now = dependencies.now ?? (() => new Date().toISOString());

  await retryQueuedUploads({
    client,
    completeUpload,
    localRepository: dependencies.localRepository,
    mapping,
    now,
    queueRepository,
    requestUploadPlan,
    uploadFile,
    userId,
  });

  try {
    await uploadPhotoRemotely({
      client,
      completeUpload,
      localRepository: dependencies.localRepository,
      now,
      photo,
      requestUploadPlan,
      uploadFile,
      uploadRequest,
    });

    return "uploaded";
  } catch (error) {
    const attemptAt = now();
    await queueRepository.saveItem(
      createRemoteBabyPhotoUploadQueueItem({
        attemptCount: 1,
        lastAttemptAt: attemptAt,
        lastError: getErrorMessage(error),
        now: attemptAt,
        photo,
        userId,
      }),
    );

    return "queued";
  }
}

async function retryQueuedUploads(options: {
  client: SupabaseClient;
  completeUpload: NonNullable<
    SaveBabyPhotoWithRemoteUploadDependencies["completeUpload"]
  >;
  localRepository: BabyPhotoRepository;
  mapping: NonNullable<
    Awaited<ReturnType<RemoteFamilyMappingRepository["getMapping"]>>
  >;
  now: () => string;
  queueRepository: RemoteBabyPhotoUploadQueueRepository;
  requestUploadPlan: NonNullable<
    SaveBabyPhotoWithRemoteUploadDependencies["requestUploadPlan"]
  >;
  uploadFile: NonNullable<
    SaveBabyPhotoWithRemoteUploadDependencies["uploadFile"]
  >;
  userId: string;
}): Promise<void> {
  const queuedItems = await options.queueRepository.listItems();

  for (const item of queuedItems) {
    if (item.user_id !== options.userId) {
      continue;
    }

    const uploadRequest = createRemoteBabyPhotoUploadRequest(
      item.photo,
      options.mapping,
      options.userId,
    );

    if (uploadRequest === null) {
      continue;
    }

    try {
      await uploadPhotoRemotely({
        client: options.client,
        completeUpload: options.completeUpload,
        localRepository: options.localRepository,
        now: options.now,
        photo: item.photo,
        requestUploadPlan: options.requestUploadPlan,
        uploadFile: options.uploadFile,
        uploadRequest,
      });
      await options.queueRepository.removeItem(item.local_photo_id);
    } catch (error) {
      await options.queueRepository.saveItem(
        createRetriedQueueItem(item, options.now(), getErrorMessage(error)),
      );
    }
  }
}

async function uploadPhotoRemotely(options: {
  client: SupabaseClient;
  completeUpload: NonNullable<
    SaveBabyPhotoWithRemoteUploadDependencies["completeUpload"]
  >;
  localRepository: BabyPhotoRepository;
  now: () => string;
  photo: BabyPhoto;
  requestUploadPlan: NonNullable<
    SaveBabyPhotoWithRemoteUploadDependencies["requestUploadPlan"]
  >;
  uploadFile: NonNullable<
    SaveBabyPhotoWithRemoteUploadDependencies["uploadFile"]
  >;
  uploadRequest: RemoteBabyPhotoUploadRequest;
}): Promise<void> {
  let plan: RemoteBabyPhotoUploadPlan | null = null;

  try {
    plan = await options.requestUploadPlan(options.client, options.uploadRequest);
    await options.localRepository.savePhoto(
      withBabyPhotoRemoteUpload(options.photo, {
        mediaAssetId: plan.media_asset_id,
        objectKey: plan.object_key,
        status: "uploading",
        now: options.now(),
      }),
    );
    await options.uploadFile(options.photo, plan);
    await options.completeUpload(options.client, plan.media_asset_id);
    await options.localRepository.savePhoto(
      withBabyPhotoRemoteUpload(options.photo, {
        mediaAssetId: plan.media_asset_id,
        objectKey: plan.object_key,
        status: "uploaded",
        now: options.now(),
      }),
    );
  } catch (error) {
    if (plan !== null) {
      await options.localRepository.savePhoto(
        withBabyPhotoRemoteUpload(options.photo, {
          mediaAssetId: plan.media_asset_id,
          objectKey: plan.object_key,
          status: "failed",
          now: options.now(),
        }),
      );
    }

    throw error;
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

function createRetriedQueueItem(
  item: RemoteBabyPhotoUploadQueueItem,
  now: string,
  lastError: string,
): RemoteBabyPhotoUploadQueueItem {
  return {
    ...item,
    attempt_count: item.attempt_count + 1,
    updated_at: now,
    last_attempt_at: now,
    last_error: lastError,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "원격 사진 업로드에 실패했습니다.";
}
