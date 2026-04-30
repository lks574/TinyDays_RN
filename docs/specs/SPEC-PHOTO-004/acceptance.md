# 수락 기준

## AC-001 (P0): 원격 사진 표시

- Given: 로그인 session과 원격 family mapping이 있고 `media_assets.status`가 `uploaded`인 사진이 있다.
- When: 사용자가 사진 탭을 연다.
- Then: 앱은 signed download URL을 받아 해당 원격 사진을 사진 목록에 표시한다.

## AC-002 (P0): 로컬/원격 목록 병합

- Given: 로컬 사진과 원격 사진이 함께 있다.
- When: 사진 목록을 불러온다.
- Then: 앱은 같은 사진 탭 날짜별 목록에 두 출처의 사진을 함께 표시하고 같은 `media_asset_id`는 중복 표시하지 않는다.

## AC-003 (P0): 원격 실패 격리

- Given: 로컬 사진이 있고 원격 metadata 조회 또는 download URL 요청이 실패한다.
- When: 사진 탭을 연다.
- Then: 앱은 로컬 사진 목록을 계속 표시하고 원격 사진만 건너뛴다.

## AC-004 (P0): 비가족 접근 차단

- Given: 요청 사용자가 해당 가족 구성원이 아니다.
- When: 원격 metadata 조회 또는 download URL 요청을 한다.
- Then: Supabase RLS 또는 Edge Function 경로에서 요청이 실패하고 앱에는 사진 URL이 노출되지 않는다.
