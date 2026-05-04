import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeRemoteBabyLogRow,
  type RemoteBabyLogInsert,
  type RemoteBabyLogRow,
} from "../../domain/baby-logs";
import type { RemoteFamilyMapping } from "../../domain/family";

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

const REMOTE_BABY_LOG_SELECT = [
  "id",
  "family_id",
  "child_id",
  "created_by",
  "log_type",
  "recorded_at",
  "amount",
  "unit",
  "memo",
  "source",
  "original_text",
  "confidence",
  "created_at",
  "updated_at",
].join(", ");

export async function backupRemoteBabyLog(
  client: SupabaseClient,
  row: RemoteBabyLogInsert,
): Promise<void> {
  const { error } = await client.from("baby_logs").insert(row);

  if (error !== null) {
    throw new Error(error.message);
  }
}

export async function listRemoteBabyLogsForDate(
  client: SupabaseClient,
  mapping: RemoteFamilyMapping,
  dateKey: string,
): Promise<RemoteBabyLogRow[]> {
  const { endAt, startAt } = createLocalDateRange(dateKey);
  const { data, error } = (await client
    .from("baby_logs")
    .select(REMOTE_BABY_LOG_SELECT)
    .eq("family_id", mapping.remote_family_id)
    .eq("child_id", mapping.remote_child_id)
    .gte("recorded_at", startAt)
    .lt("recorded_at", endAt)
    .order("recorded_at", { ascending: false })) as QueryResult<unknown>;

  if (error !== null) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => normalizeRemoteBabyLogRow(row))
    .filter((row): row is RemoteBabyLogRow => row !== null);
}

function createLocalDateRange(dateKey: string): { startAt: string; endAt: string } {
  const [year, month, day] = dateKey.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);
  const endDate = new Date(year, month - 1, day + 1);

  return {
    startAt: startDate.toISOString(),
    endAt: endDate.toISOString(),
  };
}
