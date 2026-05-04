import {
  isRemoteBabyPhotoDownloadUrlFresh,
  type RemoteBabyPhotoDownloadUrl,
} from "../../domain/photos";

export type BabyPhotoDownloadUrlCacheRepository = {
  getFreshUrl: (
    mediaAssetId: string,
    options: { now: string },
  ) => RemoteBabyPhotoDownloadUrl | null;
  saveUrl: (downloadUrl: RemoteBabyPhotoDownloadUrl) => void;
  removeUrl: (mediaAssetId: string) => void;
};

export type CreateMemoryBabyPhotoDownloadUrlCacheRepositoryOptions = {
  refreshBufferMs?: number;
};

export function createMemoryBabyPhotoDownloadUrlCacheRepository({
  refreshBufferMs,
}: CreateMemoryBabyPhotoDownloadUrlCacheRepositoryOptions = {}): BabyPhotoDownloadUrlCacheRepository {
  const urls = new Map<string, RemoteBabyPhotoDownloadUrl>();

  return {
    getFreshUrl(mediaAssetId, options) {
      const cachedUrl = urls.get(mediaAssetId);

      if (cachedUrl === undefined) {
        return null;
      }

      if (
        !isRemoteBabyPhotoDownloadUrlFresh(cachedUrl, {
          now: options.now,
          refreshBufferMs,
        })
      ) {
        urls.delete(mediaAssetId);
        return null;
      }

      return cachedUrl;
    },
    saveUrl(downloadUrl) {
      urls.set(downloadUrl.media_asset_id, downloadUrl);
    },
    removeUrl(mediaAssetId) {
      urls.delete(mediaAssetId);
    },
  };
}

export const babyPhotoDownloadUrlCacheRepository =
  createMemoryBabyPhotoDownloadUrlCacheRepository();
