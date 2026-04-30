# 리서치

## 기존 문서

- `docs/product/next-task.md`: 다음 작업으로 사진 삭제와 R2 정리를 지정했고, 로컬 metadata 삭제, `media_assets.status = deleted`, Edge Function 기반 R2 삭제를 예상 범위로 둔다.
- `docs/architecture/decisions.md`: ADR-012는 모바일 앱이 R2 secret을 갖지 않고 `media-r2-url` Edge Function이 R2 signed URL을 담당한다고 정했다.
- `docs/engineering/project-setup.md`: 사진 원격 저장/조회/업로드 재시도는 완료됐고, R2 orphan 정리는 후속 작업으로 남아 있다.

## 기존 코드

- `src/features/photos/local-baby-photo-repository.ts`: `AsyncStorage` 기반 사진 metadata 저장소이며 `listPhotos`, `savePhoto`만 있다.
- `src/features/photos/baby-photo-upload-service.ts`: 사진을 로컬에 먼저 저장한 뒤 원격 업로드와 queue 처리를 수행한다.
- `src/features/photos/remote-baby-photo-repository.ts`: Edge Function `create_upload`, `complete_upload`, `create_download` action 호출과 원격 metadata 조회가 있다.
- `supabase/functions/media-r2-url/index.ts`: R2 signed `GET`/`PUT` URL을 만들지만 삭제 action은 없다.
- `app/(tabs)/photos.tsx`: 사진 그리드 표시와 사진 추가는 있지만 삭제 UI는 없다.

## 결정

- 삭제 확인은 앱 기본 `Alert`로 처리한다.
- 로컬 삭제와 queue 제거를 먼저 수행하고, 원격 삭제는 가능한 경우에 이어서 처리한다.
- 원격 삭제 API는 기존 Edge Function에 `delete_photo` action으로 추가한다.
- R2 object 삭제는 Edge Function 내부에서 signed `DELETE` 요청으로 처리하고, 성공 후 `media_assets.status = deleted`로 갱신한다.

## 리스크

- 원격 삭제 실패 후 앱을 다시 불러오면 원격-only 사진이 다시 표시될 수 있다. MVP에서는 실패 메시지로 알리고 백그라운드 삭제 queue는 후속 작업으로 둔다.
- 실제 R2 삭제 검증은 Cloudflare R2 bucket과 Supabase Edge Function 배포가 필요하므로 수동 검증으로 남긴다.
