# 리서치

## 기존 문서

- `docs/product/next-task.md`: PR-15의 다음 백엔드 단계는 로그인 사용자를 원격 `families`, `family_members`, `children` 구조와 연결하고, 기존 로컬 ID와 원격 UUID 매핑 전략을 명확히 하는 것이다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-15는 로그인한 사용자가 원격 가족, 아기, 본인 `parent` 구성원을 만들 수 있어야 하며 초대 링크/코드의 실제 공유 UX는 제외한다.
- `docs/product/mvp-scope.md`: 가족 생성, 가족 구성원 초대, 한 명 이상의 아기 등록은 MVP 필수 기능이지만 공개 공유와 복잡한 권한 체계는 비목표다.
- `docs/architecture/decisions.md`: ADR-006은 가족 단위 개인정보 모델과 `parent`, `family` 역할만 채택한다. ADR-010은 최종 구조를 local-first SQLite, Supabase, Cloudflare R2로 둔다.
- `docs/engineering/project-setup.md`: PR-14는 Supabase Auth session 계층을 연결했고, PR-15는 `families`, `family_members`, `children` 생성을 연결하는 단계다.

## 기존 코드

- `src/features/auth/use-supabase-auth.ts`: Supabase session을 읽고 email/password 로그인, 가입, 로그아웃을 제공한다.
- `src/features/auth/supabase-client.ts`: `AsyncStorage` session persistence를 사용하는 Supabase client singleton을 제공한다.
- `src/domain/family/family.ts`: 로컬 `FamilyContext`, `FamilyProfile`, `ChildProfile`, `FamilyMember`, `LogOwnerContext`를 정의한다.
- `src/features/family/local-family-context-repository.ts`: 로컬 family context를 `AsyncStorage`에 저장한다.
- `app/(tabs)/family.tsx`: 로컬 가족/아기 정보 편집 UI와 원격 계정 상태 패널이 함께 있다.
- `supabase/migrations/20260429090000_initial_backend_schema.sql`: `families`, `family_members`, `children`, `baby_logs`, `media_assets`와 RLS policy를 정의한다.

## 결정

- PR-15는 기존 로컬 family context를 원격 UUID로 덮어쓰지 않는다.
- 로컬 ID와 원격 UUID는 별도 mapping record로 연결한다.
- mapping record는 최소 `user_id`, `local_family_id`, `remote_family_id`, `local_child_id`, `remote_child_id`, `local_member_id`, `remote_member_id`, `bootstrapped_at`, `updated_at`을 포함한다.
- PR-15에서는 원격 가족 bootstrap 성공 후에도 새 기록은 기존 로컬 저장소에 먼저 저장된다.
- 후속 PR-16은 mapping record를 사용해 로컬 `baby_logs`를 원격 UUID 기준으로 백업한다.
- 현재 RLS policy에서는 첫 `family_members` insert가 `public.is_family_parent(family_id)`를 요구하므로 신규 가족의 첫 parent 생성 경로가 막힌다.
- 첫 parent 생성은 service role key를 앱에 넣지 않고 Supabase migration의 `bootstrap_family` RPC 또는 동등한 security definer 함수로 해결한다.
- bootstrap 함수는 authenticated 사용자만 호출할 수 있고, `family_members.user_id`와 `families.created_by`는 `auth.uid()`로 고정한다.

## 리스크

- bootstrap RPC가 과도한 권한을 가지면 가족/아기 개인정보가 다른 사용자에게 노출될 수 있다.
- 원격 생성은 성공했지만 로컬 mapping 저장이 실패하면 서버에는 데이터가 있고 앱은 미연결로 보일 수 있다. 구현 시 서버 멤버십 조회로 복구해야 한다.
- 같은 사용자가 재시도할 때 중복 가족이 만들어질 수 있다. 앱은 로컬 mapping과 서버 멤버십을 먼저 확인해야 한다.
- 기존 로컬 ID는 `local-family`, `local-child`, `local-parent`처럼 UUID가 아니므로 원격 테이블 primary key로 그대로 사용할 수 없다.
- PR-15는 초대 UX와 기록 백업을 열지 않으므로 원격 연결 후에도 사용자가 기대하는 가족 공유 전체가 완성된 것은 아니다.
