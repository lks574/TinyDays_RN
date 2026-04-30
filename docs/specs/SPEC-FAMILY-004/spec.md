# SPEC-FAMILY-004: 가족 초대와 구성원 연결 1차

상태: draft
생성일: 2026-04-30
도메인: FAMILY

## 목적

로그인한 `parent`가 가족 초대 코드를 만들고, 다른 로그인 사용자가 그 코드를 입력해 같은 원격 가족에 `family` 역할로 합류하게 한다.

## 요구사항

- R1 (Must): WHEN 원격 가족 mapping이 있는 `parent`가 초대 생성을 요청하면, THE SYSTEM SHALL 가족 초대 코드를 생성한다.
- R2 (Must): WHEN 로그인한 사용자가 유효한 초대 코드를 입력하면, THE SYSTEM SHALL 해당 사용자를 원격 `family_members`에 `family` 역할로 추가한다.
- R3 (Must): WHEN 초대 수락이 성공하면, THE SYSTEM SHALL 원격 family/child/member mapping을 로컬에 저장한다.
- R4 (Must): WHEN `family` 역할 또는 비구성원이 초대 생성을 요청하면, THE SYSTEM SHALL 초대 생성을 거부한다.
- R5 (Must): WHEN 초대 코드가 없거나 만료되었거나 취소되었으면, THE SYSTEM SHALL 가족 합류를 거부한다.
- R6 (Must): WHEN Supabase 설정 또는 session이 없으면, THE SYSTEM SHALL 기존 로컬 가족/기록/사진 흐름을 유지한다.

## 영향 범위

- 도메인: `src/domain/family`
- UI: `app/(tabs)/family.tsx`
- 저장소/백엔드: `src/features/family`, Supabase migration/RPC/RLS
- 문서: `docs/specs/SPEC-FAMILY-004`, `docs/engineering/project-setup.md`, `docs/product/next-task.md`

## 제외 범위

- 초대 취소/재발급 관리 화면.
- 구성원 제거.
- 여러 가족 전환.
- deep link 기반 초대 수락.
- 원격 가족 데이터를 로컬 family context로 완전히 교체하는 동기화.
