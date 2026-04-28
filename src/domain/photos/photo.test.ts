import {
  createBabyPhoto,
  createBabyPhotoDateGroups,
  getPhotoDateKey,
} from "./photo";

const owner = {
  family_id: "local-family",
  child_id: "local-child",
  created_by: "local-parent",
} as const;

type PhotoOwnerInput = {
  family_id: string;
  child_id: string;
  created_by: string;
};

function createPhoto(
  id: string,
  capturedAt: string,
  input: Partial<PhotoOwnerInput> = {},
) {
  return createBabyPhoto(
    {
      ...owner,
      ...input,
      uri: `file://${id}.jpg`,
      captured_at: capturedAt,
      width: 1200,
      height: 900,
      file_name: `${id}.jpg`,
      file_size: 2048,
      mime_type: "image/jpeg",
    },
    { id, now: capturedAt },
  );
}

function createLocalIso(
  year: number,
  month: number,
  day: number,
  hour: number,
): string {
  return new Date(year, month - 1, day, hour).toISOString();
}

describe("createBabyPhoto", () => {
  it("creates a family and child scoped photo metadata record", () => {
    const photo = createBabyPhoto(
      {
        ...owner,
        uri: "file://photo.jpg",
        width: 100,
        height: 80,
        file_name: "photo.jpg",
        file_size: 1024,
        mime_type: "image/jpeg",
      },
      { id: "photo-1", now: "2026-04-28T01:00:00.000Z" },
    );

    expect(photo).toEqual({
      id: "photo-1",
      ...owner,
      uri: "file://photo.jpg",
      width: 100,
      height: 80,
      file_name: "photo.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      captured_at: "2026-04-28T01:00:00.000Z",
      created_at: "2026-04-28T01:00:00.000Z",
      updated_at: "2026-04-28T01:00:00.000Z",
    });
  });
});

describe("getPhotoDateKey", () => {
  it("formats the local date key from captured_at", () => {
    expect(getPhotoDateKey(createLocalIso(2026, 4, 28, 9))).toBe("2026-04-28");
  });
});

describe("createBabyPhotoDateGroups", () => {
  it("groups selected child photos by recent date and recent photo order", () => {
    const morningPhoto = createPhoto("morning", createLocalIso(2026, 4, 28, 9));
    const eveningPhoto = createPhoto("evening", createLocalIso(2026, 4, 28, 20));
    const yesterdayPhoto = createPhoto(
      "yesterday",
      createLocalIso(2026, 4, 27, 20),
    );
    const otherChildPhoto = createPhoto(
      "other-child",
      createLocalIso(2026, 4, 28, 21),
      {
        child_id: "other-child",
      },
    );

    const groups = createBabyPhotoDateGroups(
      [morningPhoto, yesterdayPhoto, otherChildPhoto, eveningPhoto],
      {
        familyId: "local-family",
        childId: "local-child",
        now: createLocalIso(2026, 4, 28, 22),
      },
    );

    expect(groups.map((group) => group.label)).toEqual(["오늘", "4월 27일"]);
    expect(groups[0].photos.map((photo) => photo.id)).toEqual([
      "evening",
      "morning",
    ]);
    expect(groups[1].photos).toEqual([yesterdayPhoto]);
  });
});
