# 리서치

## 기존 문서

- `docs/product/next-task.md`: 다음 작업으로 원격 `family_members` 기준 구성원 목록과 역할 표시를 지정한다.
- `docs/product/mvp-scope.md`: 가족 탭은 구성원 목록, 초대 코드, 권한 표시를 포함한다.
- `docs/architecture/decisions.md`: ADR-006은 `parent`와 `family` 두 역할만 사용한다고 정했다.
- `docs/architecture/decisions.md`: ADR-013은 초대 수락 사용자를 `family` 역할 구성원으로 추가한다고 정했다.

## 기존 코드

- `app/(tabs)/family.tsx`: 가족 탭은 원격 가족 생성/초대 UI와 로컬 현재 사용자 1명 구성원 카드를 표시한다.
- `src/domain/family/remote-family.ts`: 원격 family mapping과 invite normalization helper가 있다.
- `src/features/family/remote-family-bootstrap-repository.ts`: 기존 원격 가족 복구를 위해 `family_members` 1건을 조회한다.
- `supabase/migrations/20260429090000_initial_backend_schema.sql`: `family_members` select RLS는 같은 가족 구성원만 읽을 수 있게 제한한다.

## 결정

- 구성원 목록 조회는 새 RPC 없이 기존 `family_members` RLS에 의존한 select로 처리한다.
- 앱 표시용 도메인 타입은 `RemoteFamilyMember`로 분리하고 로컬 `FamilyMember`를 대체하지 않는다.
- 원격 조회 실패는 가족 탭 전체 실패로 만들지 않고 로컬 현재 사용자 fallback으로 처리한다.

## 리스크

- 원격 구성원 목록은 Supabase 설정과 로그인 session이 있어야만 실제 조회된다.
- 구성원 제거와 역할 변경은 후속 작업이므로 목록은 읽기 전용이다.
- 실제 Supabase session/RLS 기반 조회와 비가족 차단은 실환경 계정이 필요하므로 `docs/qa/manual-tests/SPEC-FAMILY-005.md`에 수동 검증으로 남긴다.
