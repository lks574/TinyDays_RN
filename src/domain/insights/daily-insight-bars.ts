import type { BabyLog } from "../baby-logs";

export type DailyInsightBars = {
  days: string[];
  feed: number[];
  sleep: number[];
  diaper: number[];
};

type RecentDay = {
  key: string;
  weekday: string;
  start: Date;
  end: Date;
};

const DAILY_INSIGHT_DAY_COUNT = 7;

export function createDailyInsightBars(
  logs: readonly BabyLog[],
  now: string,
): DailyInsightBars {
  const days = createRecentDays(now);
  const feed = days.map((day) =>
    logs.filter((log) => getDateKey(log.recorded_at) === day.key).filter(
      (log) => log.log_type === "feeding",
    ).length,
  );
  const diaper = days.map((day) =>
    logs.filter((log) => getDateKey(log.recorded_at) === day.key).filter(
      (log) => log.log_type === "diaper_pee" || log.log_type === "diaper_poop",
    ).length,
  );

  return {
    days: days.map((day) => day.weekday),
    feed,
    sleep: sumCompletedSleepMinutesByDay(logs, days),
    diaper,
  };
}

function createRecentDays(now: string): RecentDay[] {
  const nowDate = new Date(now);
  const end = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
  );

  return Array.from({ length: DAILY_INSIGHT_DAY_COUNT }, (_, index) => {
    const start = new Date(end);
    start.setDate(end.getDate() - (DAILY_INSIGHT_DAY_COUNT - 1 - index));

    const dayEnd = new Date(start);
    dayEnd.setDate(start.getDate() + 1);

    return {
      key: getDateKey(start.toISOString()),
      weekday: new Intl.DateTimeFormat("ko-KR", {
        weekday: "short",
      }).format(start),
      start,
      end: dayEnd,
    };
  });
}

function sumCompletedSleepMinutesByDay(
  logs: readonly BabyLog[],
  days: readonly RecentDay[],
): number[] {
  const totals = days.map(() => 0);
  let lastSleepStart: BabyLog | null = null;

  [...logs]
    .sort(
      (left, right) =>
        new Date(left.recorded_at).getTime() -
        new Date(right.recorded_at).getTime(),
    )
    .forEach((log) => {
      if (log.log_type === "sleep_start") {
        lastSleepStart = log;
        return;
      }

      if (log.log_type !== "sleep_end" || lastSleepStart === null) {
        return;
      }

      addSleepSessionToDailyTotals(
        new Date(lastSleepStart.recorded_at),
        new Date(log.recorded_at),
        days,
        totals,
      );
      lastSleepStart = null;
    });

  return totals.map((minutes) => Math.round(minutes));
}

function addSleepSessionToDailyTotals(
  sleepStart: Date,
  sleepEnd: Date,
  days: readonly RecentDay[],
  totals: number[],
): void {
  const sleepStartTime = sleepStart.getTime();
  const sleepEndTime = sleepEnd.getTime();

  if (sleepEndTime <= sleepStartTime) {
    return;
  }

  days.forEach((day, index) => {
    const overlapStart = Math.max(sleepStartTime, day.start.getTime());
    const overlapEnd = Math.min(sleepEndTime, day.end.getTime());

    if (overlapEnd <= overlapStart) {
      return;
    }

    totals[index] += (overlapEnd - overlapStart) / 60000;
  });
}

function getDateKey(recordedAt: string): string {
  const date = new Date(recordedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
