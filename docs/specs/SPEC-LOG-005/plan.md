# 구현 계획

## 태스크

- [x] T1: 로컬 `BabyLog`와 원격 family mapping을 원격 insert row로 변환하는 순수 함수를 추가한다.
- [x] T2: `AsyncStorage` 기반 원격 백업 queue repository를 추가한다.
- [x] T3: Supabase `baby_logs` insert repository를 추가한다.
- [x] T4: 로컬 저장 후 원격 백업을 시도하는 orchestration 함수를 추가한다.
- [x] T5: 홈 저장 흐름에서 orchestration 함수를 사용한다.
- [x] T6: 단위 테스트와 문서를 업데이트한다.

## 구현 순서

1. 원격 insert payload 타입과 변환 함수를 작성한다.
2. queue item 타입과 저장/삭제/목록 repository를 작성한다.
3. Supabase insert 함수를 작성한다.
4. 로컬 저장 성공 후 session, mapping, queue 처리 순서로 백업을 시도한다.
5. 홈 화면은 원격 실패를 저장 실패로 보지 않고 로컬 저장 결과만 반영한다.
6. `npm run lint`, `npm run typecheck`, `npm test`를 실행한다.

## 테스트 계획

- mapping이 있으면 local ID 대신 원격 UUID로 insert row가 만들어지는지 테스트한다.
- queue repository가 저장, 중복 교체, 삭제, 손상 JSON 복구를 처리하는지 테스트한다.
- remote backup orchestration이 로컬 저장을 먼저 수행하고 원격 실패 시 queue를 남기는지 테스트한다.
- session 또는 mapping이 없으면 로컬 저장만 성공하는지 테스트한다.
