# 구현 계획

## 태스크

- [x] T1: 원격 가족 bootstrap에 사용할 Supabase row 타입과 local-to-remote mapping 타입을 정의한다.
- [x] T2: 원격 매핑을 저장/조회하는 `AsyncStorage` repository를 추가한다.
- [x] T3: 첫 `parent` 멤버와 첫 `children` 레코드를 원자적으로 만드는 Supabase bootstrap 경로를 추가한다.
- [x] T4: 가족 탭에서 session 연결 후 원격 가족 생성, 연결 상태, 실패 상태를 표시한다.
- [x] T5: 중복 생성을 막기 위해 로컬 매핑 또는 기존 원격 멤버십 조회를 먼저 수행한다.
- [x] T6: 단위 테스트와 Supabase RLS/bootstrap smoke test를 추가한다.
- [x] T7: PR 로드맵, 세팅 문서, 다음 작업 문서를 업데이트한다.
- [x] T8: `npm run lint`, `npm run typecheck`, `npm test`를 실행한다.

## 구현 순서

1. 현재 로컬 `FamilyContext`를 원격 생성 입력으로 변환하는 순수 helper를 만든다.
2. 매핑 타입은 로컬 ID와 원격 UUID를 모두 보존한다.
3. Supabase에는 `bootstrap_family` RPC 또는 동등한 security definer 함수로 `families`, 본인 `parent` `family_members`, 첫 `children` 생성을 한 transaction 안에서 처리한다.
4. RPC는 `auth.uid()`가 있는 authenticated 사용자만 허용하고, 생성되는 `family_members.user_id`는 반드시 `auth.uid()`로 고정한다.
5. 앱 repository는 service role key 없이 anon client와 session으로 RPC를 호출한다.
6. bootstrap 성공 시 원격 row와 매핑을 로컬 저장소에 저장한다.
7. 가족 탭은 로컬 가족 편집 UI를 유지하고 원격 연결 패널만 확장한다.
8. PR-16에서 사용할 수 있도록 매핑 조회 API를 export한다.

## 테스트 계획

- 로컬 `FamilyContext`가 원격 bootstrap 입력으로 정규화되는지 단위 테스트한다.
- 원격 매핑 repository가 저장, 조회, 잘못된 저장값 복구를 처리하는지 단위 테스트한다.
- Supabase local DB에서 authenticated 사용자가 bootstrap RPC를 호출하면 family, parent member, child가 생성되는지 smoke test한다.
- 같은 사용자가 같은 매핑으로 재시도해도 앱이 중복 생성을 막는지 테스트한다.
- Supabase config 또는 session이 없을 때 기존 로컬 가족 context 저장이 계속 동작하는지 확인한다.
- `npm run lint`
- `npm run typecheck`
- `npm test`

## 검증 결과

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS
- `supabase db reset`: PASS
- `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/tests/rls_smoke.sql`: PASS
