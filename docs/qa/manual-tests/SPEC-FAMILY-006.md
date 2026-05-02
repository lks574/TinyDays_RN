# 초대 취소와 구성원 제거 실환경 수동 검증

이 문서는 `SPEC-FAMILY-006`의 실환경 검증을 사람이 직접 수행하기 위한 체크리스트다.

## 준비물

- Supabase 프로젝트 URL.
- Supabase anon key.
- 테스트 계정:
  - 원격 가족을 만든 `parent` 계정.
  - 초대 코드로 같은 가족에 합류한 `family` 계정.
  - 가족 구성원이 아닌 `outsider` 계정.
- `parent` 계정에 연결된 원격 family/child/member mapping.
- `SPEC-FAMILY-004`, `SPEC-FAMILY-005` 흐름이 동작하는 앱 상태.

## 앱 환경 변수

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

앱에 service role key를 넣지 않는다.

## 1. Parent 초대 취소

1. 앱을 실행한다.

   ```sh
   npm start
   ```

2. 가족 탭에서 `parent` 계정으로 로그인한다.
3. 원격 가족이 연결되어 있지 않다면 `원격 가족 만들기`를 실행한다.
4. 가족 초대 코드를 만든다.
5. 대기 초대 목록에서 해당 초대를 취소한다.

PASS:

- 앱에 초대 취소 성공 메시지가 표시된다.
- 취소한 초대가 대기 초대 목록에서 사라진다.
- Supabase `family_invites.revoked_at`이 채워진다.

확인 SQL:

```sql
select id, code, accepted_at, revoked_at, expires_at
from family_invites
where family_id = '<remote_family_id>'
order by created_at desc;
```

## 2. 취소된 초대 수락 거부

1. 앱에서 로그아웃한다.
2. 다른 테스트 사용자로 로그인한다.
3. 취소된 초대 코드를 입력해 연결을 시도한다.

PASS:

- 앱은 초대 수락 실패 메시지를 표시한다.
- `family_members`에 새 구성원이 추가되지 않는다.

## 3. Family 역할 관리 액션 제한

1. 유효한 초대 코드로 `family` 계정을 가족에 합류시킨다.
2. `family` 계정으로 가족 탭을 연다.

PASS:

- `family` 계정에는 초대 취소 버튼이 표시되지 않는다.
- `family` 계정에는 구성원 제거 버튼이 표시되지 않는다.

## 4. Family 구성원 제거

1. `parent` 계정으로 다시 로그인한다.
2. 구성원 목록에서 `family` 역할 구성원을 제거한다.

PASS:

- 앱에 구성원 제거 성공 메시지가 표시된다.
- 제거된 구성원이 구성원 목록에서 사라진다.
- 제거된 계정으로 로그인했을 때 원격 가족 데이터 조회가 실패하거나 빈 결과가 표시된다.

확인 SQL:

```sql
select id, family_id, user_id, name, role
from family_members
where family_id = '<remote_family_id>';
```

## 5. 자기 자신 제거 금지

1. `parent` 계정으로 가족 탭을 연다.
2. 현재 사용자 row를 확인한다.

PASS:

- 현재 사용자 row에는 제거 버튼이 표시되지 않는다.

## 6. 기존 데이터 보존

제거 대상 구성원이 만든 원격 기록 또는 사진 metadata가 있는 환경에서 확인한다.

PASS:

- 구성원 제거 후에도 남아 있는 가족 구성원은 기존 기록과 사진 metadata를 조회할 수 있다.
- R2 object가 구성원 제거만으로 삭제되지 않는다.

## 최종 PASS 기준

- `parent`는 대기 초대를 취소할 수 있다.
- 취소된 초대는 수락할 수 없다.
- `family` 역할과 비구성원은 초대 취소와 구성원 제거를 할 수 없다.
- 구성원 제거 후 대상 사용자는 원격 가족 데이터 접근권을 잃는다.
- 자기 자신 제거는 앱과 서버 정책에서 막힌다.
- 구성원 제거가 기존 기록, 사진 metadata, R2 object를 삭제하지 않는다.
