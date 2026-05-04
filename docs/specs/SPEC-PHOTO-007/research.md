# 리서치

## 기존 문서

- `docs/product/next-task.md`: 사진 signed URL 캐시와 만료 후 갱신을 다음 작업으로 지정한다.
- `docs/specs/SPEC-PHOTO-004`: 원격 사진 조회와 signed download URL 발급을 구현했지만 signed URL 캐시와 만료 후 갱신은 제외 범위로 남겼다.
- `docs/architecture/decisions.md`: ADR-012는 모바일 앱이 R2 secret을 갖지 않고 `media-r2-url` Edge Function을 통해 signed URL을 받는다고 정했다.

## 기존 코드

- `src/domain/photos/remote-photo.ts`: 원격 asset과 signed download URL을 `BabyPhoto`로 변환한다.
- `src/features/photos/baby-photo-library-service.ts`: 사진 탭 로드 시 원격 asset마다 `getRemoteBabyPhotoDownloadUrl`을 호출한다.
- `src/features/photos/remote-baby-photo-repository.ts`: `create_download` action으로 signed download URL을 요청한다.
- `app/(tabs)/photos.tsx`: 원격 URL을 `Image` source로 표시하지만 이미지 로딩 실패 후 URL 갱신 경로는 없다.

## 결정

- signed URL 캐시는 영구 저장하지 않고 앱 프로세스 메모리에만 둔다.
- 캐시 freshness는 `expires_at`에서 기본 60초 완충 시간을 뺀 시각까지로 판단한다.
- 목록 조회 시에는 cache-aside 방식으로 유효 캐시를 먼저 확인하고, stale/miss일 때만 Edge Function에 요청한다.
- 이미지 로딩 실패 시에는 해당 원격 사진만 강제 refresh하고 캐시에 새 URL을 저장한다.

## 리스크

- 앱 재시작 후에는 메모리 캐시가 사라져 signed URL을 다시 요청한다. 민감 URL 영구 저장을 피하는 쪽을 MVP 기본 정책으로 둔다.
- 네트워크가 끊긴 상태에서 원격 URL 만료 후 이미지를 새로 불러오면 원격 사진은 갱신되지 않을 수 있다. 로컬 사진 목록 표시는 유지한다.
