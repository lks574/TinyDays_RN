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
import {
  babyPhotoDownloadUrlCacheRepository,
  type BabyPhotoDownloadUrlCacheRepository,
} from "./remote-baby-photo-download-url-cache-repository";

export type LoadBabyPhotosResult = {
  photos: BabyPhoto[];
  remoteStatus: "loaded" | "failed" | "skipped";
};

export type RefreshBabyPhotoDownloadUrlResult = {
  photo: BabyPhoto;
  status: "refreshed" | "failed" | "skipped";
};

export type LoadBabyPhotosDependencies = {
  localRepository: BabyPhotoRepository;
  mappingRepository: RemoteFamilyMappingRepository;
  getClient?: () => SupabaseClient | null;
  now?: () => string;
  downloadUrlCacheRepository?: BabyPhotoDownloadUrlCacheRepository;
  listRemoteAssets?: (
    client: SupabaseClient,
    mapping: RemoteFamilyMapping,
  ) => Promise<RemoteBabyPhotoAsset[]>;
  getDownloadUrl?: (
    client: SupabaseClient,
    mediaAssetId: string,
  ) => Promise<RemoteBabyPhotoDownloadUrl>;
};

export type RefreshBabyPhotoDownloadUrlDependencies = Pick<
  LoadBabyPhotosDependencies,
  | "mappingRepository"
  | "getClient"
  | "now"
  | "downloadUrlCacheRepository"
  | "getDownloadUrl"
>;

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
      const downloadUrl = await getCachedOrFreshDownloadUrl(
        client,
        asset.id,
        getDownloadUrl,
        dependencies,
      );

      return createBabyPhotoFromRemoteAsset(asset, downloadUrl, mapping, userId);
    }),
  );

  return remotePhotos.filter((photo): photo is BabyPhoto => photo !== null);
}

export async function refreshBabyPhotoDownloadUrl(
  photo: BabyPhoto,
  dependencies: RefreshBabyPhotoDownloadUrlDependencies,
): Promise<RefreshBabyPhotoDownloadUrlResult> {
  const mediaAssetId = photo.remote_media_asset_id;

  if (mediaAssetId === null || mediaAssetId === undefined || mediaAssetId === "") {
    return { photo, status: "skipped" };
  }

  const client = (dependencies.getClient ?? getSupabaseClient)();

  if (client === null) {
    return { photo, status: "skipped" };
  }

  try {
    const userId = await getCurrentUserId(client);

    if (userId === null) {
      return { photo, status: "skipped" };
    }

    const mapping = await dependencies.mappingRepository.getMapping(userId);

    if (
      mapping === null ||
      photo.family_id !== mapping.local_family_id ||
      photo.child_id !== mapping.local_child_id
    ) {
      return { photo, status: "skipped" };
    }

    const getDownloadUrl =
      dependencies.getDownloadUrl ?? getRemoteBabyPhotoDownloadUrl;
    const downloadUrl = await getDownloadUrl(client, mediaAssetId);

    if (downloadUrl.media_asset_id !== mediaAssetId) {
      return { photo, status: "failed" };
    }

    const cacheRepository =
      dependencies.downloadUrlCacheRepository ??
      babyPhotoDownloadUrlCacheRepository;
    cacheRepository.saveUrl(downloadUrl);

    return {
      photo: {
        ...photo,
        uri: downloadUrl.download_url,
      },
      status: "refreshed",
    };
  } catch {
    return { photo, status: "failed" };
  }
}

async function getCachedOrFreshDownloadUrl(
  client: SupabaseClient,
  mediaAssetId: string,
  getDownloadUrl: (
    client: SupabaseClient,
    mediaAssetId: string,
  ) => Promise<RemoteBabyPhotoDownloadUrl>,
  dependencies: LoadBabyPhotosDependencies,
): Promise<RemoteBabyPhotoDownloadUrl> {
  const now = (dependencies.now ?? createCurrentIso)();
  const cacheRepository =
    dependencies.downloadUrlCacheRepository ?? babyPhotoDownloadUrlCacheRepository;
  const cachedUrl = cacheRepository.getFreshUrl(mediaAssetId, { now });

  if (cachedUrl !== null) {
    return cachedUrl;
  }

  const downloadUrl = await getDownloadUrl(client, mediaAssetId);

  if (downloadUrl.media_asset_id === mediaAssetId) {
    cacheRepository.saveUrl(downloadUrl);
  }

  return downloadUrl;
}

async function getCurrentUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getSession();

  if (error !== null) {
    return null;
  }

  return data.session?.user.id ?? null;
}

function createCurrentIso(): string {
  return new Date().toISOString();
}
