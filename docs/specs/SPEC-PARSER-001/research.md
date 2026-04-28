# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-04 범위와 완료 기준을 정의한다.
- `docs/product/mvp-scope.md`: 초기 `BabyLogType`과 자연어 파싱 저장 전 확인 원칙을 정의한다.
- `docs/architecture/decisions.md`: MVP는 서버 AI 대신 룰 기반 파서를 먼저 사용한다.
- `docs/engineering/project-setup.md`: `src/domain/parser`를 초기 도메인 모듈 후보로 둔다.

## 기존 코드

- `src/domain/baby-logs/baby-log.ts`: `BabyLogType`, `CreateBabyLogInput`, `BabyLogSource`를 제공한다.
- `src/domain/baby-logs/baby-log.test.ts`: 도메인 타입과 확인 필요 helper를 테스트한다.

## 결정

- 파서는 React 컴포넌트와 분리된 순수 TypeScript 모듈로 구현한다.
- 파서 후보 타입은 저장에 필요한 필드 일부를 담되, `child_id`, `family_id`, `created_by`는 UI/저장 흐름에서 채운다.
- 자연어 파서 결과는 저장 전 확인 원칙에 맞게 `needsConfirmation: true`로 반환한다.

## 리스크

- 한국어 자연어 표현은 다양하므로 1차 rule은 제한적이다.
- 시간대와 날짜 보정은 MVP 초기에는 기준 시각의 같은 날짜를 사용한다.
