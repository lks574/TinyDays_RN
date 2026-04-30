# SPEC-FAMILY-003: 원격 가족과 아기 bootstrap

상태: draft
생성일: 2026-04-30
도메인: FAMILY

## 목적

PR-14에서 연결한 Supabase Auth session을 기준으로 로그인한 사용자가 원격 `families`, `family_members`, `children` 기준 데이터를 만들 수 있게 한다.

PR-15는 기존 `AsyncStorage` 기반 로컬 가족, 기록, 사진 흐름을 유지하면서 원격 family UUID와 local ID의 매핑을 저장한다. 이 매핑은 후속 PR-16 `baby_logs` 클라우드 백업에서 로컬 기록을 원격 `family_id`, `child_id`, `created_by`로 변환하는 기준이 된다.

## 요구사항

- R1 (Must): WHEN Supabase session이 없거나 Supabase config가 없으면, THE SYSTEM SHALL 원격 bootstrap을 실행하지 않고 기존 로컬 가족/기록/사진 흐름을 유지한다.
- R2 (Must): WHEN 로그인한 사용자가 원격 가족 만들기를 실행하면, THE SYSTEM SHALL 현재 로컬 가족 이름, 아기 이름, 생년월일을 사용해 원격 `families`, 본인 `parent` `family_members`, 첫 `children` 레코드를 원자적으로 생성한다.
- R3 (Must): WHEN 원격 bootstrap이 성공하면, THE SYSTEM SHALL 로컬 `family.id`, `selected_child_id`, `current_member.id`와 원격 UUID의 매핑을 별도 로컬 저장소에 저장한다.
- R4 (Must): WHEN 이미 원격 매핑이 있거나 서버에 사용자의 원격 가족 멤버십이 있으면, THE SYSTEM SHALL 중복 가족 생성을 막고 기존 원격 가족/아기 상태를 표시한다.
- R5 (Must): WHEN 첫 `parent` 멤버를 생성해야 하면, THE SYSTEM SHALL 모바일 앱에 service role key를 두지 않고 RLS와 충돌하지 않는 서버 기준 bootstrap 경로를 사용한다.
- R6 (Must): WHEN 원격 가족 상태를 표시하면, THE SYSTEM SHALL `parent`와 `family` 역할만 표시하고 공개 공유 또는 소셜 공유 동작을 제공하지 않는다.
- R7 (Should): WHEN 원격 bootstrap이 실패하면, THE SYSTEM SHALL 로컬 가족 context를 변경하지 않고 재시도 가능한 오류 상태를 표시한다.

## 영향 범위

- 도메인: `src/domain/family`
- UI: `app/(tabs)/family.tsx`
- 저장소: Supabase `families`, `family_members`, `children`; `AsyncStorage` 기반 원격 매핑 repository
- 백엔드: Supabase migration 또는 RPC, RLS smoke test
- 문서: `docs/specs/SPEC-FAMILY-003`, `docs/engineering/project-setup.md`, `docs/product/roadmaps/mvp-pr-roadmap.md`, `docs/product/next-task.md`

## 제외 범위

- 초대 링크/코드 생성과 공유 UX.
- `family` 역할 구성원의 실제 초대 수락 플로우.
- 기존 로컬 `BabyLog`와 사진 metadata의 원격 백업.
- 기존 로컬 ID를 원격 UUID로 덮어쓰기.
- 다중 아기 선택/관리 고도화.
- Expo SQLite 이전 또는 sync queue 구현.
- R2 signed URL 또는 사진 원격 업로드.
- 서버 사이드 LLM 파싱.
