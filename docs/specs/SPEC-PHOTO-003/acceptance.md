# 수락 기준

## AC-001 (P0): 로컬 우선 사진 저장

- Given: 사용자가 사진 탭에서 사진을 선택한다.
- When: 앱이 사진 저장을 처리한다.
- Then: 사진 metadata는 먼저 로컬 저장소에 저장되고 화면에 반영된다.

## AC-002 (P0): R2 signed upload URL 발급

- Given: Supabase session과 원격 family mapping이 있다.
- When: 앱이 원격 사진 업로드를 요청한다.
- Then: 서버는 `media_assets` draft row를 만들고 R2 signed upload URL을 반환한다.

## AC-003 (P0): 업로드 완료 metadata 갱신

- Given: 앱이 signed upload URL로 사진 원본 업로드를 완료했다.
- When: 앱이 업로드 완료를 서버에 알린다.
- Then: 서버는 해당 `media_assets.status`를 `uploaded`로 갱신한다.

## AC-004 (P0): 비가족 접근 차단

- Given: 요청 사용자가 해당 `family_id`의 구성원이 아니다.
- When: 사용자가 upload 또는 download signed URL을 요청한다.
- Then: 서버는 Supabase RLS를 통해 `media_assets` 접근을 차단한다.

## AC-005 (P1): 원격 실패 시 로컬 흐름 유지

- Given: 로컬 저장은 성공했지만 원격 업로드 준비 또는 R2 업로드가 실패한다.
- When: 사진 추가 흐름이 완료된다.
- Then: 앱은 로컬 사진을 유지하고 원격 저장 실패 상태를 사용자에게 알린다.
