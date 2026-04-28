import { createBabyLog, type BabyLog, type BabyLogType } from "../baby-logs";
import { createWeeklyInsights } from "./weekly-insights";

describe("createWeeklyInsights", () => {
  const now = "2026-04-28T12:00:00.000Z";

  it("summarizes only logs in the recent 7 day range", () => {
    const insights = createWeeklyInsights(
      [
        log("feeding", "2026-04-28T08:00:00.000Z", 120, "ml"),
        log("diaper_pee", "2026-04-22T10:00:00.000Z"),
        log("feeding", "2026-04-21T08:00:00.000Z", 100, "ml"),
      ],
      now,
    );

    expect(insights.totalLogCount).toBe(2);
    expect(insights.feeding.count).toBe(1);
    expect(insights.diaper.totalCount).toBe(1);
  });

  it("calculates weekly totals and simple daily averages", () => {
    const insights = createWeeklyInsights(
      [
        log("feeding", "2026-04-28T08:00:00.000Z", 120, "ml"),
        log("feeding", "2026-04-27T08:00:00.000Z", 90, "ml"),
        log("sleep_start", "2026-04-27T10:00:00.000Z"),
        log("sleep_end", "2026-04-27T11:30:00.000Z"),
        log("diaper_pee", "2026-04-27T12:00:00.000Z"),
        log("diaper_poop", "2026-04-27T13:00:00.000Z"),
      ],
      now,
    );

    expect(insights.feeding).toEqual({
      count: 2,
      totalAmount: 210,
      unit: "ml",
      averageCountPerDay: 0.3,
      averageAmountPerDay: 30,
    });
    expect(insights.sleep).toEqual({
      count: 1,
      totalMinutes: 90,
      averageMinutesPerDay: 13,
    });
    expect(insights.diaper).toEqual({
      peeCount: 1,
      poopCount: 1,
      totalCount: 2,
      averageCountPerDay: 0.3,
    });
  });

  it("does not add ongoing sleep to total sleep minutes", () => {
    const insights = createWeeklyInsights(
      [
        log("sleep_start", "2026-04-28T08:00:00.000Z"),
        log("sleep_end", "2026-04-28T09:00:00.000Z"),
        log("sleep_start", "2026-04-28T10:00:00.000Z"),
      ],
      now,
    );

    expect(insights.sleep.totalMinutes).toBe(60);
  });

  it("returns a rule based feeding action after 3 hours", () => {
    const insights = createWeeklyInsights(
      [log("feeding", "2026-04-28T08:30:00.000Z", 120, "ml")],
      now,
    );

    expect(insights.nextAction.kind).toBe("feeding");
  });

  it("returns a sleep end action when sleep is ongoing", () => {
    const insights = createWeeklyInsights(
      [
        log("sleep_end", "2026-04-28T07:00:00.000Z"),
        log("sleep_start", "2026-04-28T10:00:00.000Z"),
      ],
      now,
    );

    expect(insights.nextAction).toEqual({
      kind: "sleep",
      title: "수면 종료 확인",
      description: "최근 수면 시작 이후 종료 기록이 없습니다.",
    });
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
