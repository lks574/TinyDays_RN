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
- 자연어 파서 같은 도메인 로직은 단위 테스트 작성.

## 확정 기술 스택

PR-01 기준으로 아래 기술과 버전을 사용합니다.

| 구분 | 기술 | 기준 버전 |
|------|------|-----------|
| 런타임 | Node.js | 22 LTS |
| 패키지 매니저 | npm | `package-lock.json` 기준 |
| 앱 프레임워크 | Expo | `~54.0.33` |
| 이미지 선택 | `expo-image-picker` | `~17.0.11` |
| 앱 라우팅 | Expo Router | `~6.0.23` |
| UI 런타임 | React Native | `0.81.5` |
| UI 라이브러리 | React | `19.1.0` |
| 로컬 저장소 | `@react-native-async-storage/async-storage` | `2.2.0` |
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

## 완료된 세팅

- Node 버전 파일 `.nvmrc`를 추가했다.
- Expo + React Native + TypeScript 앱을 스캐폴딩했다.
- `lint`, `typecheck`, `test` 스크립트를 추가했다.
- Jest 기반 테스트 실행 기반을 추가했다.

## 예정된 세팅 단계

1. 필요한 시점에 포매팅 기준을 추가한다.
2. 경로 alias를 추가한다.
3. 아기 기록과 자연어 파서 초기 도메인 모듈을 만든다.
4. 기록 수정/삭제, 날짜별 조회, sync queue가 필요해지면 `baby_logs`부터 Expo SQLite로 이전한다.
5. 인증, 가족 공유, 사진 또는 다중 기기 동기화가 필요해지면 Supabase와 R2를 도입한다.

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
