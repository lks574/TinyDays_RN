export type BabyLogType =
  | "feeding"
  | "sleep_start"
  | "sleep_end"
  | "diaper_pee"
  | "diaper_poop"
  | "vitamin"
  | "medicine"
  | "temperature"
  | "bath"
  | "memo"
  | "unknown";

export type BabyLogSource =
  | "manual"
  | "quick_button"
  | "voice"
  | "siri"
  | "imported";

export type BabyLog = {
  id: string;
  child_id: string;
  family_id: string;
  created_by: string;
  log_type: BabyLogType;
  recorded_at: string;
  amount: number | null;
  unit: string | null;
  memo: string | null;
  source: BabyLogSource;
  original_text: string | null;
  confidence: number;
  created_at: string;
  updated_at: string;
};

export type CreateBabyLogInput = {
  child_id: string;
  family_id: string;
  created_by: string;
  log_type: BabyLogType;
  recorded_at: string;
  amount?: number | null;
  unit?: string | null;
  memo?: string | null;
  source?: BabyLogSource;
  original_text?: string | null;
  confidence?: number;
};

export type CreateBabyLogOptions = {
  id: string;
  now: string;
};

export const BABY_LOG_TYPES: readonly BabyLogType[] = [
  "feeding",
  "sleep_start",
  "sleep_end",
  "diaper_pee",
  "diaper_poop",
  "vitamin",
  "medicine",
  "temperature",
  "bath",
  "memo",
  "unknown",
] as const;

export function isBabyLogType(value: string): value is BabyLogType {
  return BABY_LOG_TYPES.includes(value as BabyLogType);
}

export function createBabyLog(
  input: CreateBabyLogInput,
  options: CreateBabyLogOptions,
): BabyLog {
  return {
    id: options.id,
    child_id: input.child_id,
    family_id: input.family_id,
    created_by: input.created_by,
    log_type: input.log_type,
    recorded_at: input.recorded_at,
    amount: input.amount ?? null,
    unit: input.unit ?? null,
    memo: input.memo ?? null,
    source: input.source ?? "manual",
    original_text: input.original_text ?? null,
    confidence: normalizeConfidence(input.confidence),
    created_at: options.now,
    updated_at: options.now,
  };
}

export function needsBabyLogConfirmation(log: BabyLog): boolean {
  return log.source === "voice" || log.source === "siri" || log.confidence < 0.8;
}

function normalizeConfidence(confidence: number | undefined): number {
  if (confidence === undefined) {
    return 1;
  }

  if (confidence < 0) {
    return 0;
  }

  if (confidence > 1) {
    return 1;
  }

  return confidence;
}
