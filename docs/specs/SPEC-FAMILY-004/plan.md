# 구현 계획

## 태스크

- [x] T1: 가족 초대 SPEC 문서를 작성한다.
- [x] T2: Supabase `family_invites` schema와 초대 생성/수락 RPC를 추가한다.
- [x] T3: 원격 초대 도메인 타입과 normalization helper를 추가한다.
- [x] T4: 앱 repository에서 초대 생성/수락 RPC를 호출한다.
- [x] T5: 가족 탭에 초대 코드 생성과 초대 코드 수락 UI를 추가한다.
- [x] T6: 단위 테스트와 RLS smoke test를 보강한다.

## 구현 순서

1. `family_invites`는 초대 코드, 가족, 생성자, 만료/취소 시각만 저장한다.
2. `create_family_invite` RPC는 `parent` 권한을 확인하고 코드를 반환한다.
3. `accept_family_invite` RPC는 authenticated 사용자를 `family` 역할로 추가하고 첫 아기 정보를 함께 반환한다.
4. 앱은 초대 수락 결과를 기존 `RemoteFamilyMapping`으로 변환해 저장한다.
5. UI는 로그인 상태에서만 초대 생성/수락을 노출하고 로컬 흐름은 유지한다.

## 테스트 계획

- 초대 응답 normalization을 테스트한다.
- 초대 수락 결과가 remote mapping으로 변환되는지 테스트한다.
- repository가 RPC 파라미터와 응답 검증을 수행하는지 테스트한다.
- RLS smoke test에서 `parent` 생성, `family` 수락, 비권한 생성 실패를 확인한다.
