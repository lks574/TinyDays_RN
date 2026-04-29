# SPEC-SETUP-001: Supabase 백엔드 스키마와 RLS 초안

상태: draft
생성일: 2026-04-29
도메인: SETUP

## 목적

TinyDays의 local-first 방향을 유지하면서 가족 공유, 원격 백업, 사진 원격 저장을 준비할 수 있도록 Supabase 백엔드의 최소 schema와 `family_id` 기준 RLS 정책 초안을 만든다.

이 PR은 앱 저장 흐름을 원격으로 전환하지 않는다. 기존 `AsyncStorage` 기반 기록, 가족 context, 사진 metadata 저장은 그대로 유지하고, 서버 데이터 모델과 권한 검증 기반만 먼저 추가한다.

## 요구사항

- R1 (Must): WHEN Supabase migration을 적용하면, THE SYSTEM SHALL `families`, `family_members`, `children`, `baby_logs`, `media_assets` 테이블을 생성한다.
- R2 (Must): WHEN 사용자가 `family_members`에 속하지 않으면, THE SYSTEM SHALL 해당 `family_id`의 가족, 아기, 기록, 미디어 metadata를 조회할 수 없게 한다.
- R3 (Must): WHEN 구성원 역할을 저장하면, THE SYSTEM SHALL `parent` 또는 `family`만 허용한다.
- R4 (Must): WHEN `parent` 구성원이 같은 가족의 데이터를 생성/수정하면, THE SYSTEM SHALL 가족, 아기, 기록, 미디어 metadata write를 허용한다.
- R5 (Must): WHEN `family` 구성원이 같은 가족의 데이터를 조회하면, THE SYSTEM SHALL read를 허용하되 가족 관리, 아기 관리, 기록 수정, 미디어 업로드 metadata 변경은 허용하지 않는다.
- R6 (Must): WHEN `baby_logs`를 저장하면, THE SYSTEM SHALL 기존 앱 도메인의 `BabyLog` 필드와 충돌하지 않는 통합 기록 구조를 사용한다.
- R7 (Must): WHEN `media_assets`를 저장하면, THE SYSTEM SHALL Supabase DB에는 R2 object key와 metadata만 저장하고 public URL이나 파일 원본은 저장하지 않는다.
- R8 (Should): WHEN schema/RLS가 추가되면, THE SYSTEM SHALL local Supabase 환경에서 재현 가능한 migration과 seed 또는 policy test SQL을 포함한다.

## 초기 테이블

### `families`

- `id`: uuid primary key
- `name`: text not null
- `created_by`: uuid references `auth.users(id)`
- `created_at`: timestamptz not null default now()
- `updated_at`: timestamptz not null default now()

### `family_members`

- `id`: uuid primary key
- `family_id`: uuid references `families(id)` on delete cascade
- `user_id`: uuid references `auth.users(id)` on delete cascade
- `name`: text not null
- `role`: text not null check in `parent`, `family`
- `created_at`: timestamptz not null default now()
- `updated_at`: timestamptz not null default now()
- unique: (`family_id`, `user_id`)

### `children`

- `id`: uuid primary key
- `family_id`: uuid references `families(id)` on delete cascade
- `name`: text not null
- `birth_date`: date null
- `created_at`: timestamptz not null default now()
- `updated_at`: timestamptz not null default now()

### `baby_logs`

- `id`: uuid primary key
- `family_id`: uuid references `families(id)` on delete cascade
- `child_id`: uuid references `children(id)` on delete cascade
- `created_by`: uuid references `auth.users(id)`
- `log_type`: text not null
- `recorded_at`: timestamptz not null
- `amount`: numeric null
- `unit`: text null
- `memo`: text null
- `source`: text not null
- `original_text`: text null
- `confidence`: numeric not null default 1
- `created_at`: timestamptz not null default now()
- `updated_at`: timestamptz not null default now()

### `media_assets`

- `id`: uuid primary key
- `family_id`: uuid references `families(id)` on delete cascade
- `child_id`: uuid references `children(id)` on delete cascade
- `created_by`: uuid references `auth.users(id)`
- `asset_type`: text not null check in `photo`, `video`, `thumbnail`
- `storage_provider`: text not null default `r2`
- `bucket`: text not null
- `object_key`: text not null
- `status`: text not null check in `draft`, `uploading`, `uploaded`, `failed`, `deleted`
- `file_name`: text null
- `file_size`: bigint null
- `mime_type`: text null
- `width`: integer null
- `height`: integer null
- `captured_at`: timestamptz null
- `created_at`: timestamptz not null default now()
- `updated_at`: timestamptz not null default now()

## RLS 정책 방향

- `families`: 같은 `family_id`의 구성원만 조회 가능. `parent`만 생성자 기준 관리 가능.
- `family_members`: 같은 가족 구성원만 조회 가능. `parent`만 구성원 추가/수정 가능.
- `children`: 같은 가족 구성원만 조회 가능. `parent`만 생성/수정/삭제 가능.
- `baby_logs`: 같은 가족 구성원은 조회 가능. `parent`만 생성/수정/삭제 가능.
- `media_assets`: 같은 가족 구성원은 조회 가능. `parent`만 생성/수정 가능. 삭제는 metadata soft delete 상태 변경을 우선한다.

## 영향 범위

- 도메인: `BabyLog`, `FamilyMemberRole`, `ChildProfile`, `BabyPhoto`와 서버 schema 필드 정렬.
- UI: 없음.
- 저장소: Supabase migration, RLS policy, seed 또는 SQL test.
- 문서: `docs/specs/SPEC-SETUP-001`, 필요 시 `docs/architecture/decisions.md`, `docs/engineering/project-setup.md`, `docs/product/roadmaps/mvp-pr-roadmap.md`.

## 제외 범위

- 앱 로그인 UI 구현.
- `@supabase/supabase-js` 앱 client 연결.
- 기존 `AsyncStorage` repository를 Supabase repository로 교체.
- Expo SQLite 이전.
- sync queue와 충돌 해결.
- R2 bucket 생성, signed upload/download URL 발급.
- Supabase Storage 사용.
- 서버 사이드 LLM 파싱.
- `parent`, `family`를 넘어서는 권한 체계.
