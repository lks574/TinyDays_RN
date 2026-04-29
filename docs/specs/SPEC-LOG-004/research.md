# 리서치

## 기존 문서

- `docs/product/next-task.md`: 다음 작업을 홈 화면 디자인 시스템 적용으로 지정한다.
- `docs/design/prototype/README.md`: 프로토타입은 화면 구조, 토큰, 카피, 상호작용 흐름 기준으로만 사용하고 기존 TypeScript 저장소/도메인 로직을 유지하라고 명시한다.
- `docs/product/mvp-scope.md`: 홈은 아기 프로필, D+ 표시, 오늘 요약, 마지막 상태, 빠른 버튼, 음성/텍스트 입력, 최근 타임라인을 포함한다.

## 기존 코드

- `app/(tabs)/index.tsx`: 홈 화면의 로컬 저장소 로드, 빠른 기록, 텍스트 파싱 확인, 최근 타임라인 흐름을 이미 구현한다.
- `src/shared/ui/design-system.tsx`: `Heading`, `Body`, `Caption`, `Card`, `Section`, `Button`, `Chip`, `Field`, `Input`, `RecordDot`, `recordTones`를 제공한다.
- `docs/design/prototype/screens-home.jsx`: 홈 화면의 시각 구조와 카피 기준을 제공한다.

## 결정

- 저장소와 도메인 로직은 변경하지 않는다.
- 홈 화면만 디자인 시스템을 적용한다.
- 파싱 결과는 계속 저장 전 확인 UI를 거친다.

## 리스크

- 작은 화면에서 4열 요약과 빠른 기록 텍스트가 좁아질 수 있으므로 줄바꿈과 고정 폭을 보수적으로 적용한다.
