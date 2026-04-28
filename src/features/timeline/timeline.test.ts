import { createBabyLog, type BabyLogType } from "../../domain/baby-logs";
import {
  createTimelineDateOptions,
  getLogsForTimelineDate,
  getTimelineDateKey,
} from "./timeline";

const baseInput = {
  child_id: "local-child",
  family_id: "local-family",
  created_by: "local-parent",
} as const;

function createLog(
  id: string,
  recordedAt: string,
  logType: BabyLogType = "memo",
) {
  return createBabyLog(
    {
      ...baseInput,
      log_type: logType,
      recorded_at: recordedAt,
    },
    { id, now: recordedAt },
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

describe("getTimelineDateKey", () => {
  it("formats a local date key from recorded_at", () => {
    expect(getTimelineDateKey(createLocalIso(2026, 4, 28, 9))).toBe("2026-04-28");
  });
});

describe("createTimelineDateOptions", () => {
  it("includes today and recorded dates in recent-first order", () => {
    const options = createTimelineDateOptions(
      [
        createLog("yesterday", createLocalIso(2026, 4, 27, 9)),
        createLog("today-1", createLocalIso(2026, 4, 28, 9)),
        createLog("today-2", createLocalIso(2026, 4, 28, 10)),
      ],
      createLocalIso(2026, 4, 28, 11),
    );

    expect(options).toEqual([
      { key: "2026-04-28", label: "오늘", count: 2 },
      { key: "2026-04-27", label: "4월 27일", count: 1 },
    ]);
  });

  it("keeps today selectable when there are no logs", () => {
    expect(createTimelineDateOptions([], createLocalIso(2026, 4, 28, 11))).toEqual([
      { key: "2026-04-28", label: "오늘", count: 0 },
    ]);
  });
});

describe("getLogsForTimelineDate", () => {
  it("returns selected date logs in chronological order", () => {
    const morningLog = createLog("morning", createLocalIso(2026, 4, 28, 9));
    const eveningLog = createLog("evening", createLocalIso(2026, 4, 28, 20));
    const yesterdayLog = createLog("yesterday", createLocalIso(2026, 4, 27, 20));

    expect(
      getLogsForTimelineDate(
        [eveningLog, yesterdayLog, morningLog],
        "2026-04-28",
        "all",
      ).map((log) => log.id),
    ).toEqual(["morning", "evening"]);
  });

  it("filters selected date logs by type", () => {
    const feedingLog = createLog("feeding", createLocalIso(2026, 4, 28, 9), "feeding");
    const memoLog = createLog("memo", createLocalIso(2026, 4, 28, 10), "memo");

    expect(
      getLogsForTimelineDate([memoLog, feedingLog], "2026-04-28", "feeding"),
    ).toEqual([feedingLog]);
  });
});
