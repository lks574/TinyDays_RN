# SPEC-PHOTO-001: 사진 업로드 진입

상태: draft
생성일: 2026-04-28
도메인: PHOTO

## 목적

핵심 기록 루프 이후 부모가 사진 탭에서 아기 사진을 추가하고, 가족과 선택된 아기 및 날짜 기준으로 확인할 수 있는 MVP 진입점을 만든다.

## 요구사항

- R1 (Must): WHEN 사용자가 사진 탭을 열면, THE SYSTEM SHALL 현재 가족과 선택된 아기 기준의 사진 목록을 날짜별로 표시한다.
- R2 (Must): WHEN 사용자가 업로드 버튼을 누르면, THE SYSTEM SHALL 기기 사진 라이브러리에서 이미지 선택을 시작한다.
- R3 (Must): WHEN 사용자가 이미지를 선택하면, THE SYSTEM SHALL 사진 URI와 메타데이터를 `family_id`, `child_id`, `created_by`, `captured_at`과 함께 로컬 저장소에 저장한다.
- R4 (Must): WHEN 사진 라이브러리 권한이 거부되면, THE SYSTEM SHALL 저장을 시도하지 않고 사용자에게 권한 안내를 표시한다.
- R5 (Should): WHEN 저장된 사진이 없으면, THE SYSTEM SHALL 빈 상태와 업로드 진입점을 표시한다.

## 영향 범위

- 도메인: `src/domain/photos`
- UI: `app/(tabs)/photos.tsx`
- 저장소: `src/features/photos`, `AsyncStorage`
- 문서: `docs/architecture/decisions.md`, `docs/engineering/project-setup.md`, PR 로드맵

## 제외 범위

- Supabase Storage 실제 업로드.
- 사진 댓글, 반응, 공개 공유.
- AI 영상 생성.
- 복잡한 권한 체계 또는 원격 동기화.
