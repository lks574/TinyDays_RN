# 다음 작업

## PR-15 원격 가족과 아기 bootstrap

상태: 대기

이유:

- PR-14에서 앱 Supabase Auth client, session 구독, 이메일 로그인/가입/로그아웃 흐름을 연결했다.
- PR-14 변경사항은 검증과 커밋까지 완료됐다.
- 다음 백엔드 단계는 로그인한 사용자를 원격 `families`, `family_members`, `children` 구조와 연결하는 것이다.
- 기존 로컬 ID와 원격 UUID 매핑 전략을 먼저 명확히 해야 한다.

바로 실행할 요청 예:

```txt
td:spec PR-15 원격 가족과 아기 bootstrap 명세 작성해줘
```

후속 실행 예:

```txt
td:exec PR-15 원격 가족과 아기 bootstrap 구현해줘
```
