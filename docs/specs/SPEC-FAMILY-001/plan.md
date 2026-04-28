# 구현 계획

## 태스크

- [x] T1: 최소 family/child 도메인 타입과 생성/검증 helper 추가
- [x] T2: 로컬 family context 저장소 추가
- [x] T3: 빠른 기록과 텍스트 기록 생성 시 현재 family/child context 연결
- [x] T4: 가족 탭에서 가족/아기 최소 등록 플로우 구현
- [x] T5: 홈에서 아기 이름과 D+ 표시 연결
- [x] T6: 단위 테스트와 PR 로드맵 상태 업데이트

## 구현 순서

1. `FamilyProfile`, `ChildProfile`, `FamilyMember`, `FamilyContext` 타입을 만든다.
2. 기본 로컬 context를 제공하고 저장된 context를 정규화하는 순수 함수를 테스트한다.
3. `AsyncStorage` 저장소에서 family context를 읽고 저장한다.
4. logging helper가 임시 상수 대신 `LogOwnerContext`를 받아 `BabyLog`를 생성하게 한다.
5. 홈 화면은 context를 불러와 기록 생성, 이름, D+ 표시에 사용한다.
6. 가족 탭은 context를 편집하고 저장한다.
7. `npm run lint`, `npm run typecheck`, `npm test`로 검증한다.

## 테스트 계획

- 기본 context가 `parent`/`family` 역할과 1명 아기를 포함하는지 검증.
- 저장된 context가 잘못된 구조일 때 기본 context로 복구되는지 검증.
- 빠른 기록과 텍스트 기록이 전달받은 `family_id`, `child_id`, `created_by`를 사용하는지 검증.
- D+ 계산이 생년월일 기준으로 동작하는지 검증.
