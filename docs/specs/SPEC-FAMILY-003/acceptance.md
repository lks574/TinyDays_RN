# 수락 기준

## AC-001 (P0): 비로그인 상태 보존

- Given: Supabase config가 없거나 Auth session이 없다.
- When: 사용자가 가족 탭을 연다.
- Then: 원격 bootstrap은 비활성 상태로 표시되고 기존 로컬 가족 정보 저장 흐름은 계속 동작한다.

## AC-002 (P0): 원격 가족 bootstrap 생성

- Given: 사용자가 Supabase session으로 로그인되어 있고 로컬 가족과 선택된 아기 정보가 있다.
- When: 사용자가 원격 가족 만들기를 실행한다.
- Then: Supabase에 `families`, 본인 `parent` `family_members`, 첫 `children` 레코드가 생성된다.

## AC-003 (P0): local-to-remote mapping 저장

- Given: 원격 bootstrap이 성공했다.
- When: 앱이 결과를 처리한다.
- Then: 로컬 `family.id`, `selected_child_id`, `current_member.id`와 원격 `family_id`, `child_id`, `member_id`, `user_id` 매핑이 별도 로컬 저장소에 저장된다.

## AC-004 (P0): 첫 parent 생성의 RLS 경로

- Given: 신규 로그인 사용자는 아직 `family_members` row가 없다.
- When: 사용자가 원격 bootstrap을 실행한다.
- Then: 앱은 service role key 없이 authenticated RPC 또는 동등한 서버 경로로 첫 `parent` 멤버를 생성할 수 있다.

## AC-005 (P0): 중복 생성 방지

- Given: 로컬 원격 매핑이 있거나 서버에 사용자의 원격 가족 멤버십이 있다.
- When: 가족 탭이 원격 상태를 불러오거나 사용자가 bootstrap을 다시 시도한다.
- Then: 새 가족을 중복 생성하지 않고 기존 원격 가족/아기 연결 상태를 표시한다.

## AC-006 (P1): 실패 시 로컬 데이터 보존

- Given: 원격 bootstrap 요청이 네트워크 오류 또는 Supabase 오류로 실패한다.
- When: 앱이 오류를 처리한다.
- Then: 기존 로컬 가족 context, 기록, 사진 metadata는 변경되지 않고 재시도 가능한 오류 메시지가 표시된다.

## AC-007 (P1): PR-16 백업 준비

- Given: 원격 매핑이 저장되어 있다.
- When: 후속 `baby_logs` 백업 계층이 매핑을 조회한다.
- Then: 로컬 `family_id`, `child_id`, `created_by`를 원격 UUID로 변환할 수 있는 값이 제공된다.
