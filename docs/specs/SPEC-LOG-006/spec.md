# SPEC-LOG-006: baby_logs 원격 pull/downsync와 다중 기기 조회

상태: draft
생성일: 2026-05-04
도메인: LOG

## 목적

원격 가족 mapping이 있는 사용자가 같은 가족의 `baby_logs`를 기록 탭에서 날짜 기준으로 조회할 수 있게 한다. 기존 local-first 기록 흐름은 유지하고, 원격 조회 실패는 로컬 기록 표시를 막지 않는다.

## 요구사항

- R1 (Must): WHEN 기록 탭이 열리면, THE SYSTEM SHALL 로컬 `AsyncStorage` 기록을 먼저 조회한다.
- R2 (Must): WHEN Supabase session과 원격 family mapping이 있으면, THE SYSTEM SHALL 선택된 날짜의 원격 `baby_logs`를 같은 가족/아기 기준으로 조회한다.
- R3 (Must): WHEN 원격 기록을 조회하면, THE SYSTEM SHALL Supabase RLS의 `family_members` 접근 제어를 따른다.
- R4 (Must): WHEN 로컬 기록과 원격 기록이 같은 기록으로 판단되면, THE SYSTEM SHALL 중복 표시하지 않고 로컬 기록을 우선한다.
- R5 (Must): WHEN 원격 조회가 실패하면, THE SYSTEM SHALL 로컬 기록만 표시하고 기록 탭 사용을 막지 않는다.

## 영향 범위

- 도메인: `src/domain/baby-logs/remote-baby-log.ts`
- UI: `app/(tabs)/logs.tsx`
- 저장소: `src/features/logging/remote-baby-log-repository.ts`, `src/features/logging/baby-log-library-service.ts`
- 문서: `docs/architecture/decisions.md`, `docs/engineering/project-setup.md`, `docs/product/next-task.md`

## 제외 범위

- 원격 기록을 로컬 저장소에 영구 저장하는 full downsync.
- 수정/삭제 충돌 해결.
- 로컬 ID와 원격 `baby_logs.id`의 영구 매핑.
- Expo SQLite 이전과 sync queue 통합.
- 백그라운드 자동 pull.
