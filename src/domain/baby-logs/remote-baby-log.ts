import type { RemoteFamilyMapping } from "../family";
import { isBabyLogType, type BabyLog, type BabyLogSource } from "./baby-log";

export type RemoteBabyLogInsert = {
  family_id: string;
  child_id: string;
  created_by: string;
  log_type: BabyLog["log_type"];
  recorded_at: string;
  amount: number | null;
  unit: string | null;
  memo: string | null;
  source: BabyLog["source"];
  original_text: string | null;
  confidence: number;
  created_at: string;
  updated_at: string;
};

export type RemoteBabyLogRow = RemoteBabyLogInsert & {
  id: string;
};

export function createRemoteBabyLogInsert(
  log: BabyLog,
  mapping: RemoteFamilyMapping,
  userId: string,
): RemoteBabyLogInsert | null {
  if (
    mapping.user_id !== userId ||
    log.family_id !== mapping.local_family_id ||
    log.child_id !== mapping.local_child_id ||
    log.created_by !== mapping.local_member_id
  ) {
    return null;
  }

  return {
    family_id: mapping.remote_family_id,
    child_id: mapping.remote_child_id,
    created_by: userId,
    log_type: log.log_type,
    recorded_at: log.recorded_at,
    amount: log.amount,
    unit: log.unit,
    memo: log.memo,
    source: log.source,
    original_text: log.original_text,
    confidence: log.confidence,
    created_at: log.created_at,
    updated_at: log.updated_at,
  };
}

export function normalizeRemoteBabyLogRow(value: unknown): RemoteBabyLogRow | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.family_id !== "string" ||
    typeof candidate.child_id !== "string" ||
    typeof candidate.created_by !== "string" ||
    typeof candidate.log_type !== "string" ||
    !isBabyLogType(candidate.log_type) ||
    typeof candidate.recorded_at !== "string" ||
    !isNullableNumber(candidate.amount) ||
    !isNullableString(candidate.unit) ||
    !isNullableString(candidate.memo) ||
    typeof candidate.source !== "string" ||
    !isBabyLogSource(candidate.source) ||
    !isNullableString(candidate.original_text) ||
    typeof candidate.confidence !== "number" ||
    typeof candidate.created_at !== "string" ||
    typeof candidate.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    family_id: candidate.family_id,
    child_id: candidate.child_id,
    created_by: candidate.created_by,
    log_type: candidate.log_type,
    recorded_at: candidate.recorded_at,
    amount: candidate.amount,
    unit: candidate.unit,
    memo: candidate.memo,
    source: candidate.source,
    original_text: candidate.original_text,
    confidence: candidate.confidence,
    created_at: candidate.created_at,
    updated_at: candidate.updated_at,
  };
}

export function createBabyLogFromRemoteRow(
  row: RemoteBabyLogRow,
  mapping: RemoteFamilyMapping,
  userId: string,
): BabyLog | null {
  if (
    mapping.user_id !== userId ||
    row.family_id !== mapping.remote_family_id ||
    row.child_id !== mapping.remote_child_id
  ) {
    return null;
  }

  return {
    id: `remote-log-${row.id}`,
    family_id: mapping.local_family_id,
    child_id: mapping.local_child_id,
    created_by: `remote-user-${row.created_by}`,
    log_type: row.log_type,
    recorded_at: row.recorded_at,
    amount: row.amount,
    unit: row.unit,
    memo: row.memo,
    source: row.source,
    original_text: row.original_text,
    confidence: row.confidence,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mergeLocalAndRemoteBabyLogs(
  localLogs: readonly BabyLog[],
  remoteLogs: readonly BabyLog[],
): BabyLog[] {
  const localFingerprints = new Set(localLogs.map(createBabyLogFingerprint));
  const seenRemoteFingerprints = new Set<string>();
  const uniqueRemoteLogs = remoteLogs.filter((log) => {
    const fingerprint = createBabyLogFingerprint(log);

    if (
      localFingerprints.has(fingerprint) ||
      seenRemoteFingerprints.has(fingerprint)
    ) {
      return false;
    }

    seenRemoteFingerprints.add(fingerprint);

    return true;
  });

  return [...localLogs, ...uniqueRemoteLogs].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() -
      new Date(left.recorded_at).getTime(),
  );
}

function createBabyLogFingerprint(log: BabyLog): string {
  return [
    log.family_id,
    log.child_id,
    log.log_type,
    log.recorded_at,
    log.amount ?? "",
    log.unit ?? "",
    log.memo ?? "",
    log.source,
    log.original_text ?? "",
    log.confidence,
    log.created_at,
  ].join("|");
}

const BABY_LOG_SOURCES: readonly BabyLogSource[] = [
  "manual",
  "quick_button",
  "voice",
  "siri",
  "imported",
];

function isBabyLogSource(value: string): value is BabyLogSource {
  return BABY_LOG_SOURCES.includes(value as BabyLogSource);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === "number" || value === null;
}
