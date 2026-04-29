# SPEC-LOG-004: 홈 화면 디자인 시스템 적용

상태: draft
생성일: 2026-04-29
도메인: LOG

## 목적

홈 화면을 `docs/design/prototype/`의 디자인 방향과 `src/shared/ui/` 디자인 시스템 토큰에 맞춰 정리한다. 기존 빠른 기록, 텍스트 기록, 저장 전 확인, 오늘 요약, 최근 타임라인 동작은 유지한다.

## 요구사항

- R1 (Must): WHEN 사용자가 홈 화면을 열면, THE SYSTEM SHALL 아기 이름, D+ 정보, 마지막 기록 상태를 디자인 시스템 타이포그래피와 토큰으로 표시한다.
- R2 (Must): WHEN 오늘 기록이 있거나 없으면, THE SYSTEM SHALL 수유, 수면, 기저귀, 마지막 기록 요약을 하나의 요약 영역 안에서 표시한다.
- R3 (Must): WHEN 사용자가 빠른 기록을 누르면, THE SYSTEM SHALL 기존 `createQuickLogCandidate` 흐름으로 기록을 저장하고 최근 타임라인에 반영한다.
- R4 (Must): WHEN 사용자가 텍스트 기록을 입력하면, THE SYSTEM SHALL 파싱 결과 확인 UI를 거친 뒤 저장할 수 있게 한다.
- R5 (Should): WHEN 최근 기록을 표시하면, THE SYSTEM SHALL 기록 타입별 색상 점과 시간, 값, 메모를 디자인 시스템 톤으로 표시한다.

## 영향 범위

- 도메인: 변경 없음
- UI: `app/(tabs)/index.tsx`, `src/shared/ui/*`
- 저장소: 변경 없음
- 문서: 본 SPEC

## 제외 범위

- 서버 사이드 LLM 파싱
- 음성 입력 추가
- 저장소, family context, `baby_logs` 모델 변경
- 다른 탭의 디자인 시스템 전면 적용
