import type { BabyLog } from "../baby-logs";
import { getTodaySummaryDateKey } from "./today-summary";

export type NextActionKind = "feeding" | "sleep" | "diaper" | "none";

export type NextActionInsight = {
  kind: NextActionKind;
  title: string;
  description: string;
};

export type WeeklyInsights = {
  startDateKey: string;
  endDateKey: string;
  totalLogCount: number;
  feeding: {
    count: number;
    totalAmount: number;
    unit: string | null;
    averageCountPerDay: number;
    averageAmountPerDay: number;
  };
  sleep: {
    count: number;
    totalMinutes: number;
    averageMinutesPerDay: number;
  };
  diaper: {
    peeCount: number;
    poopCount: number;
    totalCount: number;
    averageCountPerDay: number;
  };
  nextAction: NextActionInsight;
};

const WEEKLY_INSIGHT_DAY_COUNT = 7;

export function createWeeklyInsights(
  logs: readonly BabyLog[],
  now: string,
): WeeklyInsights {
  const range = createLocalDateRange(now);
  const weeklyLogs = logs
    .filter((log) => isWithinRange(log.recorded_at, range.start, range.end))
    .sort(
      (left, right) =>
        new Date(left.recorded_at).getTime() -
        new Date(right.recorded_at).getTime(),
    );
  const feedingLogs = weeklyLogs.filter((log) => log.log_type === "feeding");
  const peeCount = weeklyLogs.filter((log) => log.log_type === "diaper_pee").length;
  const poopCount = weeklyLogs.filter(
    (log) => log.log_type === "diaper_poop",
  ).length;
  const totalFeedingAmount = sumFeedingAmount(feedingLogs);
  const totalSleepMinutes = sumCompletedSleepMinutes(weeklyLogs);

  return {
    startDateKey: getTodaySummaryDateKey(range.start.toISOString()),
    endDateKey: getTodaySummaryDateKey(range.end.toISOString()),
    totalLogCount: weeklyLogs.length,
    feeding: {
      count: feedingLogs.length,
      totalAmount: totalFeedingAmount,
      unit: getFeedingUnit(feedingLogs),
      averageCountPerDay: roundToOneDecimal(
        feedingLogs.length / WEEKLY_INSIGHT_DAY_COUNT,
      ),
      averageAmountPerDay: roundToOneDecimal(
        totalFeedingAmount / WEEKLY_INSIGHT_DAY_COUNT,
      ),
    },
    sleep: {
      count: weeklyLogs.filter((log) => log.log_type === "sleep_start").length,
      totalMinutes: totalSleepMinutes,
      averageMinutesPerDay: Math.round(
        totalSleepMinutes / WEEKLY_INSIGHT_DAY_COUNT,
      ),
    },
    diaper: {
      peeCount,
      poopCount,
      totalCount: peeCount + poopCount,
      averageCountPerDay: roundToOneDecimal(
        (peeCount + poopCount) / WEEKLY_INSIGHT_DAY_COUNT,
      ),
    },
    nextAction: createNextActionInsight(weeklyLogs, now),
  };
}

function createLocalDateRange(now: string): { start: Date; end: Date } {
  const nowDate = new Date(now);
  const end = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
    23,
    59,
    59,
    999,
  );
  const start = new Date(end);
  start.setDate(start.getDate() - (WEEKLY_INSIGHT_DAY_COUNT - 1));
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

function isWithinRange(recordedAt: string, start: Date, end: Date): boolean {
  const time = new Date(recordedAt).getTime();

  return time >= start.getTime() && time <= end.getTime();
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

    totalMinutes += Math.max(
      0,
      Math.round(
        (new Date(log.recorded_at).getTime() -
          new Date(lastSleepStart.recorded_at).getTime()) /
          60000,
      ),
    );
    lastSleepStart = null;
  });

  return totalMinutes;
}

function createNextActionInsight(
  logs: readonly BabyLog[],
  now: string,
): NextActionInsight {
  const nowTime = new Date(now).getTime();
  const recentLogs = [...logs].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() - new Date(left.recorded_at).getTime(),
  );
  const lastFeeding = recentLogs.find((log) => log.log_type === "feeding");
  const lastSleepStart = recentLogs.find((log) => log.log_type === "sleep_start");
  const lastSleepEnd = recentLogs.find((log) => log.log_type === "sleep_end");
  const lastDiaper = recentLogs.find(
    (log) => log.log_type === "diaper_pee" || log.log_type === "diaper_poop",
  );

  if (lastFeeding === undefined && lastSleepEnd === undefined) {
    return {
      kind: "none",
      title: "기록을 더 모아볼게요",
      description: "수유와 수면 기록이 쌓이면 다음 행동 안내를 보여줍니다.",
    };
  }

  if (
    lastSleepStart !== undefined &&
    (lastSleepEnd === undefined ||
      new Date(lastSleepStart.recorded_at).getTime() >
        new Date(lastSleepEnd.recorded_at).getTime())
  ) {
    return {
      kind: "sleep",
      title: "수면 종료 확인",
      description: "최근 수면 시작 이후 종료 기록이 없습니다.",
    };
  }

  const hoursSinceFeeding =
    lastFeeding === undefined
      ? 0
      : (nowTime - new Date(lastFeeding.recorded_at).getTime()) / 3600000;
  const hoursSinceDiaper =
    lastDiaper === undefined
      ? 0
      : (nowTime - new Date(lastDiaper.recorded_at).getTime()) / 3600000;
  const hoursSinceSleepEnd =
    lastSleepEnd === undefined
      ? 0
      : (nowTime - new Date(lastSleepEnd.recorded_at).getTime()) / 3600000;

  if (lastFeeding !== undefined && hoursSinceFeeding >= 3) {
    return {
      kind: "feeding",
      title: "수유 확인",
      description: "마지막 수유 후 3시간 이상 지났습니다.",
    };
  }

  if (lastDiaper !== undefined && hoursSinceDiaper >= 4) {
    return {
      kind: "diaper",
      title: "기저귀 확인",
      description: "마지막 기저귀 기록 후 4시간 이상 지났습니다.",
    };
  }

  if (lastSleepEnd !== undefined && hoursSinceSleepEnd >= 3) {
    return {
      kind: "sleep",
      title: "수면 신호 확인",
      description: "마지막 수면 종료 후 3시간 이상 지났습니다.",
    };
  }

  return {
    kind: "none",
    title: "지금은 관찰 유지",
    description: "최근 기록 기준으로 바로 확인할 항목은 없습니다.",
  };
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
