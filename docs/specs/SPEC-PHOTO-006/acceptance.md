# 수락 기준

## AC-001 (P0): 로컬 사진 삭제

- Given: 로컬 사진 metadata가 있다.
- When: 사용자가 사진 삭제를 확인한다.
- Then: 앱은 해당 사진을 로컬 저장소와 현재 사진 목록에서 제거한다.

## AC-002 (P0): 원격 사진 삭제와 R2 정리

- Given: 삭제 대상 사진에 `remote_media_asset_id`가 있고 Supabase session과 원격 family mapping이 있다.
- When: 사용자가 사진 삭제를 확인한다.
- Then: 앱은 Edge Function에 원격 삭제를 요청하고 서버는 R2 object 삭제 후 `media_assets.status`를 `deleted`로 갱신한다.

## AC-003 (P0): 원격 삭제 실패 시 로컬 흐름 유지

- Given: 로컬 사진 삭제는 성공했고 원격 삭제 요청은 실패한다.
- When: 삭제 처리가 끝난다.
- Then: 앱은 로컬 사진 목록을 유지하고 원격 정리 실패 메시지를 표시한다.

## AC-004 (P1): 업로드 queue 정리

- Given: 삭제 대상 사진의 원격 업로드 queue item이 있다.
- When: 사용자가 사진 삭제를 확인한다.
- Then: 앱은 해당 queue item을 제거해 삭제한 사진이 이후 업로드 재시도되지 않게 한다.
