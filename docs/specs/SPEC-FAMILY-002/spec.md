# SPEC-FAMILY-002: 가족 화면 디자인 시스템 프로토타입 적용

상태: draft
생성일: 2026-04-29
도메인: FAMILY

## 목적

기존 가족 탭의 로컬 가족/아기 정보 저장 흐름은 유지하되, 앱 공통 디자인 시스템과 `docs/design/prototype`의 가족 화면 패턴을 적용해 MVP 검증용 화면 품질을 높인다.

## 요구사항

- R1 (Must): WHEN 사용자가 가족 탭을 열면, THE SYSTEM SHALL 공통 `theme`와 `src/shared/ui` 컴포넌트를 사용해 헤더, 섹션, 입력, 버튼, 구성원 정보를 렌더링한다.
- R2 (Must): WHEN 사용자가 가족 이름, 아기 이름, 생년월일을 저장하면, THE SYSTEM SHALL 기존 로컬 `family context` 저장 동작을 유지한다.
- R3 (Must): WHEN 구성원 권한이 표시되면, THE SYSTEM SHALL `parent`와 `family` 역할만 표현한다.
- R4 (Should): WHEN 가족 탭이 표시되면, THE SYSTEM SHALL 가족 정보가 비공개 데이터라는 안내를 제공한다.

## 영향 범위

- 도메인: 없음.
- UI: `app/(tabs)/family.tsx`
- 저장소: 없음.
- 문서: `docs/specs/SPEC-FAMILY-002`

## 제외 범위

- 실제 가족 초대, 초대 링크/코드 생성.
- 구성원 제거, 다중 구성원 관리.
- 인증, 원격 동기화, Supabase 권한 모델.
- `parent`, `family`를 넘어서는 권한 체계.
