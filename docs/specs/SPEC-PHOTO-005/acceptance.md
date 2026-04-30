# 수락 기준

## AC-001 (P0): 실패한 사진 업로드 queue 저장

- Given: 로컬 사진 저장은 성공했고 Supabase session과 원격 family mapping이 있다.
- When: 원격 업로드 준비, R2 PUT, 완료 알림 중 하나가 실패한다.
- Then: 앱은 로컬 사진을 유지하고 실패한 사진을 원격 업로드 queue에 저장한다.

## AC-002 (P0): queue 재시도 성공

- Given: 실패한 사진 원격 업로드 queue item이 있다.
- When: 이후 사진 업로드 경로가 실행되고 원격 업로드가 성공한다.
- Then: 앱은 queue item을 삭제하고 로컬 사진의 remote 상태를 `uploaded`로 갱신한다.

## AC-003 (P0): queue 재시도 실패 정보 갱신

- Given: 실패한 사진 원격 업로드 queue item이 있다.
- When: 이후 재시도도 실패한다.
- Then: 앱은 queue item의 `attempt_count`, `last_attempt_at`, `last_error`를 갱신한다.

## AC-004 (P1): 원격 불가 시 로컬 흐름 유지

- Given: Supabase 설정, session, 원격 mapping 중 하나가 없다.
- When: 사용자가 사진을 추가한다.
- Then: 앱은 사진을 로컬에 저장하고 원격 업로드 queue 처리를 건너뛴다.
