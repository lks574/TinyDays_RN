# SPEC-FAMILY-005: 가족 구성원 목록 조회와 역할 표시

상태: draft
생성일: 2026-04-30
도메인: FAMILY

## 목적

원격 가족 mapping이 있는 사용자가 가족 탭에서 Supabase `family_members` 기준 구성원 목록과 `parent`/`family` 역할을 확인하게 한다.

## 요구사항

- R1 (Must): WHEN 로그인한 사용자에게 원격 family mapping이 있으면, THE SYSTEM SHALL 해당 원격 가족의 `family_members` 목록을 조회한다.
- R2 (Must): WHEN 가족 구성원 목록이 표시되면, THE SYSTEM SHALL 각 구성원의 이름과 `parent` 또는 `family` 역할을 표시한다.
- R3 (Must): WHEN 조회된 구성원이 현재 로그인 사용자와 같으면, THE SYSTEM SHALL 해당 구성원을 현재 사용자로 구분해 표시한다.
- R4 (Must): WHEN 원격 구성원 목록 조회가 실패하면, THE SYSTEM SHALL 기존 로컬 가족 정보와 로컬 현재 사용자 표시를 유지한다.
- R5 (Must): WHEN Supabase 설정, session, 원격 mapping이 없으면, THE SYSTEM SHALL 원격 조회 없이 기존 로컬 가족 흐름을 유지한다.

## 영향 범위

- 도메인: `src/domain/family`
- UI: `app/(tabs)/family.tsx`
- 저장소/백엔드: `src/features/family`, 기존 Supabase `family_members` RLS
- 문서: `docs/specs/SPEC-FAMILY-005`, `docs/product/next-task.md`

## 제외 범위

- 구성원 제거.
- 구성원 역할 변경.
- 초대 취소/재발급 관리.
- 여러 가족 전환.
- 원격 구성원 목록을 로컬 family context로 동기화하는 작업.
