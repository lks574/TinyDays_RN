# 구현 계획

## 태스크

- [x] T1: 사진 원격 업로드 queue item 타입과 `AsyncStorage` repository를 추가한다.
- [x] T2: 사진 업로드 서비스가 기존 queue를 먼저 재시도하게 한다.
- [x] T3: 새 사진 원격 업로드 실패를 queue에 저장하게 한다.
- [x] T4: 사진 탭의 원격 상태 메시지를 queue 결과에 맞게 조정한다.
- [x] T5: queue repository와 업로드 서비스 단위 테스트를 추가한다.

## 구현 순서

1. `baby_logs` 원격 백업 queue 패턴을 사진 도메인에 맞게 복제한다.
2. queue item에는 `local_photo_id`, `user_id`, `photo`, 시도 횟수와 마지막 오류 정보를 저장한다.
3. 새 사진 업로드 전 같은 사용자 queue item을 오래된 순서로 재시도한다.
4. 성공한 queue item은 삭제하고, 실패한 item은 시도 정보를 갱신한다.
5. 새 사진 업로드 실패는 queue에 저장하고 UI에는 재시도 예정 상태를 표시한다.

## 테스트 계획

- queue item 저장, 교체, 삭제, 정렬, 잘못된 JSON 복구를 테스트한다.
- 원격 업로드 실패 시 queue item이 생성되는지 테스트한다.
- 기존 queue item이 새 업로드 전에 재시도되고 성공 시 삭제되는지 테스트한다.
- 재시도 실패 시 시도 횟수와 마지막 오류가 갱신되는지 테스트한다.
