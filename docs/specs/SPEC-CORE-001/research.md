# 리서치

## 기존 문서

- `docs/architecture/decisions.md`: ADR-010에서 최종 로컬 저장소를 Expo SQLite로 채택했다.
- `docs/engineering/project-setup.md`: 날짜별 조회, 수정/삭제, sync queue 필요 시 `baby_logs`부터 SQLite로 이전한다고 기록되어 있었다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-16, PR-19에서 각각 기록 백업 queue와 사진 업로드 queue가 추가되어 있었다.

## 기존 코드

- `src/features/logging/local-baby-log-repository.ts`: AsyncStorage 기반 `baby_logs` 저장소.
- `src/features/photos/local-baby-photo-repository.ts`: AsyncStorage 기반 사진 metadata 저장소.
- `src/features/logging/remote-baby-log-backup-queue-repository.ts`: AsyncStorage 기반 기록 백업 queue.
- `src/features/photos/remote-baby-photo-upload-queue-repository.ts`: AsyncStorage 기반 사진 업로드 queue.

## 결정

- Expo SQLite database 이름은 `tinydays.db`로 둔다.
- `baby_logs`와 사진 metadata는 typed column 전체 분해 대신 `id`, 정렬 기준 시간, JSON payload를 저장한다.
- 원격 재시도 queue는 단일 `sync_queue` table에 `queue_type`으로 구분해 저장한다.
- 가족 context와 remote mapping은 이번 범위에서 유지한다.

## 리스크

- JSON payload 방식은 빠르게 이전하기 좋지만, 고급 필터와 대량 분석이 필요해지면 typed column을 추가해야 한다.
- AsyncStorage import 후 기존 key 삭제는 이번 범위에서 하지 않아 중복 원본이 남을 수 있다.
- 실제 기기 SQLite migration은 Expo 런타임에서 수동 확인이 필요하다.
