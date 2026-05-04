import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BabyPhoto } from "../../domain/photos";
import {
  createSQLiteSyncQueue,
  type KeyValueStorage,
  type TinyDaysSQLiteDatabase,
} from "../../shared/local-db/tinydays-sqlite";

const REMOTE_BABY_PHOTO_UPLOAD_QUEUE_STORAGE_KEY =
  "tinydays:remote_baby_photo_upload_queue";

export type RemoteBabyPhotoUploadQueueItem = {
  local_photo_id: string;
  user_id: string;
  photo: BabyPhoto;
  attempt_count: number;
  created_at: string;
  updated_at: string;
  last_attempt_at: string | null;
  last_error: string | null;
};

export type RemoteBabyPhotoUploadQueueRepository = {
  listItems: () => Promise<RemoteBabyPhotoUploadQueueItem[]>;
  saveItem: (
    item: RemoteBabyPhotoUploadQueueItem,
  ) => Promise<RemoteBabyPhotoUploadQueueItem[]>;
  removeItem: (localPhotoId: string) => Promise<RemoteBabyPhotoUploadQueueItem[]>;
};

export type CreateRemoteBabyPhotoUploadQueueRepositoryOptions = {
  database?: TinyDaysSQLiteDatabase | Promise<TinyDaysSQLiteDatabase>;
  legacyStorage?: KeyValueStorage | null;
};

export function createRemoteBabyPhotoUploadQueueRepository({
  database,
  legacyStorage = AsyncStorage,
}: CreateRemoteBabyPhotoUploadQueueRepositoryOptions = {}): RemoteBabyPhotoUploadQueueRepository {
  const queue = createSQLiteSyncQueue({
    database,
    queueType: "baby_photo_upload",
    legacyStorage,
    legacyStorageKey: REMOTE_BABY_PHOTO_UPLOAD_QUEUE_STORAGE_KEY,
    isRecord: isRemoteBabyPhotoUploadQueueItem,
    getId: (item) => item.local_photo_id,
    getUserId: (item) => item.user_id,
    getCreatedAt: (item) => item.created_at,
    sort: sortQueueItems,
  });

  return {
    async listItems() {
      return queue.list();
    },
    async saveItem(item) {
      return queue.upsert(item);
    },
    async removeItem(localPhotoId) {
      return queue.remove(localPhotoId);
    },
  };
}

export function createRemoteBabyPhotoUploadQueueItem(options: {
  photo: BabyPhoto;
  userId: string;
  now: string;
  attemptCount?: number;
  lastAttemptAt?: string | null;
  lastError?: string | null;
}): RemoteBabyPhotoUploadQueueItem {
  return {
    local_photo_id: options.photo.id,
    user_id: options.userId,
    photo: options.photo,
    attempt_count: options.attemptCount ?? 0,
    created_at: options.now,
    updated_at: options.now,
    last_attempt_at: options.lastAttemptAt ?? null,
    last_error: options.lastError ?? null,
  };
}

export const remoteBabyPhotoUploadQueueRepository =
  createRemoteBabyPhotoUploadQueueRepository();

function sortQueueItems(
  items: readonly RemoteBabyPhotoUploadQueueItem[],
): RemoteBabyPhotoUploadQueueItem[] {
  return [...items].sort(
    (left, right) =>
      new Date(left.created_at).getTime() -
      new Date(right.created_at).getTime(),
  );
}

function isRemoteBabyPhotoUploadQueueItem(
  value: unknown,
): value is RemoteBabyPhotoUploadQueueItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.local_photo_id === "string" &&
    typeof candidate.user_id === "string" &&
    isBabyPhoto(candidate.photo) &&
    typeof candidate.attempt_count === "number" &&
    typeof candidate.created_at === "string" &&
    typeof candidate.updated_at === "string" &&
    (typeof candidate.last_attempt_at === "string" ||
      candidate.last_attempt_at === null) &&
    (typeof candidate.last_error === "string" || candidate.last_error === null)
  );
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

function isOptionalNullableString(
  value: unknown,
): value is string | null | undefined {
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
