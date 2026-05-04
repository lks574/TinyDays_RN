# 리서치

## 기존 문서

- `docs/product/next-task.md`: 다음 작업을 `baby_logs` 원격 pull/downsync와 다중 기기 조회로 지정했다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-16은 원격 백업 1차만 포함하고 다중 기기 완전 동기화는 제외했다.
- `docs/architecture/decisions.md`: ADR-010은 최종 구조를 local-first SQLite, Supabase, R2로 둔다.
- `docs/engineering/project-setup.md`: 원격 사진 조회는 로컬 metadata를 먼저 표시하고 원격 조회 실패를 격리하는 패턴을 사용한다.

## 기존 코드

- `src/features/logging/baby-log-backup-service.ts`: 새 기록 저장 시 로컬 저장을 먼저 완료하고 원격 백업을 비동기로 시도한다.
- `src/features/logging/remote-baby-log-repository.ts`: 원격 `baby_logs` insert만 있었다.
- `src/features/photos/baby-photo-library-service.ts`: 로컬 사진과 원격 사진 metadata를 병합하는 참고 패턴이 있다.
- `supabase/migrations/20260429090000_initial_backend_schema.sql`: 같은 가족 구성원은 `baby_logs`를 select할 수 있고, `parent`만 write할 수 있다.

## 결정

- 1차 downsync는 선택 날짜의 원격 기록을 읽어 화면에 병합하는 read-through 방식으로 구현한다.
- 원격 기록은 로컬 저장소에 영구 저장하지 않는다.
- 중복 제거는 로컬/원격의 가족, 아기, 기록 타입, 기록 시각, 값, 메모, source, 원문, confidence, 생성 시각 fingerprint로 판단한다.
- 원격 기록의 작성자는 1차 UI에서 표시하지 않으므로 로컬 `BabyLog.created_by`에는 `remote-user-{uuid}` 문자열을 둔다.

## 리스크

- PR-16 백업은 로컬 ID와 원격 ID를 영구 매핑하지 않으므로 네트워크 응답 손실 뒤 중복 원격 row가 생길 수 있다.
- 선택 날짜 조회만 구현했기 때문에 원격-only 과거 날짜를 날짜 chip으로 발견하는 UX는 후속 보강이 필요하다.
- 수정/삭제 downsync와 충돌 해결은 Expo SQLite 이전 및 sync queue 통합 시 함께 설계해야 한다.
