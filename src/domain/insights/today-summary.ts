import type { BabyLog } from "../baby-logs";

export type TodaySummary = {
  dateKey: string;
  totalLogCount: number;
  feeding: {
    count: number;
    totalAmount: number;
    unit: string | null;
  };
  sleep: {
    count: number;
    totalMinutes: number;
  };
  diaper: {
    peeCount: number;
    poopCount: number;
    totalCount: number;
  };
  lastLog: BabyLog | null;
};

export function createTodaySummary(
  logs: readonly BabyLog[],
  now: string,
): TodaySummary {
  const dateKey = getTodaySummaryDateKey(now);
  const todayLogs = logs
    .filter((log) => getTodaySummaryDateKey(log.recorded_at) === dateKey)
    .sort(
      (left, right) =>
        new Date(left.recorded_at).getTime() -
        new Date(right.recorded_at).getTime(),
    );

  const feedingLogs = todayLogs.filter((log) => log.log_type === "feeding");
  const peeCount = todayLogs.filter((log) => log.log_type === "diaper_pee").length;
  const poopCount = todayLogs.filter(
    (log) => log.log_type === "diaper_poop",
  ).length;

  return {
    dateKey,
    totalLogCount: todayLogs.length,
    feeding: {
      count: feedingLogs.length,
      totalAmount: sumFeedingAmount(feedingLogs),
      unit: getFeedingUnit(feedingLogs),
    },
    sleep: {
      count: todayLogs.filter((log) => log.log_type === "sleep_start").length,
      totalMinutes: sumCompletedSleepMinutes(todayLogs),
    },
    diaper: {
      peeCount,
      poopCount,
      totalCount: peeCount + poopCount,
    },
    lastLog: todayLogs.at(-1) ?? null,
  };
}

export function getTodaySummaryDateKey(recordedAt: string): string {
  const date = new Date(recordedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function sumFeedingAmount(logs: readonly BabyLog[]): number {
  return logs.reduce((total, log) => {
    if (log.amount === null || log.unit !== "ml") {
      return total;
    }

    return total + log.amount;
  }, 0);
}

function getFeedingUnit(logs: readonly BabyLog[]): string | null {
  return logs.some((log) => log.amount !== null && log.unit === "ml") ? "ml" : null;
}

function sumCompletedSleepMinutes(logs: readonly BabyLog[]): number {
  let lastSleepStart: BabyLog | null = null;
  let totalMinutes = 0;

  logs.forEach((log) => {
    if (log.log_type === "sleep_start") {
      lastSleepStart = log;
      return;
    }

    if (log.log_type !== "sleep_end" || lastSleepStart === null) {
      return;
    }

    const durationMinutes = Math.max(
      0,
      Math.round(
        (new Date(log.recorded_at).getTime() -
          new Date(lastSleepStart.recorded_at).getTime()) /
          60000,
      ),
    );

    totalMinutes += durationMinutes;
    lastSleepStart = null;
  });

  return totalMinutes;
}
