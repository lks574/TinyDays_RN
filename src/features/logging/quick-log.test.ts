import { describe, expect, it } from "@jest/globals";

import {
  createQuickLogCandidate,
  getLastSleepLogType,
  sortLogsByRecent,
} from "./quick-log";

const now = "2026-04-28T09:30:00.000Z";

describe("createQuickLogCandidate", () => {
  it("creates a feeding log candidate from quick button defaults", () => {
    const log = createQuickLogCandidate({
      actionId: "feeding",
      now,
      sequence: 1,
    });

    expect(log).toMatchObject({
      id: "local-log-1",
      child_id: "local-child",
      family_id: "local-family",
      created_by: "local-parent",
      log_type: "feeding",
      recorded_at: now,
      amount: 120,
      unit: "ml",
      source: "quick_button",
      confidence: 1,
    });
  });

  it("uses the provided family and child owner context", () => {
    const log = createQuickLogCandidate({
      actionId: "feeding",
      now,
      sequence: 1,
      ownerContext: {
        child_id: "child-2",
        family_id: "family-2",
        created_by: "parent-2",
      },
    });

    expect(log).toMatchObject({
      child_id: "child-2",
      family_id: "family-2",
      created_by: "parent-2",
    });
  });

  it("starts sleep when there is no active sleep log", () => {
    const log = createQuickLogCandidate({
      actionId: "sleep",
      now,
      sequence: 2,
      lastSleepLogType: null,
    });

    expect(log.log_type).toBe("sleep_start");
  });

  it("ends sleep when the latest sleep log is sleep_start", () => {
    const log = createQuickLogCandidate({
      actionId: "sleep",
      now,
      sequence: 3,
      lastSleepLogType: "sleep_start",
    });

    expect(log.log_type).toBe("sleep_end");
  });

  it("creates diaper, temperature, bath, and memo candidates", () => {
    expect(
      createQuickLogCandidate({
        actionId: "diaper_pee",
        now,
        sequence: 4,
      }).log_type,
    ).toBe("diaper_pee");
    expect(
      createQuickLogCandidate({
        actionId: "diaper_poop",
        now,
        sequence: 5,
      }).log_type,
    ).toBe("diaper_poop");
    expect(
      createQuickLogCandidate({
        actionId: "temperature",
        now,
        sequence: 6,
      }),
    ).toMatchObject({ log_type: "temperature", amount: 37, unit: "C" });
    expect(
      createQuickLogCandidate({
        actionId: "bath",
        now,
        sequence: 7,
      }).log_type,
    ).toBe("bath");
    expect(
      createQuickLogCandidate({
        actionId: "memo",
        now,
        sequence: 8,
      }),
    ).toMatchObject({ log_type: "memo", memo: "빠른 메모" });
  });
});

describe("getLastSleepLogType", () => {
  it("returns the latest sleep log type from recent-first logs", () => {
    const logs = [
      createQuickLogCandidate({
        actionId: "feeding",
        now: "2026-04-28T10:00:00.000Z",
        sequence: 1,
      }),
      createQuickLogCandidate({
        actionId: "sleep",
        now: "2026-04-28T09:00:00.000Z",
        sequence: 2,
      }),
    ];

    expect(getLastSleepLogType(logs)).toBe("sleep_start");
  });
});

describe("sortLogsByRecent", () => {
  it("sorts logs by recorded_at descending", () => {
    const olderLog = createQuickLogCandidate({
      actionId: "feeding",
      now: "2026-04-28T09:00:00.000Z",
      sequence: 1,
    });
    const newerLog = createQuickLogCandidate({
      actionId: "bath",
      now: "2026-04-28T10:00:00.000Z",
      sequence: 2,
    });

    expect(sortLogsByRecent([olderLog, newerLog]).map((log) => log.id)).toEqual([
      "local-log-2",
      "local-log-1",
    ]);
  });
});
