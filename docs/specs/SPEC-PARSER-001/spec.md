# SPEC-PARSER-001: 룰 기반 자연어 파서 1차

상태: draft
생성일: 2026-04-28
도메인: PARSER

## 목적

부모가 입력한 한국어 육아 기록 문장을 저장 가능한 `baby_logs` 후보 기록으로 변환한다.

## 요구사항

- R1 (Must): WHEN 사용자가 수유 문장을 입력하면, THE SYSTEM SHALL `feeding` 후보와 수유량을 반환한다.
- R2 (Must): WHEN 사용자가 수면 시작 또는 종료 문장을 입력하면, THE SYSTEM SHALL `sleep_start` 또는 `sleep_end` 후보를 반환한다.
- R3 (Must): WHEN 사용자가 기저귀 소변 또는 대변 문장을 입력하면, THE SYSTEM SHALL `diaper_pee` 또는 `diaper_poop` 후보를 반환한다.
- R4 (Must): WHEN 사용자가 체온 문장을 입력하면, THE SYSTEM SHALL `temperature` 후보와 섭씨 값을 반환한다.
- R5 (Must): WHEN 사용자가 목욕 또는 메모 문장을 입력하면, THE SYSTEM SHALL `bath` 또는 `memo` 후보를 반환한다.
- R6 (Must): WHEN 파서가 결과를 반환하면, THE SYSTEM SHALL `parsedLog`, `confidence`, `needsConfirmation`, `originalText`를 포함한다.

## 영향 범위

- 도메인: `src/domain/parser`, `src/domain/baby-logs`
- UI: 없음
- 저장소: 없음
- 문서: PR 로드맵 상태

## 제외 범위

- 서버 사이드 LLM 파싱
- 음성 인식 구현
- 저장소 저장
- 확인 화면 UI
