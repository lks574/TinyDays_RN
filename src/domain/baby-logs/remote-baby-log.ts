import type { RemoteFamilyMapping } from "../family";
import type { BabyLog } from "./baby-log";

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
