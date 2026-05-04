import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createBabyLogFromRemoteRow,
  mergeLocalAndRemoteBabyLogs,
  type BabyLog,
  type BabyLogRepository,
  type RemoteBabyLogRow,
} from "../../domain/baby-logs";
import type { RemoteFamilyMapping } from "../../domain/family";
import { getSupabaseClient } from "../auth";
import type { RemoteFamilyMappingRepository } from "../family";
import { listRemoteBabyLogsForDate } from "./remote-baby-log-repository";

export type LoadBabyLogsResult = {
  logs: BabyLog[];
  remoteStatus: "loaded" | "failed" | "skipped";
};

export type LoadBabyLogsDependencies = {
  localRepository: BabyLogRepository;
  mappingRepository: RemoteFamilyMappingRepository;
  dateKey: string;
  getClient?: () => SupabaseClient | null;
  listRemoteLogs?: (
    client: SupabaseClient,
    mapping: RemoteFamilyMapping,
    dateKey: string,
  ) => Promise<RemoteBabyLogRow[]>;
};

export async function loadBabyLogsWithRemotePull(
  dependencies: LoadBabyLogsDependencies,
): Promise<LoadBabyLogsResult> {
  const localLogs = await dependencies.localRepository.listLogs();
  const client = (dependencies.getClient ?? getSupabaseClient)();

  if (client === null) {
    return { logs: localLogs, remoteStatus: "skipped" };
  }

  try {
    const userId = await getCurrentUserId(client);

    if (userId === null) {
      return { logs: localLogs, remoteStatus: "skipped" };
    }

    const mapping = await dependencies.mappingRepository.getMapping(userId);

    if (mapping === null) {
      return { logs: localLogs, remoteStatus: "skipped" };
    }

    const remoteLogs = await loadRemoteLogs(client, mapping, userId, dependencies);

    return {
      logs: mergeLocalAndRemoteBabyLogs(localLogs, remoteLogs),
      remoteStatus: "loaded",
    };
  } catch {
    return { logs: localLogs, remoteStatus: "failed" };
  }
}

async function loadRemoteLogs(
  client: SupabaseClient,
  mapping: RemoteFamilyMapping,
  userId: string,
  dependencies: LoadBabyLogsDependencies,
): Promise<BabyLog[]> {
  const listRemoteLogs =
    dependencies.listRemoteLogs ?? listRemoteBabyLogsForDate;
  const rows = await listRemoteLogs(client, mapping, dependencies.dateKey);

  return rows
    .map((row) => createBabyLogFromRemoteRow(row, mapping, userId))
    .filter((log): log is BabyLog => log !== null);
}

async function getCurrentUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getSession();

  if (error !== null) {
    return null;
  }

  return data.session?.user.id ?? null;
}
