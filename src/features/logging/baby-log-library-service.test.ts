import type { SupabaseClient } from "@supabase/supabase-js";

import { createBabyLog, type BabyLog } from "../../domain/baby-logs";
import type { RemoteFamilyMapping } from "../../domain/family";
import { loadBabyLogsWithRemotePull } from "./baby-log-library-service";

const userId = "00000000-0000-0000-0000-000000000019";
const mapping: RemoteFamilyMapping = {
  user_id: userId,
  local_family_id: "local-family",
  remote_family_id: "10000000-0000-0000-0000-000000000019",
  local_child_id: "local-child",
  remote_child_id: "30000000-0000-0000-0000-000000000019",
  local_member_id: "local-parent",
  remote_member_id: "20000000-0000-0000-0000-000000000019",
  bootstrapped_at: "2026-04-30T12:00:00.000Z",
  updated_at: "2026-04-30T12:00:00.000Z",
};

const localLog = createBabyLog(
  {
    family_id: "local-family",
    child_id: "local-child",
    created_by: "local-parent",
    log_type: "memo",
    recorded_at: "2026-04-30T13:00:00.000Z",
    memo: "로컬 기록",
  },
  { id: "local-log", now: "2026-04-30T13:00:00.000Z" },
);

describe("loadBabyLogsWithRemotePull", () => {
  it("loads local logs and appends remote family logs for the selected date", async () => {
    const listRemoteLogs = jest.fn(async () => [
      {
        id: "remote-log",
        family_id: mapping.remote_family_id,
        child_id: mapping.remote_child_id,
        created_by: userId,
        log_type: "feeding" as const,
        recorded_at: "2026-04-30T14:00:00.000Z",
        amount: 120,
        unit: "ml",
        memo: null,
        source: "quick_button" as const,
        original_text: null,
        confidence: 1,
        created_at: "2026-04-30T14:00:00.000Z",
        updated_at: "2026-04-30T14:00:00.000Z",
      },
    ]);

    const result = await loadBabyLogsWithRemotePull({
      dateKey: "2026-04-30",
      getClient: () => createClientWithSession(userId),
      listRemoteLogs,
      localRepository: createMemoryLogRepository([localLog]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result.remoteStatus).toBe("loaded");
    expect(listRemoteLogs).toHaveBeenCalledWith(
      expect.anything(),
      mapping,
      "2026-04-30",
    );
    expect(result.logs).toEqual([
      expect.objectContaining({
        id: "remote-log-remote-log",
        family_id: "local-family",
        child_id: "local-child",
      }),
      localLog,
    ]);
  });

  it("returns local logs when there is no session", async () => {
    const result = await loadBabyLogsWithRemotePull({
      dateKey: "2026-04-30",
      getClient: () => createClientWithoutSession(),
      localRepository: createMemoryLogRepository([localLog]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result).toEqual({
      logs: [localLog],
      remoteStatus: "skipped",
    });
  });

  it("keeps local logs when remote loading fails", async () => {
    const result = await loadBabyLogsWithRemotePull({
      dateKey: "2026-04-30",
      getClient: () => createClientWithSession(userId),
      listRemoteLogs: jest.fn(async () => {
        throw new Error("rls");
      }),
      localRepository: createMemoryLogRepository([localLog]),
      mappingRepository: {
        getMapping: jest.fn(async () => mapping),
        saveMapping: jest.fn(),
      },
    });

    expect(result).toEqual({
      logs: [localLog],
      remoteStatus: "failed",
    });
  });
});

function createClientWithSession(id: string): SupabaseClient {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: { session: { user: { id } } },
        error: null,
      })),
    },
  } as unknown as SupabaseClient;
}

function createClientWithoutSession(): SupabaseClient {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: { session: null },
        error: null,
      })),
    },
  } as unknown as SupabaseClient;
}

function createMemoryLogRepository(logs: BabyLog[]) {
  return {
    listLogs: jest.fn(async () => logs),
    saveLog: jest.fn(async (nextLog: BabyLog) => [nextLog, ...logs]),
  };
}
