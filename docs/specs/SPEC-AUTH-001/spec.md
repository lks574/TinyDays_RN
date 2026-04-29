# SPEC-AUTH-001: 앱 Supabase Auth 연결

상태: draft
생성일: 2026-04-29
도메인: AUTH

## 목적

PR-13에서 추가한 Supabase schema/RLS를 앱에서 사용할 준비를 위해 Supabase Auth client와 세션 상태 계층을 연결한다.

PR-14는 기존 `AsyncStorage` 기반 기록, 가족 context, 사진 저장 흐름을 원격 저장으로 바꾸지 않는다. 로그인 여부를 앱에서 확인하고, 이후 원격 가족 bootstrap과 `baby_logs` 백업이 사용할 인증 기반만 만든다.

## 요구사항

- R1 (Must): WHEN 앱이 시작되면, THE SYSTEM SHALL `EXPO_PUBLIC_SUPABASE_URL`과 `EXPO_PUBLIC_SUPABASE_ANON_KEY`로 Supabase client를 구성할 수 있어야 한다.
- R2 (Must): WHEN Supabase 환경 변수가 없으면, THE SYSTEM SHALL 앱의 기존 로컬 MVP 흐름을 중단하지 않고 설정 필요 상태를 표시한다.
- R3 (Must): WHEN Supabase client가 구성되어 있으면, THE SYSTEM SHALL 현재 Auth session을 읽고 세션 변경을 구독한다.
- R4 (Must): WHEN 사용자가 이메일과 비밀번호로 로그인하거나 가입하면, THE SYSTEM SHALL Supabase Auth API를 호출하고 session 상태를 갱신한다.
- R5 (Must): WHEN 사용자가 로그아웃하면, THE SYSTEM SHALL Supabase session을 종료하고 로컬 가족/기록 저장 흐름은 유지한다.
- R6 (Should): WHEN 가족 탭이 표시되면, THE SYSTEM SHALL 원격 계정 연결 상태와 기존 로컬 가족 context가 별도 상태임을 보여준다.

## 영향 범위

- 도메인: 없음.
- UI: `app/(tabs)/family.tsx`
- 저장소: Supabase Auth session storage는 `AsyncStorage`를 사용하되 기존 로컬 repository key와 분리한다.
- 문서: `docs/specs/SPEC-AUTH-001`, `docs/engineering/project-setup.md`, `docs/product/roadmaps/mvp-pr-roadmap.md`, `docs/product/next-task.md`

## 제외 범위

- 원격 `families`, `family_members`, `children` 생성.
- 기존 로컬 family context를 원격 ID로 교체.
- `baby_logs` 원격 백업 또는 sync queue.
- R2 signed URL 또는 사진 원격 업로드.
- 소셜 로그인.
- 비밀번호 재설정, 이메일 인증 UX 고도화.
- 서버 사이드 LLM 파싱.
