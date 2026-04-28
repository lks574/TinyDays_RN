# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-11은 family/child 경계, 아기 등록 플로우, `family_id`/`child_id` 기록 연결, `parent`/`family` 권한 제한을 요구한다.
- `docs/product/mvp-scope.md`: 가족 생성, 가족 구성원 초대, 한 명 이상의 아기 등록은 MVP 필수 기능이다.
- `docs/architecture/decisions.md`: `baby_logs`는 `family_id`와 `child_id` 필드를 가지고, 초기 권한은 `parent`, `family`로 제한한다.

## 기존 코드

- `src/domain/baby-logs/baby-log.ts`: `BabyLog`는 이미 `child_id`, `family_id`, `created_by`를 필수 필드로 가진다.
- `src/features/logging/quick-log.ts`: 빠른 기록은 현재 `local-family`, `local-child`, `local-parent` 상수를 사용한다.
- `src/features/logging/text-log.ts`: 텍스트 기록도 같은 임시 상수를 사용한다.
- `app/(tabs)/family.tsx`: 가족 탭은 안내 placeholder 화면이다.
- `app/(tabs)/index.tsx`: 홈은 아기 이름과 D+ 값을 하드코딩한다.

## 결정

- PR-11에서는 원격 계정이나 초대 기능을 열지 않고, 로컬 `AsyncStorage` family context로 최소 모델을 구현한다.
- 기본 context는 기존 임시 ID를 유지해 저장된 로그와의 호환성을 유지한다.
- 역할 타입은 `parent`와 `family`만 허용한다.

## 리스크

- 로컬 context는 실제 가족 공유나 다중 기기 접근 제어를 보장하지 않는다.
- 다중 아기 선택 UI는 제외하므로 이후 여러 아기 지원 시 기록 필터와 입력 흐름을 확장해야 한다.
