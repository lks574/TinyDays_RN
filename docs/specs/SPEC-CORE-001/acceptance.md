# 수락 기준

## AC-001 (P0): `baby_logs` SQLite 저장

- Given: 새 `BabyLog`가 있다.
- When: 로컬 기록 repository가 기록을 저장한다.
- Then: 앱은 SQLite `baby_logs` table에 record를 저장하고 최신순 목록을 반환한다.

## AC-002 (P0): 사진 metadata SQLite 저장과 삭제

- Given: 새 `BabyPhoto` metadata가 있다.
- When: 로컬 사진 repository가 저장 후 삭제를 수행한다.
- Then: 앱은 SQLite `baby_photo_metadata` table 기준 목록을 반환한다.

## AC-003 (P0): 통합 sync queue

- Given: 기록 백업 실패 item과 사진 업로드 실패 item이 있다.
- When: 각 queue repository가 item을 저장한다.
- Then: 앱은 단일 `sync_queue` table에 `queue_type`으로 구분해 저장하고 오래된 순서로 조회한다.

## AC-004 (P1): AsyncStorage import

- Given: 기존 AsyncStorage key에 유효한 records가 있고 SQLite table이 비어 있다.
- When: repository가 처음 목록을 조회한다.
- Then: 앱은 유효한 records를 SQLite로 가져오고 기존 정렬 순서로 반환한다.
