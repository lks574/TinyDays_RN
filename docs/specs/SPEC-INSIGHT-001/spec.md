# SPEC-INSIGHT-001: 오늘 요약

상태: draft
생성일: 2026-04-28
도메인: INSIGHT

## 목적

PR-09에서는 저장된 `BabyLog`에서 부모가 홈에서 바로 확인할 수 있는 오늘 요약을 계산하고 표시한다.

## 요구사항

- R1 (Must): WHEN 오늘 기록 목록이 주어지면, THE SYSTEM SHALL 오늘 수유 횟수와 총량을 계산한다.
- R2 (Must): WHEN 오늘 수면 시작/종료 기록이 주어지면, THE SYSTEM SHALL 오늘 수면 횟수와 종료된 수면 총 시간을 계산한다.
- R3 (Must): WHEN 오늘 기저귀 기록이 주어지면, THE SYSTEM SHALL 소변/대변 횟수와 합계를 계산한다.
- R4 (Must): WHEN 기록 목록이 주어지면, THE SYSTEM SHALL 마지막 기록 상태를 계산한다.
- R5 (Must): WHEN 홈 화면이 표시되면, THE SYSTEM SHALL 로컬 저장소의 실제 기록 기반 오늘 요약을 표시한다.

## 영향 범위

- 도메인: `src/domain/insights`
- UI: `app/(tabs)/index.tsx`
- 저장소: 기존 `localBabyLogRepository` 재사용
- 문서: PR 로드맵 상태 업데이트

## 제외 범위

- 최근 7일 패턴 분석.
- 다음 행동 예측.
- 서버 AI 또는 원격 분석.
