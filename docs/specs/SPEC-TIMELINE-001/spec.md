# SPEC-TIMELINE-001: 날짜별 타임라인

상태: draft
생성일: 2026-04-28
도메인: TIMELINE

## 목적

PR-08에서는 저장된 `baby_logs`를 기록 탭에서 날짜 기준으로 조회할 수 있게 한다. 홈의 최근 타임라인과 같은 `localBabyLogRepository` 데이터를 사용하고, 부모가 오늘과 이전 날짜 기록을 구분해 볼 수 있는 흐름을 만든다.

## 요구사항

- R1 (Must): WHEN 사용자가 기록 탭을 열면, THE SYSTEM SHALL 로컬 저장소의 `BabyLog` 목록을 불러온다.
- R2 (Must): WHEN 사용자가 날짜를 선택하면, THE SYSTEM SHALL 선택한 날짜의 기록만 표시한다.
- R3 (Must): WHEN 선택 날짜에 기록이 여러 개 있으면, THE SYSTEM SHALL 기록을 시간순으로 표시한다.
- R4 (Must): WHEN 사용자가 기록 타입 필터를 선택하면, THE SYSTEM SHALL 선택 날짜 안에서 해당 타입 기록만 표시한다.
- R5 (Must): WHEN 홈에서 생성한 기록이 저장되어 있으면, THE SYSTEM SHALL 기록 탭에서도 같은 데이터 소스로 해당 기록을 조회한다.
- R6 (Should): WHEN 선택 날짜에 기록이 없으면, THE SYSTEM SHALL 빈 상태를 표시한다.

## 영향 범위

- 도메인: `src/features/timeline`
- UI: `app/(tabs)/logs.tsx`
- 저장소: 기존 `localBabyLogRepository` 재사용
- 문서: PR-08 상태 문서

## 제외 범위

- 기록 수정과 삭제
- 서버 동기화
- Supabase 쿼리
- 가족별 권한 모델 변경
- 오늘 요약과 인사이트 계산
