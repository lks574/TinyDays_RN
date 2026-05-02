# 수락 기준

## AC-001 (P0): Parent 초대 취소

- Given: 사용자가 로그인했고 원격 가족 mapping이 있으며 역할이 `parent`이고, 대기 중인 초대가 있다.
- When: 사용자가 초대 취소를 요청한다.
- Then: 서버는 해당 초대의 `revoked_at`을 기록하고 이후 초대 수락을 거부한다.

## AC-002 (P0): 취소된 초대 수락 거부

- Given: `revoked_at`이 기록된 초대 코드가 있다.
- When: 로그인한 사용자가 해당 초대 코드를 수락한다.
- Then: 서버는 가족 구성원 추가를 거부한다.

## AC-003 (P0): 초대 취소 권한 제한

- Given: 사용자가 `family` 역할이거나 해당 가족 구성원이 아니다.
- When: 사용자가 초대 취소를 요청한다.
- Then: 서버는 요청을 거부하고 초대 상태를 바꾸지 않는다.

## AC-004 (P0): Family 구성원 제거

- Given: 가족에 `parent`와 `family` 역할 구성원이 있고 사용자는 `parent`다.
- When: `parent`가 `family` 구성원 제거를 요청한다.
- Then: 서버는 대상 사용자가 더 이상 해당 가족의 원격 데이터에 접근할 수 없게 한다.

## AC-005 (P0): 마지막 Parent 보호

- Given: 가족에 `parent` 역할 구성원이 1명뿐이다.
- When: 사용자가 해당 `parent` 제거를 요청한다.
- Then: 서버는 마지막 `parent` 제거를 거부한다.

## AC-006 (P0): 자기 자신 제거 금지

- Given: 사용자가 로그인했고 자신의 원격 `family_members.id`를 알고 있다.
- When: 사용자가 자기 자신 제거를 요청한다.
- Then: 서버는 요청을 거부한다.

## AC-007 (P0): 기존 데이터 보존

- Given: 제거 대상 구성원이 만든 `baby_logs`와 `media_assets`가 있다.
- When: 해당 구성원이 제거된다.
- Then: 남아 있는 가족 구성원은 기존 기록과 사진 metadata를 계속 조회할 수 있다.

## AC-008 (P1): 원격 실패 시 로컬 흐름 유지

- Given: Supabase 설정, session, 원격 mapping, RPC 중 하나에 문제가 있다.
- When: 사용자가 초대 취소 또는 구성원 제거를 요청한다.
- Then: 앱은 실패 메시지를 표시하고 기존 로컬 가족/기록/사진 흐름을 유지한다.
