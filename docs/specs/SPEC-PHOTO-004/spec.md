# SPEC-PHOTO-004: 원격 사진 조회 URL 연결 1차

상태: draft
생성일: 2026-04-30
도메인: PHOTO

## 목적

업로드된 원격 `media_assets` 사진 metadata를 앱에서 조회하고, 가족 권한이 확인된 사용자가 signed download URL로 사진을 볼 수 있게 한다. 기존 로컬 사진 목록은 원격 조회 실패와 무관하게 유지한다.

## 요구사항

- R1 (Must): WHEN 사진 탭이 열리면, THE SYSTEM SHALL 먼저 로컬 사진 metadata를 조회해 화면에 표시 가능한 상태를 만든다.
- R2 (Must): WHEN Supabase session과 원격 family mapping이 있으면, THE SYSTEM SHALL 원격 `media_assets`에서 `uploaded` 상태의 사진 metadata를 조회한다.
- R3 (Must): WHEN 원격 사진 metadata를 받으면, THE SYSTEM SHALL 각 사진의 signed download URL을 요청하고 로컬 사진 목록과 병합한다.
- R4 (Must): WHEN 원격 조회 또는 signed URL 요청이 실패하면, THE SYSTEM SHALL 기존 로컬 사진 목록 표시를 막지 않는다.
- R5 (Must): WHEN 가족 구성원이 아닌 사용자가 접근하면, THE SYSTEM SHALL Supabase RLS와 Edge Function 검증을 통해 metadata 조회와 download URL 발급을 차단한다.

## 영향 범위

- 도메인: `src/domain/photos`
- UI: `app/(tabs)/photos.tsx`
- 저장소: `src/features/photos`, Supabase `media_assets`, `media-r2-url`
- 문서: `docs/specs/SPEC-PHOTO-004`

## 제외 범위

- URL 만료 후 자동 갱신 최적화.
- signed URL 캐시.
- 썸네일 파생 asset 조회 최적화.
- 사진 삭제와 R2 object 삭제.
- 다중 기기 완전 동기화.
