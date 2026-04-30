# 다음 작업

## PR-16 `baby_logs` 클라우드 백업 1차

상태: 대기

이유:

- PR-15에서 로그인 사용자가 원격 가족, 아기, 본인 `parent` 구성원을 만들 수 있게 했다.
- 로컬 ID와 원격 UUID는 별도 local-to-remote mapping record로 저장된다.
- `npm run lint`, `npm run typecheck`, `npm test`가 통과했다.
- `supabase db reset`과 `supabase/tests/rls_smoke.sql` 검증도 통과했다.
- 다음 단계는 기존 로컬 기록 흐름을 유지하면서 `baby_logs`를 원격으로 백업하는 첫 동기화 경로를 만드는 것이다.

바로 실행할 요청 예:

```txt
td:spec PR-16 baby_logs 클라우드 백업 1차 명세 작성해줘
```

후속 실행 예:

```txt
td:exec PR-16 baby_logs 클라우드 백업 1차 구현해줘
```
