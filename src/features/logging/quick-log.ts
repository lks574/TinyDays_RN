import {
  createBabyLog,
  type BabyLog,
  type BabyLogType,
  type CreateBabyLogInput,
} from "../../domain/baby-logs";
import {
  DEFAULT_CHILD_ID,
  DEFAULT_FAMILY_ID,
  DEFAULT_PARENT_ID,
  type LogOwnerContext,
} from "../../domain/family";

export type QuickLogActionId =
  | "feeding"
  | "sleep"
  | "diaper_pee"
  | "diaper_poop"
  | "temperature"
  | "bath"
  | "memo";

export type QuickLogAction = {
  id: QuickLogActionId;
  label: string;
  detail: string;
};

export type CreateQuickLogCandidateOptions = {
  actionId: QuickLogActionId;
  now: string;
  sequence: number;
  id?: string;
  ownerContext?: LogOwnerContext;
  lastSleepLogType?: Extract<BabyLogType, "sleep_start" | "sleep_end"> | null;
};

const DEFAULT_LOG_OWNER_CONTEXT: LogOwnerContext = {
  child_id: DEFAULT_CHILD_ID,
  family_id: DEFAULT_FAMILY_ID,
  created_by: DEFAULT_PARENT_ID,
};

export const QUICK_LOG_ACTIONS: readonly QuickLogAction[] = [
  { id: "feeding", label: "수유", detail: "120 ml" },
  { id: "sleep", label: "수면", detail: "시작/종료" },
  { id: "diaper_pee", label: "소변", detail: "기저귀" },
  { id: "diaper_poop", label: "대변", detail: "기저귀" },
  { id: "temperature", label: "체온", detail: "37.0 C" },
  { id: "bath", label: "목욕", detail: "완료" },
  { id: "memo", label: "메모", detail: "간단 기록" },
] as const;

export function createQuickLogCandidate(
  options: CreateQuickLogCandidateOptions,
): BabyLog {
  const input = createQuickLogInput(options);

  return createBabyLog(input, {
    id: options.id ?? `local-log-${options.sequence}`,
    now: options.now,
  });
}

export function getLastSleepLogType(
  logs: readonly BabyLog[],
): Extract<BabyLogType, "sleep_start" | "sleep_end"> | null {
  const lastSleepLog = logs.find(isSleepLog);

  return lastSleepLog?.log_type ?? null;
}

export function sortLogsByRecent(logs: readonly BabyLog[]): BabyLog[] {
  return [...logs].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() - new Date(left.recorded_at).getTime(),
  );
}

function createQuickLogInput(
  options: CreateQuickLogCandidateOptions,
): CreateBabyLogInput {
  const logType = getQuickLogType(options);
  const ownerContext = options.ownerContext ?? DEFAULT_LOG_OWNER_CONTEXT;
  const baseInput: CreateBabyLogInput = {
    child_id: ownerContext.child_id,
    family_id: ownerContext.family_id,
    created_by: ownerContext.created_by,
    log_type: logType,
    recorded_at: options.now,
    source: "quick_button",
    confidence: 1,
  };

  switch (logType) {
    case "feeding":
      return {
        ...baseInput,
        amount: 120,
        unit: "ml",
        memo: "빠른 기록",
      };
    case "temperature":
      return {
        ...baseInput,
        amount: 37,
        unit: "C",
        memo: "빠른 기록",
      };
    case "memo":
      return {
        ...baseInput,
        memo: "빠른 메모",
      };
    default:
      return {
        ...baseInput,
        memo: "빠른 기록",
      };
  }
}

function getQuickLogType(options: CreateQuickLogCandidateOptions): BabyLogType {
  if (options.actionId === "sleep") {
    return options.lastSleepLogType === "sleep_start"
      ? "sleep_end"
      : "sleep_start";
  }

  return options.actionId;
}

function isSleepLog(
  log: BabyLog,
): log is BabyLog & {
  log_type: Extract<BabyLogType, "sleep_start" | "sleep_end">;
} {
  return log.log_type === "sleep_start" || log.log_type === "sleep_end";
}
