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
import type { ParsedBabyLogCandidate } from "../../domain/parser";

export type EditableParsedLog = {
  log_type: BabyLogType;
  recorded_at: string;
  amountText: string;
  unit: string;
  memo: string;
  original_text: string;
  confidence: number;
};

export type CreateTextLogCandidateOptions = {
  parsedLog: EditableParsedLog;
  now: string;
  sequence: number;
  id?: string;
  ownerContext?: LogOwnerContext;
};

const DEFAULT_LOG_OWNER_CONTEXT: LogOwnerContext = {
  child_id: DEFAULT_CHILD_ID,
  family_id: DEFAULT_FAMILY_ID,
  created_by: DEFAULT_PARENT_ID,
};

export const TEXT_LOG_TYPE_OPTIONS: readonly BabyLogType[] = [
  "feeding",
  "sleep_start",
  "sleep_end",
  "diaper_pee",
  "diaper_poop",
  "temperature",
  "bath",
  "memo",
  "unknown",
] as const;

export function createEditableParsedLog(
  parsedLog: ParsedBabyLogCandidate,
): EditableParsedLog {
  return {
    log_type: parsedLog.log_type,
    recorded_at: parsedLog.recorded_at,
    amountText: parsedLog.amount === null ? "" : String(parsedLog.amount),
    unit: parsedLog.unit ?? "",
    memo: parsedLog.memo ?? "",
    original_text: parsedLog.original_text ?? "",
    confidence: parsedLog.confidence ?? 0,
  };
}

export function createTextLogCandidate(
  options: CreateTextLogCandidateOptions,
): BabyLog {
  const ownerContext = options.ownerContext ?? DEFAULT_LOG_OWNER_CONTEXT;
  const input: CreateBabyLogInput = {
    child_id: ownerContext.child_id,
    family_id: ownerContext.family_id,
    created_by: ownerContext.created_by,
    log_type: options.parsedLog.log_type,
    recorded_at: options.parsedLog.recorded_at,
    amount: parseOptionalNumber(options.parsedLog.amountText),
    unit: normalizeOptionalText(options.parsedLog.unit),
    memo: normalizeOptionalText(options.parsedLog.memo),
    source: "manual",
    original_text: options.parsedLog.original_text,
    confidence: options.parsedLog.confidence,
  };

  return createBabyLog(input, {
    id: options.id ?? `local-text-log-${options.sequence}`,
    now: options.now,
  });
}

function parseOptionalNumber(value: string): number | null {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  const numberValue = Number(trimmedValue);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeOptionalText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}
