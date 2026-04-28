import type {
  BabyLogSource,
  BabyLogType,
  CreateBabyLogInput,
} from "../baby-logs";

export type ParsedBabyLogCandidate = Pick<
  CreateBabyLogInput,
  | "log_type"
  | "recorded_at"
  | "amount"
  | "unit"
  | "memo"
  | "source"
  | "original_text"
  | "confidence"
>;

export type ParseBabyLogTextResult = {
  parsedLog: ParsedBabyLogCandidate;
  confidence: number;
  needsConfirmation: boolean;
  originalText: string;
};

export type ParseBabyLogTextOptions = {
  now: string;
  source?: Extract<BabyLogSource, "manual" | "voice" | "siri">;
};

type ParserMatch = {
  logType: BabyLogType;
  confidence: number;
  amount?: number;
  unit?: string;
  memo?: string | null;
};

export function parseBabyLogText(
  text: string,
  options: ParseBabyLogTextOptions,
): ParseBabyLogTextResult {
  const originalText = text;
  const normalizedText = normalizeText(text);
  const recordedAt = parseRecordedAt(normalizedText, options.now);
  const match = matchBabyLog(normalizedText, originalText);
  const confidence = normalizeConfidence(match.confidence);
  const parsedLog: ParsedBabyLogCandidate = {
    log_type: match.logType,
    recorded_at: recordedAt,
    amount: match.amount ?? null,
    unit: match.unit ?? null,
    memo: match.memo ?? null,
    source: options.source ?? "manual",
    original_text: originalText,
    confidence,
  };

  return {
    parsedLog,
    confidence,
    needsConfirmation: true,
    originalText,
  };
}

function matchBabyLog(text: string, originalText: string): ParserMatch {
  const feedingAmount = parseAmount(text, ["ml", "미리", "밀리", "cc"]);

  if (hasAny(text, ["분유", "모유", "수유", "먹였", "먹었", "먹음"])) {
    return {
      logType: "feeding",
      amount: feedingAmount?.amount,
      unit: feedingAmount ? "ml" : undefined,
      confidence: feedingAmount ? 0.92 : 0.78,
    };
  }

  if (hasAny(text, ["잠들", "잠듦", "잠 시작", "재웠", "잔다", "잠자"])) {
    return {
      logType: "sleep_start",
      confidence: 0.88,
    };
  }

  if (hasAny(text, ["깼", "깨어", "일어났", "기상", "잠 끝"])) {
    return {
      logType: "sleep_end",
      confidence: 0.86,
    };
  }

  if (hasAny(text, ["대변", "응가", "똥"])) {
    return {
      logType: "diaper_poop",
      confidence: text.includes("기저귀") ? 0.92 : 0.84,
    };
  }

  if (hasAny(text, ["소변", "쉬", "오줌"])) {
    return {
      logType: "diaper_pee",
      confidence: text.includes("기저귀") ? 0.92 : 0.84,
    };
  }

  const temperature = parseTemperature(text);

  if (temperature !== null || hasAny(text, ["열", "체온"])) {
    return {
      logType: "temperature",
      amount: temperature ?? undefined,
      unit: temperature === null ? undefined : "C",
      confidence: temperature === null ? 0.72 : 0.9,
    };
  }

  if (hasAny(text, ["목욕", "씻겼", "씻었", "샤워"])) {
    return {
      logType: "bath",
      confidence: 0.88,
    };
  }

  if (hasAny(text, ["메모", "기록", "참고"])) {
    return {
      logType: "memo",
      memo: cleanMemo(originalText),
      confidence: 0.7,
    };
  }

  return {
    logType: "unknown",
    memo: originalText.trim() || nullValue(),
    confidence: 0.35,
  };
}

function parseRecordedAt(text: string, now: string): string {
  const date = new Date(now);
  const timeMatch = text.match(/(오전|오후)?\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);

  if (!timeMatch) {
    return date.toISOString();
  }

  const meridiem = timeMatch[1];
  const hourText = timeMatch[2];
  const minuteText = timeMatch[3];
  let hour = Number(hourText);
  const minute = minuteText === undefined ? 0 : Number(minuteText);

  if (meridiem === "오후" && hour < 12) {
    hour += 12;
  }

  if (meridiem === "오전" && hour === 12) {
    hour = 0;
  }

  if (hour > 23 || minute > 59) {
    return date.toISOString();
  }

  date.setUTCHours(hour, minute, 0, 0);

  return date.toISOString();
}

function parseAmount(
  text: string,
  units: readonly string[],
): { amount: number; unit: string } | null {
  const unitPattern = units.join("|");
  const match = text.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${unitPattern})`, "i"));

  if (!match) {
    return null;
  }

  return {
    amount: Number(match[1]),
    unit: match[2],
  };
}

function parseTemperature(text: string): number | null {
  if (!hasAny(text, ["열", "체온"]) && !/[℃도]/.test(text)) {
    return null;
  }

  const match = text.match(/(\d{2}(?:\.\d+)?)\s*(?:도|℃|c)?/i);

  if (!match) {
    return null;
  }

  const temperature = Number(match[1]);

  if (temperature < 30 || temperature > 45) {
    return null;
  }

  return temperature;
}

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function hasAny(text: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function cleanMemo(text: string): string | null {
  const memo = text.replace(/^\s*(메모|기록|참고)\s*[:：-]?\s*/, "").trim();

  return memo.length > 0 ? memo : text.trim();
}

function normalizeConfidence(confidence: number): number {
  if (confidence < 0) {
    return 0;
  }

  if (confidence > 1) {
    return 1;
  }

  return confidence;
}

function nullValue(): null {
  return null;
}
