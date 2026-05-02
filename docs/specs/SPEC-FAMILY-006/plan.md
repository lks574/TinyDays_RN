# 구현 계획

## 태스크

- [x] T1: 초대 취소와 구성원 제거 SPEC 문서를 작성한다.
- [x] T2: Supabase migration에 `cancel_family_invite` RPC와 구성원 제거 RPC 또는 DB trigger를 추가한다.
- [x] T3: 마지막 `parent` 보호와 자기 자신 제거 금지를 DB 레벨에서 검증한다.
- [x] T4: 앱 repository에 초대 취소와 구성원 제거 호출 함수를 추가한다.
- [x] T5: 가족 탭에서 `parent`에게만 초대 취소와 구성원 제거 액션을 노출한다.
- [x] T6: 단위 테스트와 RLS smoke test를 보강한다.
- [x] T7: 실환경 수동 검증 체크리스트를 `docs/qa/manual-tests/`에 추가한다.

## 구현 순서

1. 서버 정책을 먼저 고정한다. 직접 `family_members` delete가 마지막 `parent` 보호 규칙을 우회하지 않도록 RPC, RLS, trigger 중 하나로 강제한다.
2. `cancel_family_invite(invite_id)`는 authenticated `parent`만 호출할 수 있게 하고, 대기 초대만 취소한다.
3. 구성원 제거 함수는 요청자와 대상 구성원의 가족이 같은지 확인한다.
4. 구성원 제거 함수는 자기 자신 제거와 마지막 `parent` 제거를 거부한다.
5. 앱 repository는 RPC 결과를 해석하고 오류 메시지를 도메인 친화적인 메시지로 변환한다.
6. 가족 탭은 현재 사용자가 `parent`일 때만 대기 초대 취소와 다른 구성원 제거 액션을 표시한다.
7. 성공 후 원격 초대/구성원 목록을 다시 조회한다.

## 테스트 계획

- `parent`가 대기 초대를 취소할 수 있는지 RLS smoke test로 확인한다.
- `family` 역할과 비구성원이 초대 취소를 거부당하는지 확인한다.
- 취소된 초대 코드가 `accept_family_invite`에서 거부되는지 확인한다.
- `parent`가 `family` 구성원을 제거하면 제거된 사용자가 가족 데이터 조회 권한을 잃는지 확인한다.
- 마지막 `parent` 제거와 자기 자신 제거가 거부되는지 확인한다.
- 제거된 구성원이 만든 `baby_logs`와 `media_assets`가 삭제되지 않는지 확인한다.
- `npm run lint`, `npm run typecheck`, `npm test`를 실행한다.
- Supabase 계정/session/R2 object 보존은 수동 검증 체크리스트로 확인한다.
