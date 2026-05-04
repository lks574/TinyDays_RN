import type { RemoteFamilyMapping } from "../family";
import { createBabyLog } from "./baby-log";
import {
  createBabyLogFromRemoteRow,
  createRemoteBabyLogInsert,
  mergeLocalAndRemoteBabyLogs,
  normalizeRemoteBabyLogRow,
  type RemoteBabyLogRow,
} from "./remote-baby-log";

const mapping: RemoteFamilyMapping = {
  user_id: "00000000-0000-0000-0000-000000000016",
  local_family_id: "local-family",
  remote_family_id: "10000000-0000-0000-0000-000000000016",
  local_child_id: "local-child",
  remote_child_id: "30000000-0000-0000-0000-000000000016",
  local_member_id: "local-parent",
  remote_member_id: "20000000-0000-0000-0000-000000000016",
  bootstrapped_at: "2026-04-30T12:00:00.000Z",
  updated_at: "2026-04-30T12:00:00.000Z",
};

describe("createRemoteBabyLogInsert", () => {
  it("maps a local baby log to remote UUID fields", () => {
    const log = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "feeding",
        recorded_at: "2026-04-30T13:00:00.000Z",
        amount: 120,
        unit: "ml",
        memo: "빠른 기록",
        source: "quick_button",
        confidence: 1,
      },
      {
        id: "local-log",
        now: "2026-04-30T13:00:00.000Z",
      },
    );

    expect(
      createRemoteBabyLogInsert(log, mapping, mapping.user_id),
    ).toEqual({
      family_id: mapping.remote_family_id,
      child_id: mapping.remote_child_id,
      created_by: mapping.user_id,
      log_type: "feeding",
      recorded_at: "2026-04-30T13:00:00.000Z",
      amount: 120,
      unit: "ml",
      memo: "빠른 기록",
      source: "quick_button",
      original_text: null,
      confidence: 1,
      created_at: "2026-04-30T13:00:00.000Z",
      updated_at: "2026-04-30T13:00:00.000Z",
    });
  });

  it("returns null when the local family mapping does not match", () => {
    const log = createBabyLog(
      {
        child_id: "other-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "memo",
        recorded_at: "2026-04-30T13:00:00.000Z",
      },
      {
        id: "local-log",
        now: "2026-04-30T13:00:00.000Z",
      },
    );

    expect(createRemoteBabyLogInsert(log, mapping, mapping.user_id)).toBeNull();
  });
});

describe("remote baby log pull mapping", () => {
  const row: RemoteBabyLogRow = {
    id: "40000000-0000-0000-0000-000000000016",
    family_id: mapping.remote_family_id,
    child_id: mapping.remote_child_id,
    created_by: mapping.user_id,
    log_type: "feeding",
    recorded_at: "2026-04-30T13:00:00.000Z",
    amount: 120,
    unit: "ml",
    memo: "빠른 기록",
    source: "quick_button",
    original_text: null,
    confidence: 1,
    created_at: "2026-04-30T13:00:00.000Z",
    updated_at: "2026-04-30T13:00:00.000Z",
  };

  it("accepts a valid remote row", () => {
    expect(normalizeRemoteBabyLogRow(row)).toEqual(row);
  });

  it("rejects an invalid remote row", () => {
    expect(normalizeRemoteBabyLogRow({ ...row, log_type: "invalid" })).toBeNull();
  });

  it("maps a remote row to local-scoped baby log fields", () => {
    expect(createBabyLogFromRemoteRow(row, mapping, mapping.user_id)).toEqual({
      id: `remote-log-${row.id}`,
      family_id: mapping.local_family_id,
      child_id: mapping.local_child_id,
      created_by: `remote-user-${mapping.user_id}`,
      log_type: "feeding",
      recorded_at: "2026-04-30T13:00:00.000Z",
      amount: 120,
      unit: "ml",
      memo: "빠른 기록",
      source: "quick_button",
      original_text: null,
      confidence: 1,
      created_at: "2026-04-30T13:00:00.000Z",
      updated_at: "2026-04-30T13:00:00.000Z",
    });
  });

  it("rejects rows outside the mapping", () => {
    expect(
      createBabyLogFromRemoteRow(
        { ...row, family_id: "other-family" },
        mapping,
        mapping.user_id,
      ),
    ).toBeNull();
  });
});

describe("mergeLocalAndRemoteBabyLogs", () => {
  it("keeps local logs and appends remote-only logs in recent-first order", () => {
    const localLog = createBabyLog(
      {
        child_id: "local-child",
        family_id: "local-family",
        created_by: "local-parent",
        log_type: "feeding",
        recorded_at: "2026-04-30T13:00:00.000Z",
        amount: 120,
        unit: "ml",
        source: "quick_button",
      },
      {
        id: "local-log",
        now: "2026-04-30T13:00:00.000Z",
      },
    );
    const duplicateRemoteLog = {
      ...localLog,
      id: "remote-log-duplicate",
      created_by: "remote-user-parent",
    };
    const remoteOnlyLog = {
      ...localLog,
      id: "remote-log-other",
      recorded_at: "2026-04-30T14:00:00.000Z",
    };

    expect(
      mergeLocalAndRemoteBabyLogs([localLog], [
        duplicateRemoteLog,
        remoteOnlyLog,
      ]),
    ).toEqual([remoteOnlyLog, localLog]);
  });
});
