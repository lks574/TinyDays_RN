# 다음 작업

## PR-14 앱 Supabase Auth 연결

상태: 대기

이유:

- PR-13에서 Supabase local project, 핵심 schema, `family_id` 기준 RLS, seed, RLS smoke test를 추가했다.
- PostgreSQL 15 임시 DB에서 migration, RLS smoke test, seed 적용을 실제 검증했다.
- 다음 백엔드 단계는 앱에 Supabase Auth client와 세션 계층을 붙이는 것이다.
- 기존 `AsyncStorage` 기반 기록, 가족 context, 사진 흐름은 PR-14에서도 유지해야 한다.

바로 실행할 요청 예:

```txt
td:spec PR-14 앱 Supabase Auth 연결 명세 작성해줘
```

후속 실행 예:

```txt
td:exec PR-14 Supabase Auth 연결 구현해줘
```
