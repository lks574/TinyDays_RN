# 구현 계획

## 태스크

- [x] T1: Supabase local project 구조와 migration 위치를 정한다.
- [x] T2: `families`, `family_members`, `children`, `baby_logs`, `media_assets` 테이블 migration을 작성한다.
- [x] T3: 역할, 기록 타입, source, media status에 필요한 check constraint를 추가한다.
- [x] T4: `family_id` 기준 membership helper SQL function을 작성한다.
- [x] T5: `parent` 권한 확인 helper SQL function을 작성한다.
- [x] T6: 각 테이블의 RLS를 활성화하고 select/insert/update/delete 정책을 작성한다.
- [x] T7: local 검증용 seed 또는 policy test SQL을 추가한다.
- [x] T8: 백엔드 세팅 명령과 환경 전제를 `docs/engineering/project-setup.md`에 반영한다.
- [x] T9: PR 로드맵에 PR-13 이후 백엔드 진행 항목을 추가하거나 다음 작업 문서에 고정한다.

## 구현 순서

1. Supabase CLI와 local project 사용 여부를 확인하고 `supabase/` 디렉터리 구조를 만든다.
2. enum 대신 text + check constraint를 우선 사용해 앱 도메인 타입 변경에 따른 migration 비용을 낮춘다.
3. family membership 확인 함수를 먼저 만든 뒤 RLS policy에서 재사용한다.
4. `families`와 `family_members` 정책을 먼저 검증한다.
5. `children`, `baby_logs`, `media_assets` 정책을 같은 패턴으로 확장한다.
6. seed 또는 SQL test로 비구성원 차단, 구성원 조회, `parent` write 허용, `family` write 차단을 검증한다.
7. 앱 코드는 연결하지 않고 문서와 migration만 검증한다.

## 테스트 계획

- Supabase local migration 적용 확인.
- RLS policy SQL 검증.
- `parent` 사용자는 같은 가족의 `children`, `baby_logs`, `media_assets`를 생성할 수 있는지 확인.
- `family` 사용자는 같은 가족 데이터를 조회할 수 있지만 write가 차단되는지 확인.
- 가족 구성원이 아닌 사용자는 해당 가족 데이터가 조회되지 않는지 확인.
- 기존 앱 검증 명령은 앱 코드 변경이 있을 때만 실행한다.
