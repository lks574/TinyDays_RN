export type BabyPhoto = {
  id: string;
  family_id: string;
  child_id: string;
  created_by: string;
  uri: string;
  width: number | null;
  height: number | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  remote_media_asset_id?: string | null;
  remote_object_key?: string | null;
  remote_status?: BabyPhotoRemoteStatus | null;
  captured_at: string;
  created_at: string;
  updated_at: string;
};

export type BabyPhotoRemoteStatus = "uploading" | "uploaded" | "failed";

export type CreateBabyPhotoInput = {
  family_id: string;
  child_id: string;
  created_by: string;
  uri: string;
  width?: number | null;
  height?: number | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  remote_media_asset_id?: string | null;
  remote_object_key?: string | null;
  remote_status?: BabyPhotoRemoteStatus | null;
  captured_at?: string;
};

export type CreateBabyPhotoOptions = {
  id: string;
  now: string;
};

export type BabyPhotoDateGroup = {
  dateKey: string;
  label: string;
  photos: BabyPhoto[];
};

export function createBabyPhoto(
  input: CreateBabyPhotoInput,
  options: CreateBabyPhotoOptions,
): BabyPhoto {
  return {
    id: options.id,
    family_id: input.family_id,
    child_id: input.child_id,
    created_by: input.created_by,
    uri: input.uri,
    width: input.width ?? null,
    height: input.height ?? null,
    file_name: input.file_name ?? null,
    file_size: input.file_size ?? null,
    mime_type: input.mime_type ?? null,
    remote_media_asset_id: input.remote_media_asset_id ?? null,
    remote_object_key: input.remote_object_key ?? null,
    remote_status: input.remote_status ?? null,
    captured_at: input.captured_at ?? options.now,
    created_at: options.now,
    updated_at: options.now,
  };
}

export function withBabyPhotoRemoteUpload(
  photo: BabyPhoto,
  input: {
    mediaAssetId: string;
    objectKey: string;
    status: BabyPhotoRemoteStatus;
    now: string;
  },
): BabyPhoto {
  return {
    ...photo,
    remote_media_asset_id: input.mediaAssetId,
    remote_object_key: input.objectKey,
    remote_status: input.status,
    updated_at: input.now,
  };
}

export function createBabyPhotoDateGroups(
  photos: readonly BabyPhoto[],
  options: {
    familyId: string;
    childId: string;
    now: string;
  },
): BabyPhotoDateGroup[] {
  const todayKey = getPhotoDateKey(options.now);
  const photosByDate = new Map<string, BabyPhoto[]>();

  photos
    .filter(
      (photo) =>
        photo.family_id === options.familyId && photo.child_id === options.childId,
    )
    .forEach((photo) => {
      const dateKey = getPhotoDateKey(photo.captured_at);
      const currentPhotos = photosByDate.get(dateKey) ?? [];
      photosByDate.set(dateKey, [...currentPhotos, photo]);
    });

  return [...photosByDate.entries()]
    .sort(([leftDateKey], [rightDateKey]) =>
      rightDateKey.localeCompare(leftDateKey),
    )
    .map(([dateKey, datePhotos]) => ({
      dateKey,
      label: formatPhotoDateLabel(dateKey, todayKey),
      photos: sortPhotosByRecent(datePhotos),
    }));
}

export function sortPhotosByRecent(photos: readonly BabyPhoto[]): BabyPhoto[] {
  return [...photos].sort(
    (left, right) =>
      new Date(right.captured_at).getTime() -
      new Date(left.captured_at).getTime(),
  );
}

export function getPhotoDateKey(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPhotoDateLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) {
    return "오늘";
  }

  const [, month, day] = dateKey.split("-");

  return `${Number(month)}월 ${Number(day)}일`;
}
