# 리서치

## 기존 문서

- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-07은 저장소 선택 문서화, 로컬 저장소 또는 Supabase 도입, repository interface 분리를 요구한다.
- `docs/architecture/decisions.md`: Supabase는 초기 백엔드 후보로 제안되어 있고, 통합 `baby_logs` 모델은 채택되어 있다.
- `docs/engineering/project-setup.md`: 앱 구조와 도메인 경계가 명확해진 뒤 Supabase를 추가한다고 되어 있다.

## 기존 코드

- `app/(tabs)/index.tsx`: 홈 화면이 `useState`로만 `BabyLog[]`를 보관한다.
- `src/domain/baby-logs/baby-log.ts`: 저장 가능한 `BabyLog` 타입과 생성 helper가 있다.
- `src/features/logging/quick-log.ts`: 빠른 기록 후보를 `BabyLog`로 생성한다.
- `src/features/logging/text-log.ts`: 확인된 파싱 결과를 `BabyLog`로 생성한다.

## 결정

- PR-07에서는 `AsyncStorage`를 채택한다.
- 이유는 현재 목표가 서버 계정, 가족 권한, 원격 동기화가 아니라 앱 재시작 후 기록 유지이기 때문이다.
- Supabase는 인증, 가족, 사진, 다중 기기 동기화가 실제 범위에 들어오는 PR에서 채택 여부를 다시 확정한다.

## 리스크

- 로컬 저장만으로는 기기 분실, 앱 삭제, 다중 보호자 동기화를 해결하지 못한다.
- `AsyncStorage`는 관계형 쿼리에 적합하지 않으므로 날짜별 타임라인과 분석이 커지면 SQLite 또는 Supabase 전환이 필요할 수 있다.
