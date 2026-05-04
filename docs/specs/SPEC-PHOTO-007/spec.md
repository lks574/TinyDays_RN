# SPEC-PHOTO-007: 사진 signed URL 캐시와 만료 후 갱신

상태: draft
생성일: 2026-05-04
도메인: PHOTO

## 목적

사진 탭이 원격 사진을 반복 조회할 때 불필요한 signed download URL 발급 요청을 줄이고, URL 만료로 이미지가 깨진 경우 해당 사진만 새 URL로 갱신한다.

## 요구사항

- R1 (Must): WHEN 사진 탭이 원격 `media_assets`를 조회하면, THE SYSTEM SHALL 아직 유효한 signed download URL 캐시가 있는 사진은 Edge Function 호출 없이 캐시 URL을 사용한다.
- R2 (Must): WHEN 캐시된 signed URL이 만료됐거나 만료 완충 시간 안에 들어오면, THE SYSTEM SHALL 새 signed download URL을 요청하고 캐시를 교체한다.
- R3 (Must): WHEN 화면에 표시 중인 원격 사진 이미지 로딩이 실패하면, THE SYSTEM SHALL 해당 사진의 signed download URL만 새로 요청해 화면 사진 URI를 갱신한다.
- R4 (Must): WHEN session, 원격 family mapping, signed URL 요청이 실패하면, THE SYSTEM SHALL 로컬 사진 목록 표시를 막지 않고 기존 원격 실패 상태를 유지한다.
- R5 (Must): WHEN signed URL을 캐시하면, THE SYSTEM SHALL 민감한 임시 접근 URL을 영구 저장소에 쓰지 않고 앱 프로세스 메모리에만 보관한다.

## 영향 범위

- 도메인: `src/domain/photos`
- UI: `app/(tabs)/photos.tsx`
- 저장소: `src/features/photos`
- 문서: `docs/specs/SPEC-PHOTO-007`, `docs/product/next-task.md`

## 제외 범위

- SQLite 또는 AsyncStorage 기반 signed URL 영구 캐시.
- 백그라운드 선제 갱신 worker.
- 썸네일/파생 이미지 signed URL 정책.
- Edge Function API 변경.
