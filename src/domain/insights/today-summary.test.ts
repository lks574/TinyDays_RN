import { createBabyLog, type BabyLog, type BabyLogType } from "../baby-logs";
import { createTodaySummary, getTodaySummaryDateKey } from "./today-summary";

describe("getTodaySummaryDateKey", () => {
  it("returns a local date key", () => {
    expect(getTodaySummaryDateKey("2026-04-28T08:30:00.000Z")).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});

describe("createTodaySummary", () => {
  const now = "2026-04-28T12:00:00.000Z";

  it("counts only logs recorded today", () => {
    const summary = createTodaySummary(
      [
        log("feeding", "2026-04-28T08:00:00.000Z", 120, "ml"),
        log("feeding", "2026-04-27T08:00:00.000Z", 80, "ml"),
      ],
      now,
    );

    expect(summary.totalLogCount).toBe(1);
    expect(summary.feeding).toEqual({
      count: 1,
      totalAmount: 120,
      unit: "ml",
    });
  });

  it("summarizes feeding, sleep, diaper, and the last log", () => {
    const lastLog = log("diaper_poop", "2026-04-28T10:30:00.000Z");
    const summary = createTodaySummary(
      [
        log("feeding", "2026-04-28T07:00:00.000Z", 120, "ml"),
        log("sleep_start", "2026-04-28T08:00:00.000Z"),
        log("diaper_pee", "2026-04-28T08:30:00.000Z"),
        log("sleep_end", "2026-04-28T09:30:00.000Z"),
        log("feeding", "2026-04-28T10:00:00.000Z", 100, "ml"),
        lastLog,
      ],
      now,
    );

    expect(summary.feeding).toEqual({
      count: 2,
      totalAmount: 220,
      unit: "ml",
    });
    expect(summary.sleep).toEqual({
      count: 1,
      totalMinutes: 90,
    });
    expect(summary.diaper).toEqual({
      peeCount: 1,
      poopCount: 1,
      totalCount: 2,
    });
    expect(summary.lastLog?.id).toBe(lastLog.id);
  });

  it("does not add ongoing sleep to total minutes", () => {
    const summary = createTodaySummary(
      [
        log("sleep_start", "2026-04-28T08:00:00.000Z"),
        log("sleep_end", "2026-04-28T09:00:00.000Z"),
        log("sleep_start", "2026-04-28T10:00:00.000Z"),
      ],
      now,
    );

    expect(summary.sleep).toEqual({
      count: 2,
      totalMinutes: 60,
    });
  });

  it("returns empty values when there are no logs today", () => {
    const summary = createTodaySummary([], now);

    expect(summary.totalLogCount).toBe(0);
    expect(summary.feeding).toEqual({
      count: 0,
      totalAmount: 0,
      unit: null,
    });
    expect(summary.sleep).toEqual({
      count: 0,
      totalMinutes: 0,
    });
    expect(summary.diaper).toEqual({
      peeCount: 0,
      poopCount: 0,
      totalCount: 0,
    });
    expect(summary.lastLog).toBeNull();
  });
});

function log(
  logType: BabyLogType,
  recordedAt: string,
  amount: number | null = null,
  unit: string | null = null,
): BabyLog {
  return createBabyLog(
    {
      child_id: "local-child",
      family_id: "local-family",
      created_by: "local-parent",
      log_type: logType,
      recorded_at: recordedAt,
      amount,
      unit,
      source: "manual",
    },
    {
      id: `${logType}-${recordedAt}`,
      now: recordedAt,
    },
  );
}
