# 프로젝트 세팅

## 현재 저장소 상태

Git 저장소가 초기화되었고 프로젝트 계획 문서가 추가되었습니다. React Native 앱은 아직 스캐폴딩하지 않았습니다.

## 권장 기준

- Expo 기반 React Native.
- TypeScript.
- 탭/내비게이션 구조로 시작한다면 Expo Router.
- 앱 셸과 도메인 경계가 잡힌 뒤 Supabase 도입.
- 자연어 파서 같은 도메인 로직은 단위 테스트 작성.

## Node 버전

초기 세팅 중 확인한 현재 로컬 Node 버전은 다음과 같습니다.

```txt
v25.8.0
```

React Native와 Expo 프로젝트는 일반적으로 활성 LTS Node 버전에서 더 안전합니다. 앱을 스캐폴딩하기 전에 프로젝트 단위 Node 버전 파일을 추가하고, 선택한 Expo 버전이 달리 요구하지 않는 한 Node 22 같은 LTS 버전을 사용하는 것이 좋습니다.

## 예정된 세팅 단계

1. Node 버전 파일을 추가한다.
2. 이 저장소에 Expo TypeScript 앱을 스캐폴딩한다.
3. 린트와 포매팅을 추가한다.
4. 경로 alias를 추가한다.
5. 순수 TypeScript 모듈을 위한 테스트 도구를 추가한다.
6. 아기 기록과 자연어 파서 초기 도메인 모듈을 만든다.
7. 앱 구조와 도메인 경계가 명확해진 뒤 Supabase를 추가한다.

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

정확한 명령어는 도구 설치 이후 바뀔 수 있습니다. 스크립트를 추가하거나 이름을 바꾸면 이 문서를 함께 업데이트합니다.

