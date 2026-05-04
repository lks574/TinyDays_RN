import AsyncStorage from "@react-native-async-storage/async-storage";

import { sortPhotosByRecent, type BabyPhoto } from "../../domain/photos";
import {
  createSQLiteJsonTable,
  type KeyValueStorage,
  type TinyDaysSQLiteDatabase,
} from "../../shared/local-db/tinydays-sqlite";

const BABY_PHOTOS_STORAGE_KEY = "tinydays:baby_photos";

export type BabyPhotoRepository = {
  listPhotos: () => Promise<BabyPhoto[]>;
  savePhoto: (photo: BabyPhoto) => Promise<BabyPhoto[]>;
  deletePhoto: (photoId: string) => Promise<BabyPhoto[]>;
};

export type CreateLocalBabyPhotoRepositoryOptions = {
  database?: TinyDaysSQLiteDatabase | Promise<TinyDaysSQLiteDatabase>;
  legacyStorage?: KeyValueStorage | null;
};

export function createLocalBabyPhotoRepository({
  database,
  legacyStorage = AsyncStorage,
}: CreateLocalBabyPhotoRepositoryOptions = {}): BabyPhotoRepository {
  const table = createSQLiteJsonTable({
    database,
    tableName: "baby_photo_metadata",
    legacyStorage,
    legacyStorageKey: BABY_PHOTOS_STORAGE_KEY,
    isRecord: isBabyPhoto,
    getId: (photo) => photo.id,
    getSortValue: (photo) => photo.captured_at,
    sort: sortPhotosByRecent,
  });

  return {
    async listPhotos() {
      return table.list();
    },
    async savePhoto(photo) {
      return table.upsert(photo);
    },
    async deletePhoto(photoId) {
      return table.remove(photoId);
    },
  };
}

export const localBabyPhotoRepository = createLocalBabyPhotoRepository();

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
