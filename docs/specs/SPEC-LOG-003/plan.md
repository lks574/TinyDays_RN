# 구현 계획

## 태스크

- [x] T1: `BabyLogRepository` interface를 정의한다.
- [x] T2: `AsyncStorage` 기반 로컬 repository를 추가한다.
- [x] T3: 홈 화면 기록 생성 흐름을 비동기 저장소와 연결한다.
- [x] T4: 저장소 결정과 세팅 문서를 업데이트한다.
- [x] T5: repository 단위 테스트를 추가한다.

## 구현 순서

1. 저장소 선택을 ADR에 기록한다.
2. `@react-native-async-storage/async-storage` 의존성을 추가한다.
3. repository interface와 `AsyncStorage` 구현을 작성한다.
4. 홈 화면에서 앱 시작 시 기록을 불러오고 저장 시 repository를 호출한다.
5. 저장소 실패 메시지를 홈 화면에 표시한다.
6. 테스트와 검증 명령을 실행한다.

## 테스트 계획

- 로컬 repository가 저장된 기록을 최신순으로 불러오는지 확인한다.
- 저장소에 잘못된 JSON이 있어도 빈 목록으로 복구하는지 확인한다.
- 새 기록 저장 후 전체 목록이 유지되는지 확인한다.
