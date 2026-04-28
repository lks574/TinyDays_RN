# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-06은 텍스트 입력, parser 연결, 확인 UI, 수정/확인 후 저장을 요구한다.
- `docs/product/mvp-scope.md`: 음성/텍스트 파싱 결과는 저장 전 확인해야 한다.
- `docs/architecture/decisions.md`: MVP에서는 서버 AI 대신 앱 내부 룰 기반 파서를 사용한다.

## 기존 코드

- `src/domain/parser/parser.ts`: `parseBabyLogText`가 `parsedLog`, `confidence`, `needsConfirmation`, `originalText`를 반환한다.
- `src/features/logging/quick-log.ts`: 빠른 기록을 임시 `BabyLog`로 생성한다.
- `app/(tabs)/index.tsx`: 빠른 기록과 최근 타임라인 로컬 state가 있다.

## 결정

- PR-06에서도 영구 저장소를 도입하지 않고 홈 화면 로컬 state에만 반영한다.
- 자연어 parser 결과는 `needsConfirmation` 여부와 관계없이 저장 전 확인 UI를 거친다.
- 확인 UI는 별도 화면 대신 홈 화면 내부 패널로 구현한다.

## 리스크

- 타입과 수치 수정은 MVP 1차 수준의 간단한 필드 편집으로 제한한다.
- 저장소 도입 전이므로 앱 재시작 후 기록은 유지되지 않는다.
