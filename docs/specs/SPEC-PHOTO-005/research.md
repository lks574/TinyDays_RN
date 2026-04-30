# 리서치

## 기존 문서

- `docs/architecture/decisions.md`: ADR-012는 사진 원격 저장에서 앱이 R2 secret을 갖지 않고 Edge Function signed URL을 사용한다고 정했다. PR-17에서 retry queue와 사진 삭제는 제외 범위였다.
- `docs/engineering/project-setup.md`: PR-17/18은 `media-r2-url` Edge Function과 원격 사진 조회를 문서화했고, 원격 실패가 로컬 사진 목록을 막지 않아야 한다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-16은 `baby_logs` 원격 실패에 최소 queue를 두고, PR-17/18은 사진 원격 저장/조회를 1차로 완료했다.

## 기존 코드

- `src/features/logging/remote-baby-log-backup-queue-repository.ts`: `AsyncStorage` 기반 queue 저장소와 item 검증 패턴이 있다.
- `src/features/logging/baby-log-backup-service.ts`: 새 원격 백업 전 기존 queue item을 재시도한다.
- `src/features/photos/baby-photo-upload-service.ts`: 사진을 로컬에 저장한 뒤 원격 upload plan, R2 PUT, complete 순서로 처리한다.
- `src/features/photos/local-baby-photo-repository.ts`: 로컬 사진 metadata를 `AsyncStorage`에 저장하고 같은 id를 교체한다.

## 결정

- 사진 queue도 MVP 단계에서는 `AsyncStorage`에 저장한다.
- queue item은 원격 UUID가 아니라 로컬 `BabyPhoto` 전체와 `user_id`를 저장한다.
- 재시도는 별도 백그라운드 작업이 아니라 다음 사진 업로드 경로에서 먼저 실행한다.

## 리스크

- upload plan 생성 후 R2 PUT 또는 complete가 실패하면 기존 draft row나 object가 남을 수 있다. 정리는 후속 사진 삭제/R2 정리 작업에서 다룬다.
- 앱을 실행만 하고 새 사진을 추가하지 않으면 queue가 자동 재시도되지 않는다. 백그라운드 또는 앱 시작 재시도는 후속 작업이다.
