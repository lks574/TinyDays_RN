import type { SupabaseClient } from "@supabase/supabase-js";

import type { RemoteBabyLogInsert } from "../../domain/baby-logs";

export async function backupRemoteBabyLog(
  client: SupabaseClient,
  row: RemoteBabyLogInsert,
): Promise<void> {
  const { error } = await client.from("baby_logs").insert(row);

  if (error !== null) {
    throw new Error(error.message);
  }
}
