# 수락 기준

## AC-001 (P0): 기본 가족/아기 context

- Given: 로컬 저장소에 가족 정보가 없다.
- When: 앱이 family context를 불러온다.
- Then: 기본 가족, 기본 아기, `parent` 역할 구성원이 반환된다.

## AC-002 (P0): 기록의 아기 귀속

- Given: 현재 family context에 `family_id`와 `child_id`가 있다.
- When: 사용자가 빠른 기록 또는 확인된 텍스트 기록을 저장한다.
- Then: 저장되는 `BabyLog`는 현재 `family_id`와 `child_id`를 가진다.

## AC-003 (P0): 권한 범위 제한

- Given: 가족 구성원 정보가 있다.
- When: 가족 탭이 구성원 역할을 표시한다.
- Then: 역할은 `parent` 또는 `family`로만 표시된다.

## AC-004 (P1): 아기 등록 최소 플로우

- Given: 사용자가 가족 탭을 연다.
- When: 가족 이름, 아기 이름, 생년월일을 저장한다.
- Then: 홈 화면은 저장된 아기 이름과 D+ 값을 표시한다.
