# 프로젝트 세팅

## 현재 저장소 상태

Expo + React Native + TypeScript 앱이 저장소 루트에 스캐폴딩되었습니다. 현재 앱은 PR-01 기준의 기본 진입점만 제공하며, 탭 구조와 실제 기록 기능은 이후 PR에서 추가합니다.

## 권장 기준

- Expo 기반 React Native.
- TypeScript.
- 탭/내비게이션 구조로 시작한다면 Expo Router.
- 앱 셸과 도메인 경계가 잡힌 뒤 Supabase 도입.
- 자연어 파서 같은 도메인 로직은 단위 테스트 작성.

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

1. PR-02에서 탭/내비게이션 구조를 추가한다.
2. 필요한 시점에 포매팅 기준을 추가한다.
3. 경로 alias를 추가한다.
4. 아기 기록과 자연어 파서 초기 도메인 모듈을 만든다.
5. 앱 구조와 도메인 경계가 명확해진 뒤 Supabase를 추가한다.

## 초기 도메인 모듈

예상 초기 모듈:

```txt
src/domain/baby-logs/
src/domain/parser/
src/domain/insights/
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
