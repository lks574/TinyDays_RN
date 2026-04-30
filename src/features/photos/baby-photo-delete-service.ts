import type { SupabaseClient } from "@supabase/supabase-js";

import type { BabyPhoto } from "../../domain/photos";
import { getSupabaseClient } from "../auth";
import type { RemoteFamilyMappingRepository } from "../family";
import type { BabyPhotoRepository } from "./local-baby-photo-repository";
import { deleteRemoteBabyPhoto } from "./remote-baby-photo-repository";
import {
  remoteBabyPhotoUploadQueueRepository,
  type RemoteBabyPhotoUploadQueueRepository,
} from "./remote-baby-photo-upload-queue-repository";

type RemoteDeleteStatus = "deleted" | "failed" | "skipped";
type InitialRemoteDeleteStatus = "pending" | "skipped";

export type DeleteBabyPhotoWithRemoteCleanupResult = {
  photos: BabyPhoto[];
  remoteDelete: Promise<RemoteDeleteStatus> | null;
  remoteDeleteStatus: InitialRemoteDeleteStatus;
};

export type DeleteBabyPhotoWithRemoteCleanupDependencies = {
  localRepository: BabyPhotoRepository;
  mappingRepository: RemoteFamilyMappingRepository;
  queueRepository?: RemoteBabyPhotoUploadQueueRepository;
  getClient?: () => SupabaseClient | null;
  deleteRemote?: (client: SupabaseClient, mediaAssetId: string) => Promise<void>;
};

export async function deleteBabyPhotoWithRemoteCleanup(
  photo: BabyPhoto,
  dependencies: DeleteBabyPhotoWithRemoteCleanupDependencies,
): Promise<DeleteBabyPhotoWithRemoteCleanupResult> {
  const queueRepository =
    dependencies.queueRepository ?? remoteBabyPhotoUploadQueueRepository;
  const [photos] = await Promise.all([
    dependencies.localRepository.deletePhoto(photo.id),
    queueRepository.removeItem(photo.id),
  ]);
  const client = (dependencies.getClient ?? getSupabaseClient)();

  if (client === null || !hasRemoteMediaAsset(photo)) {
    return { photos, remoteDelete: null, remoteDeleteStatus: "skipped" };
  }

  return {
    photos,
    remoteDelete: runRemoteDelete(photo, client, dependencies),
    remoteDeleteStatus: "pending",
  };
}

async function runRemoteDelete(
  photo: BabyPhoto,
  client: SupabaseClient,
  dependencies: DeleteBabyPhotoWithRemoteCleanupDependencies,
): Promise<RemoteDeleteStatus> {
  const userId = await getCurrentUserId(client);

  if (userId === null) {
    return "skipped";
  }

  const mapping = await dependencies.mappingRepository.getMapping(userId);

  if (
    mapping === null ||
    mapping.user_id !== userId ||
    photo.family_id !== mapping.local_family_id ||
    photo.child_id !== mapping.local_child_id
  ) {
    return "skipped";
  }

  try {
    const deleteRemote = dependencies.deleteRemote ?? deleteRemoteBabyPhoto;
    if (!hasRemoteMediaAsset(photo)) {
      return "skipped";
    }

    await deleteRemote(client, photo.remote_media_asset_id);

    return "deleted";
  } catch {
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

function hasRemoteMediaAsset(
  photo: BabyPhoto,
): photo is BabyPhoto & { remote_media_asset_id: string } {
  return (
    typeof photo.remote_media_asset_id === "string" &&
    photo.remote_media_asset_id.length > 0
  );
}
