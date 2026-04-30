# 사진 삭제와 R2 정리 실환경 수동 검증

이 문서는 `SPEC-PHOTO-006`의 실환경 검증을 사람이 직접 수행하기 위한 체크리스트다.

## 준비물

- Supabase 프로젝트 URL.
- Supabase anon key.
- 배포된 Supabase Edge Function `media-r2-url`.
- Cloudflare R2 private bucket.
- Supabase Function secret:
  - `R2_BUCKET`
  - `R2_S3_ENDPOINT`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_SIGNED_URL_EXPIRES_SECONDS`
- 테스트 계정:
  - 같은 가족의 `parent` 계정.
  - 같은 가족의 `family` 계정.
  - 가족 구성원이 아닌 `outsider` 계정.
- `parent` 계정에 연결된 원격 family/child mapping.
- 삭제 검증용으로 업로드된 원격 사진 1장 이상.

## 앱 환경 변수

앱에는 Supabase public env만 설정한다.

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

R2 secret은 앱 `.env`나 Expo public env에 넣지 않는다. R2 secret은 Supabase Function secret으로만 둔다.

## 1. Edge Function 준비 확인

```sh
supabase functions deploy media-r2-url
```

Supabase Dashboard에서 `media-r2-url` Function log를 열어 둔다.

PASS:

- `media-r2-url`이 배포되어 있다.
- Function secret이 모두 설정되어 있다.
- `delete_photo` action 호출이 Function log에 표시될 수 있다.
- 앱 `.env`에 R2 secret이 없다.

## 2. 삭제 대상 사진 준비

1. 앱을 실행한다.

   ```sh
   npm start
   ```

2. 가족 탭에서 `parent` 계정으로 로그인한다.
3. 원격 family/child mapping이 있는 상태인지 확인한다.
4. 사진 탭에서 사진을 1장 추가한다.
5. 원격 저장 완료 메시지를 확인한다.

PASS:

- 사진이 앱 사진 목록에 표시된다.
- Supabase `media_assets`에 `status = uploaded` row가 있다.
- R2 bucket에 같은 `object_key`의 원본 파일이 있다.

확인 SQL:

```sql
select id, family_id, child_id, bucket, object_key, status, asset_type, created_at
from media_assets
where asset_type = 'photo'
order by created_at desc
limit 5;
```

## 3. Parent 사진 삭제 성공

1. 사진 탭에서 삭제 대상 사진의 `삭제` 버튼을 누른다.
2. 확인 Alert에서 `삭제`를 선택한다.
3. 앱 상태 메시지와 Function log를 확인한다.
4. Supabase와 R2 상태를 확인한다.

PASS:

- 사진이 앱 목록에서 제거된다.
- 앱에 원격 저장소 정리 진행 또는 완료 메시지가 표시된다.
- Function log에 `delete_photo` 요청이 남는다.
- Supabase `media_assets.status`가 `deleted`로 갱신된다.
- R2 bucket에서 해당 `object_key` 원본 파일이 삭제되어 있다.

확인 SQL:

```sql
select id, bucket, object_key, status, updated_at
from media_assets
where id = '삭제한-media-asset-id';
```

## 4. 삭제된 사진 재조회 방지

1. 앱을 종료했다가 다시 실행한다.
2. 같은 `parent` 계정으로 로그인한다.
3. 사진 탭을 다시 연다.

PASS:

- 삭제한 사진이 로컬 목록에 다시 나타나지 않는다.
- 삭제한 사진이 원격 조회 결과로 다시 합쳐지지 않는다.
- `media_assets.status = deleted` row는 사진 탭에 표시되지 않는다.

## 5. Family 계정 삭제 차단

1. 삭제 검증용 원격 사진을 새로 1장 준비한다.
2. 앱에서 로그아웃한다.
3. 같은 가족의 `family` 계정으로 로그인한다.
4. 사진 탭에서 원격 사진을 확인한다.
5. 가능하면 해당 `media_asset_id`로 `delete_photo` 요청을 직접 시도한다.

PASS:

- `family` 계정의 `delete_photo` 요청은 실패한다.
- R2 object는 삭제되지 않는다.
- Supabase `media_assets.status`는 `uploaded`로 유지된다.

## 6. 비가족 접근 차단

1. 앱에서 로그아웃한다.
2. `outsider` 계정으로 로그인한다.
3. 가능하면 다른 가족의 `media_asset_id`로 `delete_photo` 요청을 직접 시도한다.

PASS:

- `outsider`는 해당 `media_assets` row를 조회하거나 삭제할 수 없다.
- `delete_photo` 요청은 실패한다.
- R2 object는 삭제되지 않는다.
- Supabase `media_assets.status`는 바뀌지 않는다.

## 7. 원격 삭제 실패 격리

테스트 환경에서만 수행한다.

1. 삭제 검증용 원격 사진을 새로 1장 준비한다.
2. Supabase Function secret 중 R2 관련 값을 임시로 잘못 설정하거나 R2 권한을 제거한다.
3. 앱 사진 탭에서 해당 사진을 삭제한다.

PASS:

- 사진은 앱 로컬 목록에서 제거된다.
- 앱에는 원격 원본 정리 실패 메시지가 표시된다.
- 사진 탭 전체가 깨지지 않는다.
- Supabase/R2 정리는 실패 상태로 남을 수 있으며, 이 경우 secret을 복구한 뒤 별도 정리가 필요하다.

## 8. 업로드 queue 재시도 방지

개발 빌드 또는 디버그 저장소 확인이 가능한 환경에서 수행한다.

1. 원격 업로드 실패 상태의 사진을 만들어 `remote_baby_photo_upload_queue`에 남긴다.
2. 앱 사진 탭에서 해당 사진을 삭제한다.
3. 이후 사진을 새로 추가해 업로드 queue 재시도 경로를 실행한다.

PASS:

- 삭제한 사진의 queue item이 제거된다.
- 이후 업로드 재시도에서 삭제한 사진이 다시 업로드되지 않는다.
- 새로 추가한 사진의 업로드 흐름은 정상 동작한다.

## 최종 PASS 기준

아래 항목이 모두 만족되면 사진 삭제와 R2 정리 실환경 검증을 PASS로 본다.

- `parent`가 사진을 삭제하면 로컬 목록에서 제거되고 `media_assets.status = deleted`로 갱신된다.
- 같은 `object_key`의 R2 원본 파일이 삭제된다.
- 삭제된 원격 사진은 앱 재조회 시 다시 표시되지 않는다.
- `family` 계정과 `outsider` 계정은 R2 object 삭제와 `media_assets.status` 갱신을 수행할 수 없다.
- 원격 삭제 실패가 로컬 사진 목록 동작을 막지 않는다.
- 삭제한 사진의 원격 업로드 queue item이 이후 재시도되지 않는다.
