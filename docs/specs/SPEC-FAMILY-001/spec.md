# SPEC-FAMILY-001: 가족과 아기 최소 모델

상태: draft
생성일: 2026-04-28
도메인: FAMILY

## 목적

로컬 MVP 흐름에서 기록이 특정 가족과 아기에게 귀속되도록 최소 family/child 경계를 만든다.

## 요구사항

- R1 (Must): WHEN 앱이 가족 정보를 불러오면, THE SYSTEM SHALL 최소 1개 가족과 1명 아기 프로필을 제공한다.
- R2 (Must): WHEN 사용자가 가족 탭에서 가족 이름과 아기 정보를 저장하면, THE SYSTEM SHALL 로컬 저장소에 family/child context를 저장한다.
- R3 (Must): WHEN 사용자가 빠른 기록 또는 텍스트 기록을 저장하면, THE SYSTEM SHALL 현재 family_id와 child_id를 `BabyLog`에 연결한다.
- R4 (Must): WHEN 권한을 표시하면, THE SYSTEM SHALL `parent`와 `family` 역할만 사용한다.
- R5 (Should): WHEN 아기 생년월일이 있으면, THE SYSTEM SHALL 홈에서 D+ 값을 계산해 표시한다.

## 영향 범위

- 도메인: `src/domain/family`
- UI: `app/(tabs)/family.tsx`, `app/(tabs)/index.tsx`
- 저장소: `AsyncStorage` 기반 로컬 family context
- 문서: PR 로드맵 상태 업데이트

## 제외 범위

- 인증, 원격 동기화, Supabase schema 구현.
- 초대 링크/코드 발급.
- `parent`, `family`를 넘어서는 세부 권한 체계.
- 다중 아기 선택 UI.
