# 리서치

## 기존 문서

- `docs/architecture/backend-storage-strategy.md`: 최종 지향 구조는 Expo SQLite, Supabase Auth/Postgres/RLS, Cloudflare R2이다. 서버는 가족 공유, 권한, 동기화, 백업을 담당하고 미디어 파일은 object storage에 둔다.
- `docs/architecture/decisions.md`: ADR-004는 MVP의 통합 `baby_logs` 테이블을 채택했다. ADR-006은 `family_id` 기준 개인정보 모델과 `parent`, `family` 역할을 채택했다. ADR-010은 최종 백엔드 구조를 local-first SQLite, Supabase, Cloudflare R2로 채택했다.
- `docs/engineering/project-setup.md`: 현재 앱은 `AsyncStorage`를 사용하며, 인증/가족 공유/사진 또는 다중 기기 동기화가 필요해지면 Supabase와 R2를 도입한다고 되어 있다.
- `docs/product/mvp-scope.md`: MVP 필수 기능에는 회원가입, 로그인, 가족 생성, 구성원 초대, 아기 등록, 사진 업로드가 포함된다. 서버 LLM 파싱, 공개 공유, 복잡한 권한 체계는 비목표다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-01부터 PR-12까지 완료되어 있으며, 서버 백엔드 구성은 새 PR 범위로 추가해야 한다.

## 기존 코드

- `src/domain/baby-logs/baby-log.ts`: `BabyLog`는 `family_id`, `child_id`, `created_by`, `log_type`, `recorded_at`, `amount`, `unit`, `memo`, `source`, `original_text`, `confidence`, timestamp 필드를 가진다.
- `src/domain/family/family.ts`: family context는 `FamilyProfile`, `ChildProfile`, `FamilyMember`를 가지며 역할은 `parent`, `family`만 허용한다.
- `src/domain/photos/photo.ts`: `BabyPhoto`는 현재 로컬 URI와 사진 metadata를 가진다. 원격 전환 시 DB에는 파일 자체가 아니라 R2 object key와 metadata를 저장해야 한다.
- `src/features/logging/local-baby-log-repository.ts`: 현재 기록 저장은 `AsyncStorage` 기반이며 PR-13에서 교체하지 않는다.
- `src/features/family/local-family-context-repository.ts`: 현재 가족 context는 `AsyncStorage` 기반이며 PR-13에서 교체하지 않는다.
- `src/features/photos/local-baby-photo-repository.ts`: 현재 사진 metadata 저장은 `AsyncStorage` 기반이며 PR-13에서 교체하지 않는다.

## 결정

- PR-13은 앱 동작을 변경하지 않고 Supabase schema/RLS 기반만 추가한다.
- 서버 DB의 권한 기준은 모든 민감 데이터에 대해 `family_id`로 통일한다.
- `family_members.role`은 `parent`, `family`만 허용한다.
- `baby_logs`는 기존 앱 도메인 필드와 ADR-004의 통합 테이블 결정을 따른다.
- `media_assets`는 R2 private bucket을 전제로 하며 Supabase에는 metadata와 object key만 저장한다.
- Supabase Storage는 이번 구조의 기본 경로로 사용하지 않는다.
- R2 signed URL 발급, Edge Function, 실제 업로드는 후속 PR로 분리한다.

## 리스크

- RLS helper function이 과도한 권한으로 작성되면 가족 간 데이터 노출 위험이 생긴다.
- `created_by`를 `auth.users(id)`로 둘 경우 기존 로컬 `local-parent` ID와 직접 호환되지 않으므로 앱 연동 PR에서 ID 매핑 전략이 필요하다.
- `family_members` 생성 초기 흐름은 RLS bootstrap 문제가 있으므로 초대/가족 생성 PR에서 별도 정책 또는 RPC 설계가 필요하다.
- `family` 역할의 write 제한이 너무 강하면 이후 댓글/반응 기능과 충돌할 수 있다. MVP에서는 댓글/반응이 선택 기능이므로 이번 PR에서는 제한을 유지한다.
- R2 object key 규칙을 너무 일찍 고정하면 썸네일/압축본 확장에 비용이 생길 수 있다. 이번 PR에서는 `asset_type`, `object_key`, `status`만 최소로 둔다.
