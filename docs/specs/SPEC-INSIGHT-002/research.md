# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-10은 최근 7일 수유, 수면, 기저귀 집계와 단순 평균, 룰 기반 다음 행동 안내를 요구한다.
- `docs/product/mvp-scope.md`: 인사이트 탭은 수유, 수면, 기저귀 패턴과 최근 7일 요약, 다음 예상 행동을 포함한다.
- `docs/architecture/decisions.md`: MVP는 통합 `baby_logs` 모델과 룰 기반 로직을 우선한다.

## 기존 코드

- `src/domain/insights/today-summary.ts`: 오늘 요약을 순수 함수로 계산한다.
- `app/(tabs)/insights.tsx`: 현재 임시 안내 화면이다.
- `src/features/logging/local-baby-log-repository.ts`: AsyncStorage 기반 `baby_logs` 저장소가 있다.

## 결정

- 최근 7일 범위는 기준 시각의 로컬 날짜를 포함한 7일로 계산한다.
- 평균은 기록이 있는 날 수가 아니라 7일 고정 분모로 계산한다.
- 다음 행동 안내는 고정 임계값과 마지막 기록 시각만 사용한다.

## 리스크

- 아기별 프로필이 아직 없어 모든 로컬 기록을 하나의 아이 기록으로 간주한다.
- 다음 행동은 예측이 아니라 안내 수준이므로 UI 문구에서 확정적으로 표현하지 않는다.
