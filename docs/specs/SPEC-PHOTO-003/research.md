# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-17은 R2 private bucket 저장, signed URL 발급, `media_assets.status` 갱신을 요구한다.
- `docs/architecture/backend-storage-strategy.md`: 미디어 원본은 R2에 두고 Supabase에는 metadata만 저장한다.
- `docs/architecture/decisions.md`: ADR-010은 local-first 앱, Supabase, Cloudflare R2 분리를 채택했다.

## 기존 코드

- `src/domain/photos/photo.ts`: 로컬 사진 metadata와 날짜별 그룹 helper가 있다.
- `src/features/photos/local-baby-photo-repository.ts`: AsyncStorage 기반 로컬 사진 metadata 저장소가 있다.
- `app/(tabs)/photos.tsx`: 사진 선택, 로컬 저장, 날짜별 그리드 표시를 구현한다.
- `supabase/migrations/20260429090000_initial_backend_schema.sql`: `media_assets` schema와 family RLS policy가 있다.
- `src/features/family/remote-family-mapping-repository.ts`: 로컬 family/child/member id와 원격 UUID mapping을 제공한다.

## 결정

- PR-17에서는 Supabase Edge Function `media-r2-url`이 R2 secret을 보관하고 signed URL을 발급한다.
- Edge Function은 사용자의 Authorization header로 Supabase client를 만들고 RLS를 그대로 적용한다.
- 앱은 사진 metadata를 로컬에 먼저 저장하고, 원격 저장 실패를 로컬 저장 실패로 취급하지 않는다.
- 원격 업로드 retry queue와 썸네일 파생 asset은 후속 PR로 둔다.

## 리스크

- 실제 R2 업로드 검증은 Cloudflare 계정, R2 bucket, Supabase Function 배포가 필요하다.
- signed URL 만료 시간과 모바일 네트워크 지연은 후속 사용성 검증이 필요하다.
- 로컬 URI 장기 보존과 원격 업로드 retry queue는 아직 해결하지 않는다.
