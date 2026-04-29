import { createBabyLog, type BabyLog, type BabyLogType } from "../baby-logs";
import { createDailyInsightBars } from "./daily-insight-bars";

describe("createDailyInsightBars", () => {
  const now = "2026-04-29T12:00:00.000";

  it("counts feeding and diaper logs by recorded day", () => {
    const bars = createDailyInsightBars(
      [
        log("feeding", "2026-04-29T08:00:00.000"),
        log("feeding", "2026-04-29T12:00:00.000"),
        log("diaper_pee", "2026-04-28T09:00:00.000"),
        log("diaper_poop", "2026-04-29T09:00:00.000"),
      ],
      now,
    );

    expect(bars.feed).toEqual([0, 0, 0, 0, 0, 0, 2]);
    expect(bars.diaper).toEqual([0, 0, 0, 0, 0, 1, 1]);
  });

  it("splits overnight sleep sessions across daily bars", () => {
    const bars = createDailyInsightBars(
      [
        log("sleep_start", "2026-04-28T23:00:00.000"),
        log("sleep_end", "2026-04-29T02:00:00.000"),
      ],
      now,
    );

    expect(bars.sleep).toEqual([0, 0, 0, 0, 0, 60, 120]);
  });

  it("does not add ongoing sleep sessions to daily bars", () => {
    const bars = createDailyInsightBars(
      [
        log("sleep_start", "2026-04-28T08:00:00.000"),
        log("sleep_end", "2026-04-28T09:00:00.000"),
        log("sleep_start", "2026-04-29T10:00:00.000"),
      ],
      now,
    );

    expect(bars.sleep).toEqual([0, 0, 0, 0, 0, 60, 0]);
  });

  it("counts only the portion of a completed sleep session inside the visible range", () => {
    const bars = createDailyInsightBars(
      [
        log("sleep_start", "2026-04-22T23:00:00.000"),
        log("sleep_end", "2026-04-23T01:30:00.000"),
      ],
      now,
    );

    expect(bars.sleep).toEqual([90, 0, 0, 0, 0, 0, 0]);
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
