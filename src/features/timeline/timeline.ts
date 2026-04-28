import {
  BABY_LOG_TYPES,
  type BabyLog,
  type BabyLogType,
} from "../../domain/baby-logs";

export type TimelineTypeFilter = BabyLogType | "all";

export type TimelineDateOption = {
  key: string;
  label: string;
  count: number;
};

export const TIMELINE_TYPE_FILTERS: readonly TimelineTypeFilter[] = [
  "all",
  ...BABY_LOG_TYPES,
] as const;

export function getTimelineDateKey(recordedAt: string): string {
  const date = new Date(recordedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createTimelineDateOptions(
  logs: readonly BabyLog[],
  now: string,
): TimelineDateOption[] {
  const todayKey = getTimelineDateKey(now);
  const countsByDate = new Map<string, number>([[todayKey, 0]]);

  logs.forEach((log) => {
    const dateKey = getTimelineDateKey(log.recorded_at);
    countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
  });

  return [...countsByDate.entries()]
    .sort(([leftDateKey], [rightDateKey]) => rightDateKey.localeCompare(leftDateKey))
    .map(([dateKey, count]) => ({
      key: dateKey,
      label: formatTimelineDateLabel(dateKey, todayKey),
      count,
    }));
}

export function getLogsForTimelineDate(
  logs: readonly BabyLog[],
  dateKey: string,
  typeFilter: TimelineTypeFilter,
): BabyLog[] {
  return logs
    .filter((log) => getTimelineDateKey(log.recorded_at) === dateKey)
    .filter((log) => typeFilter === "all" || log.log_type === typeFilter)
    .sort(
      (left, right) =>
        new Date(left.recorded_at).getTime() -
        new Date(right.recorded_at).getTime(),
    );
}

export function getBabyLogTypeLabel(logType: BabyLogType): string {
  switch (logType) {
    case "feeding":
      return "수유";
    case "sleep_start":
      return "수면 시작";
    case "sleep_end":
      return "수면 종료";
    case "diaper_pee":
      return "기저귀 소변";
    case "diaper_poop":
      return "기저귀 대변";
    case "vitamin":
      return "비타민";
    case "medicine":
      return "약";
    case "temperature":
      return "체온";
    case "bath":
      return "목욕";
    case "memo":
      return "메모";
    case "unknown":
      return "확인 필요";
  }
}

export function getTimelineTypeFilterLabel(filter: TimelineTypeFilter): string {
  return filter === "all" ? "전체" : getBabyLogTypeLabel(filter);
}

function formatTimelineDateLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) {
    return "오늘";
  }

  const [, month, day] = dateKey.split("-");

  return `${Number(month)}월 ${Number(day)}일`;
}
