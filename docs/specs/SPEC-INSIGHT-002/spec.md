# SPEC-INSIGHT-002: 기본 인사이트

상태: draft
생성일: 2026-04-28
도메인: INSIGHT

## 목적

최근 7일 `baby_logs`를 기준으로 부모가 수유, 수면, 기저귀 패턴을 빠르게 확인할 수 있는 기본 인사이트를 제공한다.

## 요구사항

- R1 (Must): WHEN 사용자가 인사이트 탭을 열면, THE SYSTEM SHALL 최근 7일 수유, 수면, 기저귀 집계를 표시한다.
- R2 (Must): WHEN 최근 7일 기록이 있으면, THE SYSTEM SHALL 수유 횟수/총량, 수면 횟수/총 시간, 기저귀 횟수의 일평균을 deterministic logic으로 계산한다.
- R3 (Must): WHEN 다음 행동 안내를 계산하면, THE SYSTEM SHALL 머신러닝 없이 최근 기록과 고정 규칙만 사용한다.
- R4 (Should): WHEN 최근 7일 기록이 부족하면, THE SYSTEM SHALL 예측 대신 기록 축적 안내를 보여준다.

## 영향 범위

- 도메인: `src/domain/insights`
- UI: `app/(tabs)/insights.tsx`
- 저장소: 기존 `localBabyLogRepository` 사용
- 문서: PR 로드맵 상태 업데이트

## 제외 범위

- 머신러닝 또는 서버 AI 예측.
- 알림 예약.
- 아기별/가족별 필터링.
- 저장소 또는 데이터 모델 변경.
