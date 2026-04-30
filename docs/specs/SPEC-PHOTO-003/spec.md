# SPEC-PHOTO-003: R2 기반 사진 원격 저장 1차

상태: draft
생성일: 2026-04-30
도메인: PHOTO

## 목적

가족 사진 원본을 Cloudflare R2 private bucket에 저장하고, Supabase에는 `media_assets` metadata만 남기는 첫 원격 저장 경로를 만든다. 기존 로컬 사진 추가 흐름은 유지한다.

## 요구사항

- R1 (Must): WHEN 사용자가 사진을 추가하면, THE SYSTEM SHALL 사진 metadata를 먼저 로컬 저장소에 저장한다.
- R2 (Must): WHEN Supabase session과 원격 family mapping이 있으면, THE SYSTEM SHALL Supabase Edge Function을 통해 `media_assets` draft row와 R2 signed upload URL을 요청한다.
- R3 (Must): WHEN R2 업로드가 성공하면, THE SYSTEM SHALL `media_assets.status`를 `uploaded`로 갱신하고 로컬 사진 metadata에 원격 asset 정보를 반영한다.
- R4 (Must): WHEN 원격 업로드가 실패하면, THE SYSTEM SHALL 로컬 사진 저장 흐름을 실패시키지 않는다.
- R5 (Must): WHEN 가족 구성원이 아닌 사용자가 접근하면, THE SYSTEM SHALL Supabase RLS를 통해 metadata 조회와 signed URL 발급을 차단한다.

## 영향 범위

- 도메인: `src/domain/photos`
- UI: `app/(tabs)/photos.tsx`
- 저장소: `src/features/photos`, `supabase/functions/media-r2-url`
- 문서: `docs/architecture/decisions.md`, `docs/engineering/project-setup.md`

## 제외 범위

- 썸네일 생성 고도화.
- 원격 업로드 retry queue.
- 사진 삭제와 R2 object 삭제.
- 다중 기기 완전 동기화.
- 공개 공유, 댓글, 반응.
