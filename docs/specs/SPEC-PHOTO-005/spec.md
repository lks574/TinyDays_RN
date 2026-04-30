# SPEC-PHOTO-005: 사진 원격 업로드 재시도 queue

상태: draft
생성일: 2026-04-30
도메인: PHOTO

## 목적

사진 metadata를 로컬에 먼저 저장하는 흐름을 유지하면서, R2 원격 업로드 실패를 `AsyncStorage` queue에 남기고 이후 사진 업로드 경로에서 재시도한다.

## 요구사항

- R1 (Must): WHEN 사진 원격 업로드 준비, R2 PUT, 완료 알림 중 하나가 실패하면, THE SYSTEM SHALL 로컬 사진 저장을 유지하고 실패한 사진을 재시도 queue에 저장한다.
- R2 (Must): WHEN Supabase session과 원격 family mapping이 있고 사진 업로드 경로가 다시 실행되면, THE SYSTEM SHALL 같은 사용자 queue item을 먼저 재시도한다.
- R3 (Must): WHEN queue item 재시도가 성공하면, THE SYSTEM SHALL 해당 queue item을 삭제하고 로컬 사진의 remote 상태를 `uploaded`로 갱신한다.
- R4 (Must): WHEN queue item 재시도가 다시 실패하면, THE SYSTEM SHALL `attempt_count`, `last_attempt_at`, `last_error`를 갱신한다.
- R5 (Must): WHEN Supabase 설정, session, mapping 중 하나가 없으면, THE SYSTEM SHALL 기존 로컬 사진 저장 흐름을 막지 않는다.

## 영향 범위

- 도메인: `src/domain/photos`
- UI: `app/(tabs)/photos.tsx`
- 저장소: `src/features/photos`
- 문서: `docs/specs/SPEC-PHOTO-005`

## 제외 범위

- 백그라운드 주기 재시도.
- 앱 시작 시 자동 재시도.
- R2 orphan draft/object 정리.
- 사진 삭제와 R2 object 삭제.
- Expo SQLite 전환.
