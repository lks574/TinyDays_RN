# 리서치

## 기존 문서

- `docs/product/mvp-scope.md`: 가족 탭은 구성원 목록, 초대 링크/코드, 권한 표시, 구성원 제거를 포함한다.
- `docs/product/next-task.md`: 구성원 제거와 초대 취소/재발급 구현 전에 권한과 데이터 보존 정책 확정을 다음 작업으로 지정했다.
- `docs/architecture/decisions.md`: ADR-006은 가족 데이터 접근을 `family_id`와 가족 구성원 자격으로 제한하고, 역할은 `parent`와 `family`만 둔다.
- `docs/architecture/decisions.md`: ADR-013은 가족 초대 1차에서 초대 취소/재발급 관리 화면과 구성원 제거를 후속 작업으로 분리했다.
- `docs/engineering/project-setup.md`: 가족 초대와 구성원 연결 1차는 `family_invites`, `create_family_invite`, `accept_family_invite` 기준으로 동작한다고 정리되어 있다.

## 기존 코드

- `supabase/migrations/20260429090000_initial_backend_schema.sql`: `family_members`는 `family_id`, `user_id`, `role`을 갖고 RLS helper `is_family_member`, `is_family_parent`의 기준이 된다.
- `supabase/migrations/20260429090000_initial_backend_schema.sql`: 현재 `parents can remove family members` delete policy가 있어 구현 시 마지막 `parent` 보호 규칙을 별도로 강제해야 한다.
- `supabase/migrations/20260430120000_family_invites_rpc.sql`: `family_invites`에는 `revoked_at`, `accepted_at`, `expires_at`이 이미 있으며 `accept_family_invite`는 취소/수락/만료 초대를 거부한다.
- `src/domain/family/remote-family.ts`: 원격 초대, 구성원, mapping 타입과 normalization helper가 있다.
- `src/features/family/remote-family-invite-repository.ts`: 초대 생성/수락 RPC 호출 repository가 있다.
- `src/features/family/remote-family-member-repository.ts`: 원격 `family_members` 목록 조회 repository가 있다.
- `app/(tabs)/family.tsx`: 가족 탭은 원격 가족 생성, 초대 코드 생성/수락, 구성원 목록 표시를 담당한다.

## 결정

- 초대 취소는 기존 `family_invites.revoked_at`을 사용한다.
- 초대 재발급은 새 초대 생성으로 처리하고 기존 초대를 수정하지 않는다.
- 구성원 제거는 접근권 제거로 정의하고 기존 기록/사진 데이터 삭제와 분리한다.
- 마지막 `parent` 제거와 자기 자신 제거는 1차에서 금지한다.
- 구성원 제거 후 기존 `created_by` 참조는 유지한다.

## 리스크

- 현재 schema는 `baby_logs.created_by`가 `auth.users(id)`를 참조하므로 구성원 row를 삭제해도 기존 기록의 작성자 user id는 유지된다. 다만 앱에서 제거된 작성자 이름 표시가 필요해지면 별도 표시 정책이 필요하다.
- 직접 `family_members` delete policy를 유지하면 RPC 바깥 경로로 마지막 `parent` 보호를 우회할 수 있다. 구현 시 DB trigger 또는 delete 권한 축소가 필요하다.
- 구성원 제거는 민감한 권한 작업이므로 UI 확인 dialog와 서버 검증이 모두 필요하다.
- 제거된 사용자의 로컬 `RemoteFamilyMapping`은 남아 있을 수 있으나 서버 RLS에서 접근이 차단되어야 한다.
- R2 object 삭제는 이번 범위가 아니며, 구성원 제거와 사진 보존 정책이 충돌하지 않도록 수동 검증이 필요하다.
