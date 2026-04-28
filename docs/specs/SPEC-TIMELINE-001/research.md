# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-08은 기록 탭 구현, 날짜 선택, 시간순 기록 목록, 기록 타입 필터 기초를 요구한다.
- `docs/product/mvp-scope.md`: 초기 기록 탭은 날짜 선택, 시간순 기록, 수정/삭제, 필터를 포함한다.
- `docs/architecture/decisions.md`: PR-07 저장소는 `AsyncStorage` 기반 `BabyLogRepository`로 채택되어 있다.

## 기존 코드

- `app/(tabs)/logs.tsx`: 기록 탭 placeholder만 존재한다.
- `app/(tabs)/index.tsx`: 홈에서 `localBabyLogRepository`를 읽고 빠른 기록/텍스트 기록을 저장한다.
- `src/features/logging/local-baby-log-repository.ts`: `listLogs`, `saveLog` repository interface를 구현한다.
- `src/domain/baby-logs/baby-log.ts`: `BabyLogType`, `BabyLog` 통합 모델을 정의한다.

## 결정

- PR-08은 기존 `localBabyLogRepository`를 재사용한다.
- 날짜별 조회와 타입 필터는 `src/features/timeline`의 순수 함수로 분리한다.
- 기록 수정과 삭제는 이번 PR에서 제외하고 별도 PR로 분리한다.

## 리스크

- AsyncStorage는 날짜별 쿼리가 없으므로 전체 목록을 읽은 뒤 앱에서 필터링한다. MVP 데이터 규모에서는 허용 가능하지만 기록량이 늘면 SQLite 또는 Supabase 전환을 재검토해야 한다.
- 홈 화면은 탭 복귀 시 자동 새로고침을 하지 않는다. PR-08의 기록 탭은 탭 포커스 없이 mount 시점 조회를 우선 구현한다.
