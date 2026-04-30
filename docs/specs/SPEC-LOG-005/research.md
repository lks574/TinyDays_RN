# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-16은 로컬 저장을 먼저 수행하고 원격 실패를 재시도 가능한 최소 queue로 남기는 것을 요구한다.
- `docs/product/next-task.md`: PR-15 완료 후 다음 작업은 `baby_logs` 클라우드 백업 1차다.
- `docs/architecture/decisions.md`: MVP는 통합 `baby_logs` 모델을 사용하고, 최종 구조는 local-first 앱과 Supabase 백업으로 둔다.
- `docs/specs/SPEC-FAMILY-003/spec.md`: 로컬 family/child/member ID와 원격 UUID mapping은 PR-16 백업의 변환 기준이다.

## 기존 코드

- `src/features/logging/local-baby-log-repository.ts`: 기존 로컬 `BabyLogRepository` 구현이다.
- `app/(tabs)/index.tsx`: 빠른 기록과 텍스트 기록 저장 시 `localBabyLogRepository.saveLog`를 직접 호출한다.
- `src/features/auth/supabase-client.ts`: Supabase client singleton을 제공하며 설정이 없으면 `null`을 반환한다.
- `src/features/family/remote-family-mapping-repository.ts`: Auth user ID 기준 원격 family mapping을 저장하고 조회한다.
- `supabase/migrations/20260429090000_initial_backend_schema.sql`: `baby_logs` insert는 `created_by = auth.uid()`이고 `parent` 멤버만 허용된다.

## 결정

- PR-16은 기존 local-first 저장소를 교체하지 않는다.
- 원격 백업은 session과 mapping이 모두 있을 때만 시도한다.
- queue는 `AsyncStorage`에 저장하고, 새 저장 시 이전 queue를 먼저 재시도한다.
- 원격 `baby_logs.id`는 Supabase에서 생성한다. 로컬 ID와 원격 ID의 영구 매핑 및 중복 방지는 후속 동기화 PR에서 다룬다.

## 리스크

- 네트워크 응답이 손실된 뒤 재시도하면 중복 원격 row가 생길 수 있다. PR-16은 최소 백업 경로이며 완전한 idempotency는 후속 sync 설계에서 다룬다.
- 원격 family mapping이 현재 로컬 family context와 어긋나면 잘못된 원격 아기 기준으로 저장될 수 있다. 변환 함수는 local ID 일치를 확인하고 불일치 시 백업을 건너뛴다.
