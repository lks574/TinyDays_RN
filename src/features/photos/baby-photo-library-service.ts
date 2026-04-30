import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createBabyPhotoFromRemoteAsset,
  mergeLocalAndRemoteBabyPhotos,
  type BabyPhoto,
  type RemoteBabyPhotoAsset,
  type RemoteBabyPhotoDownloadUrl,
} from "../../domain/photos";
import type { RemoteFamilyMapping } from "../../domain/family";
import { getSupabaseClient } from "../auth";
import type { RemoteFamilyMappingRepository } from "../family";
import type { BabyPhotoRepository } from "./local-baby-photo-repository";
import {
  getRemoteBabyPhotoDownloadUrl,
  listUploadedRemoteBabyPhotoAssets,
} from "./remote-baby-photo-repository";

export type LoadBabyPhotosResult = {
  photos: BabyPhoto[];
  remoteStatus: "loaded" | "failed" | "skipped";
};

export type LoadBabyPhotosDependencies = {
  localRepository: BabyPhotoRepository;
  mappingRepository: RemoteFamilyMappingRepository;
  getClient?: () => SupabaseClient | null;
  listRemoteAssets?: (
    client: SupabaseClient,
    mapping: RemoteFamilyMapping,
  ) => Promise<RemoteBabyPhotoAsset[]>;
  getDownloadUrl?: (
    client: SupabaseClient,
    mediaAssetId: string,
  ) => Promise<RemoteBabyPhotoDownloadUrl>;
};

export async function loadBabyPhotosWithRemoteDownloads(
  dependencies: LoadBabyPhotosDependencies,
): Promise<LoadBabyPhotosResult> {
  const localPhotos = await dependencies.localRepository.listPhotos();
  const client = (dependencies.getClient ?? getSupabaseClient)();

  if (client === null) {
    return { photos: localPhotos, remoteStatus: "skipped" };
  }

  try {
    const userId = await getCurrentUserId(client);

    if (userId === null) {
      return { photos: localPhotos, remoteStatus: "skipped" };
    }

    const mapping = await dependencies.mappingRepository.getMapping(userId);

    if (mapping === null) {
      return { photos: localPhotos, remoteStatus: "skipped" };
    }

    const remotePhotos = await loadRemotePhotos(client, mapping, userId, dependencies);

    return {
      photos: mergeLocalAndRemoteBabyPhotos(localPhotos, remotePhotos),
      remoteStatus: "loaded",
    };
  } catch {
    return { photos: localPhotos, remoteStatus: "failed" };
  }
}

async function loadRemotePhotos(
  client: SupabaseClient,
  mapping: RemoteFamilyMapping,
  userId: string,
  dependencies: LoadBabyPhotosDependencies,
): Promise<BabyPhoto[]> {
  const listRemoteAssets =
    dependencies.listRemoteAssets ?? listUploadedRemoteBabyPhotoAssets;
  const getDownloadUrl =
    dependencies.getDownloadUrl ?? getRemoteBabyPhotoDownloadUrl;
  const assets = await listRemoteAssets(client, mapping);
  const remotePhotos = await Promise.all(
    assets.map(async (asset) => {
      const downloadUrl = await getDownloadUrl(client, asset.id);

      return createBabyPhotoFromRemoteAsset(asset, downloadUrl, mapping, userId);
    }),
  );

  return remotePhotos.filter((photo): photo is BabyPhoto => photo !== null);
}

async function getCurrentUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getSession();

  if (error !== null) {
    return null;
  }

  return data.session?.user.id ?? null;
}
