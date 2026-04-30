# 원격 사진 실환경 수동 검증

이 문서는 `SPEC-PHOTO-004`의 실환경 검증을 사람이 직접 수행하기 위한 체크리스트다.

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
- 앱 `.env`에 R2 secret이 없다.

## 2. Parent 사진 업로드

1. 앱을 실행한다.

   ```sh
   npm start
   ```

2. 가족 탭에서 `parent` 계정으로 로그인한다.
3. 원격 family/child mapping이 있는 상태인지 확인한다.
4. 사진 탭에서 사진을 1장 추가한다.

PASS:

- 사진이 먼저 로컬 목록에 표시된다.
- 이후 앱에 원격 저장 완료 메시지가 표시된다.
- Supabase `media_assets`에 새 row가 생성된다.
- 새 row의 `status`가 `uploaded`다.
- 새 row의 `bucket`, `object_key`, `mime_type`이 채워져 있다.
- R2 bucket에 같은 `object_key`의 원본 파일이 있다.

확인 SQL:

```sql
select id, family_id, child_id, bucket, object_key, status, mime_type, created_at
from media_assets
order by created_at desc
limit 5;
```

## 3. 같은 가족 사진 조회

1. 앱에서 로그아웃한다.
2. 같은 가족의 `family` 계정으로 로그인한다.
3. 사진 탭을 연다.

PASS:

- `parent`가 업로드한 원격 사진이 표시된다.
- Function log에 `create_download` 요청이 남는다.
- 앱은 R2 secret 없이 signed download URL로 이미지를 표시한다.

## 4. 비가족 접근 차단

1. 앱에서 로그아웃한다.
2. `outsider` 계정으로 로그인한다.
3. 사진 탭을 연다.
4. 가능하면 같은 `media_asset_id`로 `create_download` 요청을 직접 시도한다.

PASS:

- `outsider`는 해당 가족의 `media_assets` metadata를 조회할 수 없다.
- `create_download` 요청은 실패한다.
- 앱에는 signed download URL이 노출되지 않는다.

## 5. 원격 실패 격리

테스트 환경에서만 수행한다.

1. Supabase URL을 잘못 설정하거나 `media-r2-url` Function secret 중 하나를 임시로 제거한다.
2. 앱을 다시 실행한다.
3. 사진 탭을 연다.

PASS:

- 기존 로컬 사진 목록은 계속 표시된다.
- 원격 사진만 건너뛴다.
- 앱에 로컬 사진만 표시 중이라는 상태가 표시된다.
- 사진 탭 전체가 깨지지 않는다.

## 최종 PASS 기준

아래 항목이 모두 만족되면 원격 사진 실환경 검증을 PASS로 본다.

- `parent` 업로드 시 R2 파일 생성과 `media_assets.status = uploaded` 갱신이 완료된다.
- 같은 가족 구성원이 signed download URL로 원격 사진을 볼 수 있다.
- 가족 구성원이 아닌 사용자는 metadata 조회와 download URL 발급이 차단된다.
- 원격 조회 또는 signed URL 요청 실패가 로컬 사진 목록 표시를 막지 않는다.
