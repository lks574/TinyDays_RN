# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-18은 원격 `media_assets` 조회, signed download URL 요청, 로컬/원격 사진 목록 병합을 요구한다.
- `docs/architecture/decisions.md`: ADR-012는 R2 secret을 앱에 두지 않고 Supabase Edge Function에서 signed URL을 발급한다고 정했다.
- `docs/engineering/project-setup.md`: PR-17 기준 `media-r2-url` Edge Function과 R2 환경 변수 전제를 문서화했다.

## 기존 코드

- `src/domain/photos/photo.ts`: `BabyPhoto`와 날짜별 그룹 helper가 있다.
- `src/domain/photos/remote-photo.ts`: 원격 업로드 요청과 upload/download URL 타입 일부가 있다.
- `src/features/photos/remote-baby-photo-repository.ts`: `create_download` Edge Function 호출 함수가 있다.
- `src/features/photos/local-baby-photo-repository.ts`: 로컬 `AsyncStorage` 사진 metadata 저장소가 있다.
- `app/(tabs)/photos.tsx`: 사진 탭에서 로컬 사진을 날짜별 그리드로 표시한다.
- `supabase/migrations/20260429090000_initial_backend_schema.sql`: `media_assets` select RLS는 가족 구성원만 허용한다.

## 결정

- 앱은 로컬 사진을 먼저 읽고 원격 조회는 가능한 경우에만 추가한다.
- 원격 사진은 `media_assets.id`를 기준으로 중복 제거한다.
- 원격-only 사진은 signed download URL을 `BabyPhoto.uri`로 사용하고, 로컬 family/child id로 변환해 기존 사진 탭 그룹 로직을 재사용한다.
- signed URL 캐시와 만료 후 갱신은 후속 PR로 둔다.

## 리스크

- 실제 R2 download URL 동작 검증은 배포된 Edge Function과 R2 환경 변수가 필요하다.
- signed URL 만료 후 장시간 열린 화면에서 이미지가 만료될 수 있다.
- 원격 사진이 많아지면 asset별 download URL 요청을 병렬 제한하거나 썸네일 중심으로 최적화해야 한다.
