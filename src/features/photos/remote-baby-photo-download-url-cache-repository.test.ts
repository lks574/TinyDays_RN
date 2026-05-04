import { createMemoryBabyPhotoDownloadUrlCacheRepository } from "./remote-baby-photo-download-url-cache-repository";

describe("createMemoryBabyPhotoDownloadUrlCacheRepository", () => {
  it("returns a cached signed URL while it is outside the refresh buffer", () => {
    const repository = createMemoryBabyPhotoDownloadUrlCacheRepository({
      refreshBufferMs: 60_000,
    });

    repository.saveUrl({
      media_asset_id: "media-1",
      download_url: "https://r2.example.test/media-1",
      expires_at: "2026-05-04T13:10:00.000Z",
    });

    expect(
      repository.getFreshUrl("media-1", {
        now: "2026-05-04T13:08:30.000Z",
      }),
    ).toEqual({
      media_asset_id: "media-1",
      download_url: "https://r2.example.test/media-1",
      expires_at: "2026-05-04T13:10:00.000Z",
    });
  });

  it("drops a cached signed URL when it is expired or inside the refresh buffer", () => {
    const repository = createMemoryBabyPhotoDownloadUrlCacheRepository({
      refreshBufferMs: 60_000,
    });

    repository.saveUrl({
      media_asset_id: "media-1",
      download_url: "https://r2.example.test/media-1",
      expires_at: "2026-05-04T13:10:00.000Z",
    });

    expect(
      repository.getFreshUrl("media-1", {
        now: "2026-05-04T13:09:30.000Z",
      }),
    ).toBeNull();
    expect(
      repository.getFreshUrl("media-1", {
        now: "2026-05-04T13:08:00.000Z",
      }),
    ).toBeNull();
  });
});
