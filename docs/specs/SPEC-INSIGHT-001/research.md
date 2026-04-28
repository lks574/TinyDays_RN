# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-09는 오늘 수유, 수면, 기저귀, 마지막 기록 상태 계산과 홈 연결을 요구한다.
- `docs/product/mvp-scope.md`: 홈 탭은 오늘 요약과 마지막 상태를 포함한다.
- `docs/architecture/decisions.md`: MVP는 통합 `baby_logs` 모델과 로컬 `AsyncStorage` 저장소를 사용한다.

## 기존 코드

- `src/domain/baby-logs/baby-log.ts`: `BabyLog`와 `BabyLogType`을 정의한다.
- `src/features/logging/local-baby-log-repository.ts`: 홈과 기록 탭에서 같은 로컬 저장소를 사용한다.
- `app/(tabs)/index.tsx`: 홈 화면이 저장소에서 기록을 불러오고 최근 타임라인을 표시한다.
- `src/features/timeline/timeline.ts`: 날짜 키와 기록 타입 label helper가 있다.

## 결정

- 오늘 요약은 `src/domain/insights`의 순수 함수로 계산한다.
- 수면 총 시간은 같은 날 안에서 `sleep_start` 다음에 오는 `sleep_end` 쌍만 합산한다.
- 진행 중인 수면은 횟수에는 포함하지만 종료 시간이 없으므로 총 시간에는 포함하지 않는다.

## 리스크

- 현재 기록은 임시 `child_id` 기반이므로 여러 아기 구분은 PR-11 이후 다시 반영해야 한다.
- 자정을 넘는 수면은 PR-09 범위에서는 보수적으로 오늘 시작/종료 쌍만 계산한다.
