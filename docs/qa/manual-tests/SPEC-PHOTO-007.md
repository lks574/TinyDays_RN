# 사진 signed URL 캐시와 만료 갱신 실환경 수동 검증

이 문서는 `SPEC-PHOTO-007`의 실환경 검증을 사람이 직접 수행하기 위한 체크리스트다.

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
- 원격 family/child mapping.
- 업로드 완료된 원격 사진 1장 이상.

## 앱 환경 변수

앱에는 Supabase public env만 설정한다.

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

R2 secret은 앱 `.env`나 Expo public env에 넣지 않는다. R2 secret은 Supabase Function secret으로만 둔다.

## 1. Edge Function 만료 시간 설정

테스트 환경에서 signed URL 만료를 빠르게 확인하려면 `R2_SIGNED_URL_EXPIRES_SECONDS`를 짧게 설정한다.

권장값:

```txt
R2_SIGNED_URL_EXPIRES_SECONDS=120
```

PASS:

- `media-r2-url`이 배포되어 있다.
- Function secret이 모두 설정되어 있다.
- 앱 `.env`에 R2 secret이 없다.
- Function log에서 `create_download` 호출 횟수를 확인할 수 있다.

## 2. 유효 캐시 재사용 확인

1. 앱을 실행한다.

   ```sh
   npm start
   ```

2. 가족 탭에서 `parent` 또는 같은 가족의 `family` 계정으로 로그인한다.
3. 사진 탭을 열어 원격 사진을 표시한다.
4. Function log의 `create_download` 호출 횟수를 기록한다.
5. signed URL 만료 완충 시간 밖에서 사진 탭을 벗어났다가 다시 연다.

PASS:

- 원격 사진이 계속 표시된다.
- 같은 `media_asset_id`에 대한 `create_download` 호출이 불필요하게 반복되지 않는다.
- 앱 재시작 전까지 유효한 signed URL은 메모리 캐시로 재사용된다.

## 3. 만료 후 목록 재조회 갱신 확인

1. 사진 탭에서 원격 사진이 표시된 상태를 만든다.
2. `R2_SIGNED_URL_EXPIRES_SECONDS`보다 긴 시간 동안 기다린다.
3. 사진 탭을 벗어났다가 다시 연다.
4. Function log를 확인한다.

PASS:

- 만료됐거나 곧 만료될 URL은 새 `create_download` 요청으로 갱신된다.
- 갱신 후 원격 사진이 다시 표시된다.
- 로컬 사진 목록은 갱신 중에도 유지된다.

## 4. 이미지 로딩 실패 후 단건 갱신 확인

1. 원격 사진을 표시한 상태에서 signed URL이 만료될 때까지 기다린다.
2. 앱이 기존 이미지 캐시를 비우도록 화면을 새로 렌더링하거나 앱을 foreground/background 전환한다.
3. 이미지 로딩 실패가 발생하면 사진 탭 상태 메시지와 Function log를 확인한다.

PASS:

- 앱은 실패한 원격 사진 1장에 대해서만 새 signed URL을 요청한다.
- 새 URL을 받은 뒤 해당 사진 URI가 갱신되고 이미지가 다시 표시된다.
- 다른 로컬/원격 사진 목록은 유지된다.

## 5. 원격 실패 격리

테스트 환경에서만 수행한다.

1. Supabase URL을 잘못 설정하거나 `media-r2-url` Function secret 중 하나를 임시로 제거한다.
2. 앱을 다시 실행한다.
3. 사진 탭을 연다.
4. 원격 사진 단건 갱신이 필요한 상태를 만든다.

PASS:

- 기존 로컬 사진 목록은 계속 표시된다.
- 원격 목록 조회 또는 단건 URL 갱신 실패가 사진 탭 전체를 깨뜨리지 않는다.
- 앱에 원격 사진 URL을 새로 받지 못했다는 메시지가 표시될 수 있다.

## 6. SQLite legacy import 확인

이 항목은 `SPEC-CORE-001` 이후 남은 저장소 이전 체크사항이다.

1. 기존 AsyncStorage에 `BabyLog`, `BabyPhoto`, 사진 업로드 queue가 있는 개발 기기 또는 시뮬레이터를 준비한다.
2. SQLite 저장소가 적용된 앱 빌드를 설치한다.
3. 앱을 실행하고 기록 탭과 사진 탭을 연다.
4. 사진 추가 또는 기록 추가를 1회 수행한다.

PASS:

- 기존 AsyncStorage 기록이 SQLite table이 비어 있을 때 한 번 import된다.
- 기존 사진 metadata가 사진 탭에 표시된다.
- 기존 사진 업로드 queue가 이후 업로드 경로에서 재시도된다.
- 새 기록과 새 사진도 SQLite 기반 repository에서 정상 저장된다.

## 최종 PASS 기준

아래 항목이 모두 만족되면 signed URL 캐시와 만료 갱신 실환경 검증을 PASS로 본다.

- 유효한 signed download URL은 앱 재시작 전까지 메모리 캐시로 재사용된다.
- 만료됐거나 곧 만료될 signed URL은 새 URL로 교체된다.
- 원격 이미지 로딩 실패 시 해당 사진만 단건 갱신된다.
- signed URL은 SQLite 또는 AsyncStorage에 저장되지 않는다.
- Supabase/R2 실패가 로컬 사진 목록 표시를 막지 않는다.
- 기존 AsyncStorage records import가 iOS/Android 실기기 또는 시뮬레이터에서 확인된다.
