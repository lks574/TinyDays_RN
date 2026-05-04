# 프로젝트 세팅

## 현재 저장소 상태

Expo + React Native + TypeScript 앱이 저장소 루트에 스캐폴딩되었습니다. PR-02 기준으로 Expo Router 기반 탭 구조를 제공합니다. 실제 기록 기능은 이후 PR에서 추가합니다.

## 권장 기준

- Expo 기반 React Native.
- TypeScript.
- 탭/내비게이션 구조는 Expo Router를 사용한다.
- PR-07 기록 저장소는 `AsyncStorage`로 시작하고, Supabase는 인증/가족/동기화 범위에서 재검토한다.
- PR-11 가족과 아기 최소 모델은 `AsyncStorage` 로컬 family context로 시작한다.
- PR-12 사진 업로드 진입은 `expo-image-picker`와 `AsyncStorage` 로컬 사진 메타데이터로 시작한다.
- 최종 백엔드 지향점은 Expo SQLite, Supabase, Cloudflare R2 조합으로 둔다.
- PR-13 Supabase 백엔드 초안은 앱 동작을 바꾸지 않고 `supabase/` migration과 RLS 정책만 추가한다.
- PR-14 Supabase Auth 연결은 앱에 Supabase client와 session 계층을 추가하되 기존 로컬 저장 흐름을 유지한다.
- 자연어 파서 같은 도메인 로직은 단위 테스트 작성.

## 확정 기술 스택

PR-01 기준으로 아래 기술과 버전을 사용합니다.

| 구분 | 기술 | 기준 버전 |
|------|------|-----------|
| 런타임 | Node.js | 22 LTS |
| 패키지 매니저 | npm | `package-lock.json` 기준 |
| 앱 프레임워크 | Expo | `~54.0.33` |
| Expo asset | `expo-asset` | `~12.0.13` |
| 이미지 선택 | `expo-image-picker` | `~17.0.11` |
| 앱 라우팅 | Expo Router | `~6.0.23` |
| UI 런타임 | React Native | `0.81.5` |
| UI 라이브러리 | React | `19.1.0` |
| 로컬 저장소 | `@react-native-async-storage/async-storage` | `2.2.0` |
| 로컬 DB | `expo-sqlite` | `~16.0.10` |
| Supabase client | `@supabase/supabase-js` | `^2.105.1` |
| React Native URL polyfill | `react-native-url-polyfill` | `^3.0.0` |
| 최종 로컬 DB 후보 | Expo SQLite | 도입 시점에 확정 |
| 최종 서버 후보 | Supabase | 인증/동기화 PR에서 확정 |
| 최종 미디어 저장소 후보 | Cloudflare R2 | 미디어 원격 저장 PR에서 확정 |
| 언어 | TypeScript | `~5.9.2` |
| 린트 | ESLint | `^9.39.4` |
| Expo 린트 설정 | `eslint-config-expo` | `~10.0.0` |
| 테스트 러너 | Jest | `^29.7.0` |
| Expo 테스트 프리셋 | `jest-expo` | `~54.0.17` |

Expo 관련 의존성은 임의로 올리지 않고 `npx expo install --check`가 통과하는 조합을 유지합니다.

## Node 버전

프로젝트 기준 Node 버전은 `.nvmrc`에 정의합니다.

```txt
22
```

현재 로컬 환경에서 확인된 Node 버전은 `v25.8.0`이지만, Expo와 React Native 호환성을 위해 개발 시 Node 22 LTS 사용을 권장합니다.

## 설치와 실행

의존성 설치:

```sh
npm install
```

Expo 개발 서버 실행:

```sh
npm start
```

플랫폼별 실행:

```sh
npm run ios
npm run android
npm run web
```

## 현재 검증 명령

```sh
npm run lint
npm run typecheck
npm test
```

## Supabase 로컬 백엔드

PR-13 기준으로 Supabase local project 구조를 `supabase/` 아래에 둔다.

```txt
supabase/config.toml
supabase/migrations/
supabase/seed.sql
supabase/tests/
```

Supabase CLI는 아직 앱 의존성으로 설치하지 않는다. 로컬 검증이 필요하면 개발 머신에 Supabase CLI와 Docker를 준비한 뒤 아래 흐름을 사용한다.

```sh
supabase start
supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/tests/rls_smoke.sql
```

PR-13의 migration은 다음 범위만 다룬다.

- `families`, `family_members`, `children`, `baby_logs`, `media_assets` schema.
- `family_id` 기준 RLS.
- `parent`, `family` 역할 제한.
- R2 object key와 media metadata 저장 구조.

PR-13에서는 앱 로그인 UI, `@supabase/supabase-js`, Expo SQLite 이전, R2 signed URL 발급을 구현하지 않는다.

## Supabase Auth 앱 설정

PR-14 기준으로 앱은 Expo public env를 사용해 Supabase Auth client를 구성한다.

```sh
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=replace-with-local-or-project-anon-key
```

`.env.example`에 예시 값을 둔다. 실제 프로젝트 anon key는 `.env`에만 둔다. Supabase service role key는 모바일 앱 환경 변수에 넣지 않는다.

환경 변수가 없으면 가족 탭의 원격 계정 패널은 설정 필요 상태를 표시하고, 기존 `AsyncStorage` 기반 로컬 가족/기록/사진 흐름은 계속 동작한다.

## 원격 가족 bootstrap

PR-15 기준으로 로그인한 사용자는 가족 탭에서 현재 로컬 가족/아기 정보를 Supabase `families`, `family_members`, `children` 기준 데이터로 만들 수 있다.

- 첫 `parent` 멤버 생성은 `bootstrap_family` RPC를 사용한다.
- 모바일 앱은 Supabase anon key와 Auth session만 사용하며 service role key를 갖지 않는다.
- 로컬 `family_id`, `child_id`, `created_by`는 원격 UUID로 덮어쓰지 않고 `AsyncStorage` mapping record에 보존한다.
- 원격 bootstrap 성공 후에도 기록과 사진은 기존 로컬 저장소에 먼저 저장된다.
- PR-16 `baby_logs` 클라우드 백업은 이 mapping record를 사용해 원격 UUID로 변환한다.

## 가족 초대와 구성원 연결

SPEC-FAMILY-004 기준으로 가족 초대 1차는 Supabase RPC와 초대 코드로 처리한다.

- `parent` 역할 구성원은 `create_family_invite` RPC로 8자리 초대 코드를 만들 수 있다.
- 초대 코드는 `family_invites`에 저장되고 기본 7일 뒤 만료된다.
- 로그인한 사용자는 `accept_family_invite` RPC에 초대 코드를 입력해 해당 원격 가족의 `family` 역할 구성원이 된다.
- 초대 수락 결과는 기존 `RemoteFamilyMapping`에 저장해 기록 백업과 사진 원격 저장/조회에서 같은 mapping 구조를 사용한다.
- 모바일 앱은 Supabase anon key와 Auth session만 사용하며 service role key를 갖지 않는다.
- SPEC-FAMILY-006 기준으로 `parent`는 대기 중인 초대를 취소할 수 있다.
- SPEC-FAMILY-006 기준으로 `parent`는 다른 구성원을 제거할 수 있지만 자기 자신 제거는 1차에서 금지한다.
- 구성원 제거는 원격 가족 접근권 제거로 처리하고 기존 `baby_logs`, 사진 metadata, R2 object는 삭제하지 않는다.
- 직접 `family_members` delete는 허용하지 않고 `remove_family_member` RPC에서 마지막 `parent` 보호와 자기 자신 제거 금지를 검증한다.
- 여러 가족 전환, 가족 나가기, 구성원 역할 변경은 후속 작업으로 둔다.

## 원격 baby_logs 조회

SPEC-LOG-006 기준으로 기록 탭은 로컬 `AsyncStorage` 기록을 먼저 불러온 뒤, Supabase session과 원격 family mapping이 있으면 선택된 날짜의 원격 `baby_logs`를 조회한다.

- 원격 조회는 Supabase RLS의 `family_members` 기준 select policy를 따른다.
- 로컬 기록과 원격 백업 row가 같은 기록으로 판단되면 로컬 기록을 우선하고 중복 표시하지 않는다.
- 원격 조회 실패는 기록 탭 표시를 막지 않고 이 기기의 로컬 기록만 표시한다.
- 1차 downsync는 read-through 조회이며 원격 row를 `AsyncStorage`에 영구 저장하지 않는다.
- 수정/삭제 downsync, 충돌 해결, 원격-only 과거 날짜 발견, Expo SQLite 이전은 후속 작업으로 둔다.

## Expo SQLite 로컬 저장소

SPEC-CORE-001 기준으로 `baby_logs`, 사진 metadata, 원격 재시도 queue는 Expo SQLite `tinydays.db`를 기본 저장소로 사용한다.

- `baby_logs`: 로컬 기록 저장과 조회.
- `baby_photo_metadata`: 사진 탭 metadata 저장, 조회, 삭제.
- `sync_queue`: `baby_log_backup`, `baby_photo_upload` queue item 통합 저장.

기존 AsyncStorage records는 해당 SQLite table이 비어 있을 때 유효한 record만 가져온다. 가족 context와 remote family mapping은 아직 AsyncStorage 저장소를 유지한다.

## R2 사진 원격 저장

PR-17 기준으로 사진 원본 원격 저장은 Supabase Edge Function `media-r2-url`이 담당한다.

- 앱은 사진 metadata를 `AsyncStorage`에 먼저 저장한다.
- Supabase session과 원격 family mapping이 있으면 앱은 Edge Function에 upload plan을 요청한다.
- Edge Function은 사용자 Auth header로 Supabase RLS를 적용해 `media_assets` draft row를 만들고 R2 signed upload URL을 반환한다.
- 앱이 R2 PUT 업로드를 완료하면 Edge Function에 완료를 알리고 `media_assets.status`를 `uploaded`로 갱신한다.
- Supabase에는 `bucket`, `object_key`, 파일 metadata만 저장하고 원본 binary는 저장하지 않는다.

Edge Function 환경 변수:

```sh
R2_BUCKET=tinydays-media-dev
R2_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=replace-with-r2-access-key
R2_SECRET_ACCESS_KEY=replace-with-r2-secret-key
R2_SIGNED_URL_EXPIRES_SECONDS=600
```

로컬 또는 원격 Supabase Function 배포 전에는 위 값과 Supabase 기본 환경 변수 `SUPABASE_URL`, `SUPABASE_ANON_KEY`가 필요하다. R2 secret은 Expo public env나 모바일 앱에 넣지 않는다.

## 원격 사진 조회

PR-18 기준으로 사진 탭은 로컬 `AsyncStorage` 사진 metadata를 먼저 불러온 뒤, Supabase session과 원격 family mapping이 있으면 원격 `media_assets`의 `uploaded` 사진을 조회한다.

- 원격 metadata 조회는 Supabase RLS의 `family_members` 기준 select policy를 따른다.
- 원격 사진 원본 URL은 앱이 직접 R2 secret을 사용하지 않고 `media-r2-url` Edge Function의 `create_download` action으로 signed download URL을 받는다.
- 원격 조회 또는 signed URL 요청이 실패해도 기존 로컬 사진 목록은 계속 표시한다.
- signed URL 캐시, 만료 후 자동 갱신, 썸네일 최적화는 후속 작업으로 둔다.

## 사진 원격 업로드 재시도

PR-19 기준으로 사진 원격 업로드 실패는 `AsyncStorage` queue에 저장한다.

- 사진 metadata는 기존처럼 먼저 로컬 저장소에 저장한다.
- Supabase session과 원격 family mapping이 있으면 원격 업로드 전에 같은 사용자 queue item을 먼저 재시도한다.
- 원격 업로드 준비, R2 PUT, 완료 알림 중 하나가 실패하면 queue item의 시도 횟수와 마지막 오류를 기록한다.
- 재시도 성공 시 queue item을 삭제하고 로컬 사진 metadata의 `remote_status`를 `uploaded`로 갱신한다.
- 백그라운드 자동 재시도와 R2 orphan 정리는 후속 작업으로 둔다.

## 사진 삭제와 R2 정리

SPEC-PHOTO-006 기준으로 사진 삭제는 local-first 흐름을 유지하면서 원격 정리를 이어서 시도한다.

- 사용자가 사진 삭제를 확인하면 앱은 로컬 `AsyncStorage` metadata와 같은 사진의 원격 업로드 queue item을 먼저 제거한다.
- 삭제 대상에 `remote_media_asset_id`가 있으면 앱은 `media-r2-url` Edge Function의 `delete_photo` action을 호출한다.
- Edge Function은 사용자 Auth header로 Supabase RLS를 적용해 `media_assets` 접근 권한을 확인한다.
- Edge Function은 R2 signed `DELETE` 요청으로 object를 삭제한 뒤 `media_assets.status`를 `deleted`로 갱신한다.
- 원격 삭제 실패는 로컬 사진 목록 표시를 막지 않고 사용자 메시지로 알린다.
- 실제 R2 object 삭제 검증은 Cloudflare R2 bucket과 배포된 Edge Function이 필요하므로 수동 검증으로 둔다.

## 완료된 세팅

- Node 버전 파일 `.nvmrc`를 추가했다.
- Expo + React Native + TypeScript 앱을 스캐폴딩했다.
- `lint`, `typecheck`, `test` 스크립트를 추가했다.
- Jest 기반 테스트 실행 기반을 추가했다.

## 예정된 세팅 단계

1. 필요한 시점에 포매팅 기준을 추가한다.
2. 경로 alias를 추가한다.
3. 아기 기록과 자연어 파서 초기 도메인 모듈을 만든다.
4. 가족 context와 remote family mapping이 날짜별 조회나 동기화 대상이 되면 SQLite 이전 범위를 검토한다.
5. sync queue의 백그라운드 재시도와 사용자 표시 상태를 추가한다.
6. 완전한 downsync, 수정/삭제 동기화, 충돌 해결이 필요해지면 SQLite typed column migration을 추가한다.

## 초기 도메인 모듈

예상 초기 모듈:

```txt
src/domain/baby-logs/
src/domain/family/
src/domain/parser/
src/domain/insights/
src/features/family/
src/features/logging/
src/features/timeline/
src/features/home/
```

## 검증 기준

스캐폴딩 이후 의미 있는 변경마다 다음 검증을 실행합니다.

```sh
npm run lint
npm run typecheck
npm test
```
