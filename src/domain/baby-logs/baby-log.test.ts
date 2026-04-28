import { describe, expect, it } from "@jest/globals";

import {
  BABY_LOG_TYPES,
  createBabyLog,
  isBabyLogType,
  needsBabyLogConfirmation,
  type BabyLogType,
} from "./baby-log";

const expectedBabyLogTypes: readonly BabyLogType[] = [
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
];

describe("BABY_LOG_TYPES", () => {
  it("matches the MVP baby log types", () => {
    expect(BABY_LOG_TYPES).toEqual(expectedBabyLogTypes);
  });
});

describe("isBabyLogType", () => {
  it("returns true for supported baby log types", () => {
    expect(isBabyLogType("feeding")).toBe(true);
    expect(isBabyLogType("temperature")).toBe(true);
  });

  it("returns false for unsupported values", () => {
    expect(isBabyLogType("photo")).toBe(false);
    expect(isBabyLogType("")).toBe(false);
  });
});

describe("createBabyLog", () => {
  it("creates a baby log with storage fields and default values", () => {
    const log = createBabyLog(
      {
        child_id: "child-1",
        family_id: "family-1",
        created_by: "user-1",
        log_type: "feeding",
        recorded_at: "2026-04-28T09:30:00.000Z",
        amount: 120,
        unit: "ml",
      },
      {
        id: "log-1",
        now: "2026-04-28T09:31:00.000Z",
      },
    );

    expect(log).toEqual({
      id: "log-1",
      child_id: "child-1",
      family_id: "family-1",
      created_by: "user-1",
      log_type: "feeding",
      recorded_at: "2026-04-28T09:30:00.000Z",
      amount: 120,
      unit: "ml",
      memo: null,
      source: "manual",
      original_text: null,
      confidence: 1,
      created_at: "2026-04-28T09:31:00.000Z",
      updated_at: "2026-04-28T09:31:00.000Z",
    });
  });

  it("keeps parser-related source, original text, and confidence", () => {
    const log = createBabyLog(
      {
        child_id: "child-1",
        family_id: "family-1",
        created_by: "user-1",
        log_type: "temperature",
        recorded_at: "2026-04-28T10:00:00.000Z",
        memo: "미열 확인",
        source: "voice",
        original_text: "열 37.8도",
        confidence: 0.76,
      },
      {
        id: "log-2",
        now: "2026-04-28T10:01:00.000Z",
      },
    );

    expect(log.source).toBe("voice");
    expect(log.original_text).toBe("열 37.8도");
    expect(log.confidence).toBe(0.76);
    expect(log.memo).toBe("미열 확인");
  });

  it("normalizes confidence into the 0 to 1 range", () => {
    const lowConfidenceLog = createBabyLog(
      {
        child_id: "child-1",
        family_id: "family-1",
        created_by: "user-1",
        log_type: "memo",
        recorded_at: "2026-04-28T10:00:00.000Z",
        confidence: -0.2,
      },
      {
        id: "log-3",
        now: "2026-04-28T10:01:00.000Z",
      },
    );
    const highConfidenceLog = createBabyLog(
      {
        child_id: "child-1",
        family_id: "family-1",
        created_by: "user-1",
        log_type: "memo",
        recorded_at: "2026-04-28T10:00:00.000Z",
        confidence: 1.2,
      },
      {
        id: "log-4",
        now: "2026-04-28T10:01:00.000Z",
      },
    );

    expect(lowConfidenceLog.confidence).toBe(0);
    expect(highConfidenceLog.confidence).toBe(1);
  });
});

describe("needsBabyLogConfirmation", () => {
  it("requires confirmation for voice or low-confidence logs", () => {
    const voiceLog = createBabyLog(
      {
        child_id: "child-1",
        family_id: "family-1",
        created_by: "user-1",
        log_type: "feeding",
        recorded_at: "2026-04-28T10:00:00.000Z",
        source: "voice",
        confidence: 0.95,
      },
      {
        id: "log-5",
        now: "2026-04-28T10:01:00.000Z",
      },
    );
    const lowConfidenceLog = createBabyLog(
      {
        child_id: "child-1",
        family_id: "family-1",
        created_by: "user-1",
        log_type: "feeding",
        recorded_at: "2026-04-28T10:00:00.000Z",
        source: "manual",
        confidence: 0.79,
      },
      {
        id: "log-6",
        now: "2026-04-28T10:01:00.000Z",
      },
    );

    expect(needsBabyLogConfirmation(voiceLog)).toBe(true);
    expect(needsBabyLogConfirmation(lowConfidenceLog)).toBe(true);
  });

  it("does not require confirmation for high-confidence manual logs", () => {
    const log = createBabyLog(
      {
        child_id: "child-1",
        family_id: "family-1",
        created_by: "user-1",
        log_type: "bath",
        recorded_at: "2026-04-28T10:00:00.000Z",
        source: "manual",
        confidence: 1,
      },
      {
        id: "log-7",
        now: "2026-04-28T10:01:00.000Z",
      },
    );

    expect(needsBabyLogConfirmation(log)).toBe(false);
  });
});
