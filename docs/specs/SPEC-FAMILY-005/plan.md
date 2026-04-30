# 구현 계획

## 태스크

- [x] T1: 가족 구성원 목록 조회 SPEC 문서를 작성한다.
- [x] T2: 원격 가족 구성원 도메인 타입과 normalization helper를 추가한다.
- [x] T3: Supabase `family_members` 조회 repository를 추가한다.
- [x] T4: 가족 탭 구성원 영역을 원격 목록 기준으로 표시하되 로컬 fallback을 유지한다.
- [x] T5: 단위 테스트와 앱 검증 명령을 실행한다.

## 구현 순서

1. `RemoteFamilyMember`는 `id`, `family_id`, `user_id`, `name`, `role`만 앱 표시용으로 사용한다.
2. repository는 원격 family id로 `family_members`를 조회하고 `created_at` 오름차순으로 정렬한다.
3. 가족 탭은 원격 mapping이 있을 때 구성원 목록을 별도로 로드한다.
4. 조회 성공 시 원격 구성원 수와 역할을 표시한다.
5. 조회 실패 또는 원격 연결 없음 상태에서는 기존 로컬 현재 사용자 1명을 표시한다.

## 테스트 계획

- 원격 구성원 normalization이 유효한 값과 잘못된 역할을 구분하는지 테스트한다.
- repository가 `family_members` select, family id 필터, 정렬을 호출하는지 테스트한다.
- `npm run lint`, `npm run typecheck`, `npm test`를 실행한다.
- Supabase 실환경 session/RLS 동작은 `docs/qa/manual-tests/SPEC-FAMILY-005.md` 체크리스트로 수동 검증한다.
