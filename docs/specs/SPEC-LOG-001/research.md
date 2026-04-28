# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-05는 빠른 기록 UI와 최근 타임라인 표시를 요구하며 저장소 도입을 제외한다.
- `docs/product/mvp-scope.md`: 홈 탭은 빠른 버튼과 최근 타임라인을 포함한다.
- `docs/architecture/decisions.md`: MVP는 통합 `baby_logs` 모델을 사용한다.

## 기존 코드

- `src/domain/baby-logs/baby-log.ts`: `createBabyLog`와 `BabyLog` 타입을 제공한다.
- `app/(tabs)/index.tsx`: 홈 화면 placeholder만 있다.
- `src/shared/ui/theme.ts`: 기본 색상 토큰을 제공한다.

## 결정

- PR-05에서는 임시 로컬 state만 사용한다.
- 빠른 기록 생성은 UI에서 직접 객체를 만들지 않고 `src/features/logging` helper로 분리한다.
- 수면 빠른 버튼은 마지막 수면 상태에 따라 시작/종료를 번갈아 만들 수 있게 한다.

## 리스크

- 영구 저장소가 없으므로 앱 재시작 후 기록은 사라진다. 이는 PR-07 범위다.
- 수유량, 체온 값 입력은 아직 고정 기본값을 사용한다. 세부 수정 흐름은 이후 기록 생성/확인 UI에서 다룬다.
