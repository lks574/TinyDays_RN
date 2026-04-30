# 가족 구성원 목록 실환경 수동 검증

이 문서는 `SPEC-FAMILY-005`의 실환경 검증을 사람이 직접 수행하기 위한 체크리스트다.

## 준비물

- Supabase 프로젝트 URL.
- Supabase anon key.
- 테스트 계정:
  - 원격 가족을 만든 `parent` 계정.
  - 초대 코드로 같은 가족에 합류한 `family` 계정.
  - 가족 구성원이 아닌 `outsider` 계정.
- `parent` 계정에 연결된 원격 family/child/member mapping.
- `SPEC-FAMILY-004` 초대 코드 생성과 수락 흐름이 동작하는 앱 상태.

## 앱 환경 변수

앱에는 Supabase public env만 설정한다.

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

앱에 service role key를 넣지 않는다.

## 1. Parent 원격 가족 연결 확인

1. 앱을 실행한다.

   ```sh
   npm start
   ```

2. 가족 탭에서 `parent` 계정으로 로그인한다.
3. 원격 가족이 연결되어 있지 않다면 `원격 가족 만들기`를 실행한다.
4. 구성원 영역을 확인한다.

PASS:

- 원격 가족 연결 상태가 표시된다.
- 구성원 영역에 `원격 가족 구성원 기준` 상태가 표시된다.
- `parent` 계정 구성원이 `나`와 `parent` 역할로 표시된다.

확인 SQL:

```sql
select id, family_id, user_id, name, role, created_at
from family_members
where family_id = '<remote_family_id>'
order by created_at asc;
```

## 2. 초대 수락 후 구성원 목록 갱신

1. `parent` 계정에서 가족 초대 코드를 만든다.
2. 앱에서 로그아웃한다.
3. 다른 테스트 사용자로 로그인한다.
4. 초대 코드를 입력해 원격 가족에 연결한다.
5. 구성원 영역을 확인한다.

PASS:

- 구성원 수가 2명 이상으로 표시된다.
- 기존 보호자는 `parent` 역할로 표시된다.
- 초대 수락 사용자는 `family` 역할로 표시된다.
- 현재 로그인한 초대 수락 사용자가 `나`로 표시된다.

## 3. Parent 재로그인 후 전체 구성원 확인

1. 앱에서 로그아웃한다.
2. 다시 `parent` 계정으로 로그인한다.
3. 가족 탭을 연다.

PASS:

- 같은 원격 가족의 구성원 목록이 다시 조회된다.
- `parent` 계정이 `나`와 `parent` 역할로 표시된다.
- 초대 수락 사용자는 `family` 역할로 표시된다.

## 4. 비가족 접근 차단

1. 앱에서 로그아웃한다.
2. `outsider` 계정으로 로그인한다.
3. 가능하면 같은 `remote_family_id`로 `family_members` 조회를 직접 시도한다.

PASS:

- `outsider`는 해당 가족의 `family_members` row를 조회할 수 없다.
- 앱 가족 탭에는 해당 원격 가족 구성원 목록이 표시되지 않는다.

확인 SQL:

```sql
select id, family_id, user_id, name, role
from family_members
where family_id = '<remote_family_id>';
```

`outsider` session으로 실행했을 때 결과가 비어 있어야 한다.

## 5. 원격 조회 실패 fallback

테스트 환경에서만 수행한다.

1. 앱의 Supabase URL 또는 anon key를 임시로 잘못 설정한다.
2. 앱을 다시 실행한다.
3. 가족 탭을 연다.

PASS:

- 기존 로컬 가족 정보와 아기 정보가 계속 표시된다.
- 구성원 영역은 로컬 현재 사용자 1명을 표시한다.
- 앱이 가족 탭 전체를 막지 않는다.

## 최종 PASS 기준

아래 항목이 모두 만족되면 가족 구성원 목록 실환경 검증을 PASS로 본다.

- 원격 family mapping이 있는 사용자는 `family_members` 목록을 볼 수 있다.
- `parent`와 `family` 역할이 그대로 표시된다.
- 현재 로그인 사용자가 `나`로 구분된다.
- 가족 구성원이 아닌 사용자는 같은 가족의 구성원 목록을 볼 수 없다.
- 원격 조회 실패가 로컬 가족 정보와 local-first 기록/사진 흐름을 막지 않는다.
