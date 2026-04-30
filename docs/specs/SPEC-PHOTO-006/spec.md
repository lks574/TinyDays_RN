# SPEC-PHOTO-006: 사진 삭제와 R2 정리

상태: draft
생성일: 2026-04-30
도메인: PHOTO

## 목적

사용자가 사진을 삭제할 때 로컬 metadata, Supabase `media_assets`, R2 object 상태가 분리되지 않도록 사진 lifecycle의 삭제 경로를 추가한다.

## 요구사항

- R1 (Must): WHEN 사용자가 사진 삭제를 확인하면, THE SYSTEM SHALL 해당 사진을 현재 사진 목록과 로컬 `AsyncStorage` metadata에서 제거한다.
- R2 (Must): WHEN 삭제 대상 사진에 `remote_media_asset_id`가 있으면, THE SYSTEM SHALL Supabase Edge Function을 통해 R2 object 삭제와 `media_assets.status = deleted` 갱신을 요청한다.
- R3 (Must): WHEN Supabase session, 원격 family mapping, 또는 원격 삭제 요청이 실패하면, THE SYSTEM SHALL 로컬 사진 목록 동작을 중단하지 않고 실패 상태를 사용자에게 알린다.
- R4 (Must): WHEN 삭제 대상 사진이 원격 업로드 queue에 남아 있으면, THE SYSTEM SHALL 같은 로컬 사진의 queue item을 제거한다.
- R5 (Must): WHEN Edge Function이 원격 삭제를 처리하면, THE SYSTEM SHALL 사용자 scope Supabase client와 RLS로 가족 권한을 확인한 뒤 R2 `DELETE`를 수행한다.

## 영향 범위

- 도메인: `src/domain/photos`
- UI: `app/(tabs)/photos.tsx`
- 저장소: `src/features/photos`, `supabase/functions/media-r2-url`
- 문서: `docs/specs/SPEC-PHOTO-006`, `docs/engineering/project-setup.md`, `docs/architecture/decisions.md`

## 제외 범위

- 백그라운드 원격 삭제 재시도 queue.
- R2 bucket 전체 orphan scan.
- 썸네일 또는 파생 이미지 삭제.
- Expo SQLite 전환.
