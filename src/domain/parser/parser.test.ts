import { describe, expect, it } from "@jest/globals";

import { parseBabyLogText } from "./parser";

const baseNow = "2026-04-28T09:30:00.000Z";

describe("parseBabyLogText", () => {
  it("parses formula feeding with amount", () => {
    const result = parseBabyLogText("분유 120ml 먹었어", { now: baseNow });

    expect(result.parsedLog).toMatchObject({
      log_type: "feeding",
      amount: 120,
      unit: "ml",
      recorded_at: baseNow,
      source: "manual",
      original_text: "분유 120ml 먹었어",
    });
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.needsConfirmation).toBe(true);
    expect(result.originalText).toBe("분유 120ml 먹었어");
  });

  it("parses sleep start with recorded time", () => {
    const result = parseBabyLogText("2시에 잠들었어", { now: baseNow });

    expect(result.parsedLog).toMatchObject({
      log_type: "sleep_start",
      recorded_at: "2026-04-28T02:00:00.000Z",
      amount: null,
      unit: null,
    });
    expect(result.needsConfirmation).toBe(true);
  });

  it("parses diaper pee", () => {
    const result = parseBabyLogText("기저귀 소변", { now: baseNow });

    expect(result.parsedLog).toMatchObject({
      log_type: "diaper_pee",
      recorded_at: baseNow,
    });
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("parses diaper poop", () => {
    const result = parseBabyLogText("응가 기저귀 갈았어", { now: baseNow });

    expect(result.parsedLog.log_type).toBe("diaper_poop");
  });

  it("parses temperature with celsius amount", () => {
    const result = parseBabyLogText("열 37.8도", { now: baseNow });

    expect(result.parsedLog).toMatchObject({
      log_type: "temperature",
      amount: 37.8,
      unit: "C",
      recorded_at: baseNow,
    });
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("parses bath records", () => {
    const result = parseBabyLogText("저녁에 목욕했어", { now: baseNow });

    expect(result.parsedLog.log_type).toBe("bath");
  });

  it("parses memo records and keeps memo text", () => {
    const result = parseBabyLogText("메모 오늘 컨디션 좋음", { now: baseNow });

    expect(result.parsedLog).toMatchObject({
      log_type: "memo",
      memo: "오늘 컨디션 좋음",
    });
  });

  it("returns an unknown candidate for unsupported text", () => {
    const result = parseBabyLogText("오늘은 평소보다 조금 보챔", {
      now: baseNow,
    });

    expect(result.parsedLog).toMatchObject({
      log_type: "unknown",
      memo: "오늘은 평소보다 조금 보챔",
      original_text: "오늘은 평소보다 조금 보챔",
    });
    expect(result.confidence).toBeLessThan(0.5);
    expect(result.needsConfirmation).toBe(true);
  });

  it("keeps voice source for confirmation flow", () => {
    const result = parseBabyLogText("오후 3시 20분 수유", {
      now: baseNow,
      source: "voice",
    });

    expect(result.parsedLog).toMatchObject({
      log_type: "feeding",
      source: "voice",
      recorded_at: "2026-04-28T15:20:00.000Z",
    });
    expect(result.needsConfirmation).toBe(true);
  });
});
