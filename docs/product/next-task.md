# 다음 작업

## PR-17 R2 기반 사진 원격 저장 1차

상태: 대기

이유:

- PR-16에서 기존 로컬 기록 흐름을 유지하면서 `baby_logs`를 Supabase에 백업하는 첫 경로를 만들었다.
- 원격 저장 실패는 최소 queue에 남기고 빠른 기록 흐름을 막지 않는다.
- `npm run lint`, `npm run typecheck`, `npm test`가 통과했다.
- 다음 단계는 가족 사진을 private R2 bucket에 저장하고 Supabase에는 `media_assets` metadata만 남기는 1차 원격 사진 저장 경로를 만드는 것이다.

바로 실행할 요청 예:

```txt
td:spec PR-17 R2 기반 사진 원격 저장 1차 명세 작성해줘
```

후속 실행 예:

```txt
td:auto PR-17
```
