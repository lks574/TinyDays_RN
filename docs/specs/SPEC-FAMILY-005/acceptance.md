# 수락 기준

## AC-001 (P0): 원격 구성원 목록 조회

- Given: 사용자가 로그인했고 원격 family mapping이 있다.
- When: 사용자가 가족 탭을 연다.
- Then: 앱은 원격 `family_members` 목록을 조회한다.

## AC-002 (P0): 구성원 역할 표시

- Given: 원격 `family_members` 목록에 `parent`와 `family` 역할 구성원이 있다.
- When: 가족 탭의 구성원 영역이 렌더링된다.
- Then: 각 구성원은 이름과 `parent` 또는 `family` 역할로 표시된다.

## AC-003 (P0): 현재 사용자 구분

- Given: 원격 구성원 중 한 명의 `user_id`가 현재 로그인 사용자 id와 같다.
- When: 가족 탭의 구성원 목록이 표시된다.
- Then: 해당 구성원은 현재 사용자로 구분된다.

## AC-004 (P1): 원격 조회 실패 fallback

- Given: 원격 family mapping은 있지만 `family_members` 조회가 실패한다.
- When: 가족 탭이 구성원 영역을 표시한다.
- Then: 앱은 기존 로컬 현재 사용자 정보를 계속 표시하고 원격 조회 실패 메시지를 보여준다.

## AC-005 (P1): 로컬 흐름 유지

- Given: Supabase 설정, session, 원격 mapping 중 하나가 없다.
- When: 사용자가 가족 탭을 연다.
- Then: 앱은 원격 조회 없이 기존 로컬 가족 정보와 기록/사진 local-first 흐름을 유지한다.
