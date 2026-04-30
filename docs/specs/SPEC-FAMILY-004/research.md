# 리서치

## 기존 문서

- `docs/product/mvp-scope.md`: MVP 필수 기능에 가족 구성원 초대가 포함되어 있다.
- `docs/architecture/decisions.md`: ADR-006은 `parent`와 `family` 두 역할만 사용하고, ADR-011은 첫 원격 가족 생성을 authenticated RPC로 처리한다고 정했다.
- `docs/engineering/project-setup.md`: PR-15는 원격 가족 bootstrap과 local-to-remote mapping을 문서화했다.

## 기존 코드

- `supabase/migrations/20260429090000_initial_backend_schema.sql`: `families`, `family_members`, `children`와 `parent`/`family` RLS가 있다.
- `supabase/migrations/20260430100000_bootstrap_family_rpc.sql`: 첫 `parent` 생성을 위한 `bootstrap_family` RPC가 있다.
- `src/domain/family/remote-family.ts`: 원격 가족 bootstrap 결과와 mapping helper가 있다.
- `src/features/family/remote-family-bootstrap-repository.ts`: `bootstrap_family` RPC 호출과 기존 원격 가족 복구 로직이 있다.
- `app/(tabs)/family.tsx`: 로그인, 원격 가족 생성, remote mapping 저장 UI가 있다.

## 결정

- 1차 초대는 공유 가능한 단순 코드로 구현한다.
- 초대 생성과 수락은 RPC로 처리해 모바일 앱에 service role key를 넣지 않는다.
- 초대 수락 사용자는 `family` 역할로만 추가한다.
- 초대 코드는 기본 7일 뒤 만료한다.

## 리스크

- 초대 코드를 복사/공유하는 UI는 최소 텍스트 표시 수준이다.
- 여러 가족 가입과 가족 전환은 아직 다루지 않는다.
- 초대 취소/재발급 관리 화면이 없으므로 운영 정책 고도화는 후속 작업이 필요하다.
