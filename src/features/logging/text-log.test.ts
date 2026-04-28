import { describe, expect, it } from "@jest/globals";

import {
  createEditableParsedLog,
  createTextLogCandidate,
} from "./text-log";

describe("createEditableParsedLog", () => {
  it("maps parser output into editable text fields", () => {
    const editableLog = createEditableParsedLog({
      log_type: "feeding",
      recorded_at: "2026-04-28T09:30:00.000Z",
      amount: 120,
      unit: "ml",
      memo: null,
      source: "manual",
      original_text: "분유 120ml 먹었어",
      confidence: 0.92,
    });

    expect(editableLog).toEqual({
      log_type: "feeding",
      recorded_at: "2026-04-28T09:30:00.000Z",
      amountText: "120",
      unit: "ml",
      memo: "",
      original_text: "분유 120ml 먹었어",
      confidence: 0.92,
    });
  });
});

describe("createTextLogCandidate", () => {
  it("creates a confirmed text log from edited parser output", () => {
    const log = createTextLogCandidate({
      parsedLog: {
        log_type: "temperature",
        recorded_at: "2026-04-28T10:00:00.000Z",
        amountText: "37.8",
        unit: "C",
        memo: "미열 확인",
        original_text: "열 37.8도",
        confidence: 0.9,
      },
      now: "2026-04-28T10:01:00.000Z",
      sequence: 3,
    });

    expect(log).toMatchObject({
      id: "local-text-log-3",
      log_type: "temperature",
      recorded_at: "2026-04-28T10:00:00.000Z",
      amount: 37.8,
      unit: "C",
      memo: "미열 확인",
      source: "manual",
      original_text: "열 37.8도",
      confidence: 0.9,
    });
  });

  it("keeps low confidence logs as explicit confirmed candidates only", () => {
    const log = createTextLogCandidate({
      parsedLog: {
        log_type: "unknown",
        recorded_at: "2026-04-28T10:00:00.000Z",
        amountText: "",
        unit: "",
        memo: "오늘은 평소보다 조금 보챔",
        original_text: "오늘은 평소보다 조금 보챔",
        confidence: 0.35,
      },
      now: "2026-04-28T10:01:00.000Z",
      sequence: 4,
    });

    expect(log.confidence).toBe(0.35);
    expect(log.log_type).toBe("unknown");
    expect(log.memo).toBe("오늘은 평소보다 조금 보챔");
  });
});
