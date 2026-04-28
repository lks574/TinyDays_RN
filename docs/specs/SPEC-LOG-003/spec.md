# SPEC-LOG-003: 로컬 기록 저장소

상태: draft
생성일: 2026-04-28
도메인: LOG

## 목적

빠른 기록과 텍스트 기록으로 생성한 `BabyLog`를 앱 재시작 후에도 유지한다. MVP에서는 가족/인증 서버 흐름을 열지 않고, 로컬 기기 저장소로 핵심 기록 루프를 먼저 검증한다.

## 요구사항

- R1 (Must): WHEN 앱이 시작되면, THE SYSTEM SHALL 로컬 저장소에서 기존 `BabyLog` 목록을 불러온다.
- R2 (Must): WHEN 사용자가 빠른 기록을 저장하면, THE SYSTEM SHALL 새 `BabyLog`를 로컬 저장소에 저장하고 최근 타임라인에 반영한다.
- R3 (Must): WHEN 사용자가 텍스트 파싱 결과를 확인 후 저장하면, THE SYSTEM SHALL 확인된 `BabyLog`를 로컬 저장소에 저장한다.
- R4 (Must): WHEN 저장소 구현이 바뀌어도, THE SYSTEM SHALL UI가 repository interface에 의존하도록 유지한다.
- R5 (Should): WHEN 로컬 저장소 읽기나 쓰기가 실패하면, THE SYSTEM SHALL 앱이 중단되지 않도록 오류 상태를 화면에 표시한다.

## 영향 범위

- 도메인: `src/domain/baby-logs`
- UI: `app/(tabs)/index.tsx`
- 저장소: `AsyncStorage` 기반 `BabyLogRepository`
- 문서: `docs/architecture/decisions.md`, `docs/engineering/project-setup.md`, `docs/product/roadmaps/mvp-pr-roadmap.md`

## 제외 범위

- Supabase auth, family, RLS, 원격 `baby_logs` 스키마 구현
- 사진 저장소
- 동기화, 백업, 다중 기기 충돌 해결
- 기록 수정과 삭제
