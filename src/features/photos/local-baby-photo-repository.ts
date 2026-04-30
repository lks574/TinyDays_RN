import AsyncStorage from "@react-native-async-storage/async-storage";

import { sortPhotosByRecent, type BabyPhoto } from "../../domain/photos";

type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const BABY_PHOTOS_STORAGE_KEY = "tinydays:baby_photos";

export type BabyPhotoRepository = {
  listPhotos: () => Promise<BabyPhoto[]>;
  savePhoto: (photo: BabyPhoto) => Promise<BabyPhoto[]>;
  deletePhoto: (photoId: string) => Promise<BabyPhoto[]>;
};

export function createLocalBabyPhotoRepository(
  storage: KeyValueStorage = AsyncStorage,
): BabyPhotoRepository {
  let pendingSave: Promise<void> = Promise.resolve();

  return {
    async listPhotos() {
      return readPhotos(storage);
    },
    async savePhoto(photo) {
      const saveOperation = pendingSave.then(async () => {
        const photos = await readPhotos(storage);
        const nextPhotos = sortPhotosByRecent([
          photo,
          ...photos.filter((item) => item.id !== photo.id),
        ]);

        await storage.setItem(
          BABY_PHOTOS_STORAGE_KEY,
          JSON.stringify(nextPhotos),
        );

        return nextPhotos;
      });

      pendingSave = saveOperation.then(
        () => undefined,
        () => undefined,
      );

      return saveOperation;
    },
    async deletePhoto(photoId) {
      const deleteOperation = pendingSave.then(async () => {
        const photos = await readPhotos(storage);
        const nextPhotos = photos.filter((photo) => photo.id !== photoId);

        await storage.setItem(
          BABY_PHOTOS_STORAGE_KEY,
          JSON.stringify(nextPhotos),
        );

        return nextPhotos;
      });

      pendingSave = deleteOperation.then(
        () => undefined,
        () => undefined,
      );

      return deleteOperation;
    },
  };
}

export const localBabyPhotoRepository = createLocalBabyPhotoRepository();

async function readPhotos(storage: KeyValueStorage): Promise<BabyPhoto[]> {
  const rawPhotos = await storage.getItem(BABY_PHOTOS_STORAGE_KEY);

  if (rawPhotos === null) {
    return [];
  }

  try {
    const parsedPhotos: unknown = JSON.parse(rawPhotos);

    if (!Array.isArray(parsedPhotos)) {
      return [];
    }

    return sortPhotosByRecent(parsedPhotos.filter(isBabyPhoto));
  } catch {
    return [];
  }
}

function isBabyPhoto(value: unknown): value is BabyPhoto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.family_id === "string" &&
    typeof candidate.child_id === "string" &&
    typeof candidate.created_by === "string" &&
    typeof candidate.uri === "string" &&
    isNullableNumber(candidate.width) &&
    isNullableNumber(candidate.height) &&
    isNullableString(candidate.file_name) &&
    isNullableNumber(candidate.file_size) &&
    isNullableString(candidate.mime_type) &&
    isOptionalNullableString(candidate.remote_media_asset_id) &&
    isOptionalNullableString(candidate.remote_object_key) &&
    isOptionalRemoteStatus(candidate.remote_status) &&
    typeof candidate.captured_at === "string" &&
    typeof candidate.created_at === "string" &&
    typeof candidate.updated_at === "string"
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === "number" || value === null;
}

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || isNullableString(value);
}

function isOptionalRemoteStatus(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "uploading" ||
    value === "uploaded" ||
    value === "failed"
  );
}
