# 구현 계획

## 태스크

- [x] T1: 원격 사진 업로드 request/response 도메인 타입과 mapping helper를 추가한다.
- [x] T2: 로컬 저장을 먼저 수행한 뒤 R2 업로드를 시도하는 사진 업로드 서비스를 추가한다.
- [x] T3: Supabase Edge Function으로 `media_assets` draft 생성, signed upload/download URL 발급, 업로드 완료 갱신을 구현한다.
- [x] T4: 사진 탭에서 기존 로컬 저장 대신 로컬 우선 원격 업로드 서비스를 호출한다.
- [x] T5: 단위 테스트와 프로젝트 문서를 업데이트한다.

## 구현 순서

1. `BabyPhoto`에 원격 asset metadata 필드를 optional로 추가한다.
2. 로컬 사진과 원격 family mapping을 Supabase `media_assets` 입력으로 변환한다.
3. Edge Function 호출 repository와 업로드 orchestration service를 작성한다.
4. 사진 탭의 저장 경로를 service로 교체한다.
5. R2 환경 변수와 배포/검증 전제를 문서화한다.

## 테스트 계획

- 도메인 mapping helper가 local id를 remote UUID로 변환하는지 테스트한다.
- session/mapping이 있을 때 로컬 저장 후 원격 업로드와 완료 갱신이 호출되는지 테스트한다.
- 원격 업로드 실패 시 로컬 사진이 유지되는지 테스트한다.
- 기존 사진 그룹/로컬 저장소 테스트가 깨지지 않는지 확인한다.
