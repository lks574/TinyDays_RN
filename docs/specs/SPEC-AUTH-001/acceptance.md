# 수락 기준

## AC-001 (P0): 환경 변수 기반 client 준비

- Given: `EXPO_PUBLIC_SUPABASE_URL`과 `EXPO_PUBLIC_SUPABASE_ANON_KEY`가 있다.
- When: 앱이 Supabase 설정을 읽는다.
- Then: Supabase client를 만들 수 있는 configured 상태가 된다.

## AC-002 (P0): 환경 변수 누락 시 로컬 흐름 유지

- Given: Supabase 환경 변수가 없다.
- When: 가족 탭을 연다.
- Then: 원격 계정 설정 필요 상태가 표시되고 기존 로컬 가족 정보는 계속 표시된다.

## AC-003 (P0): session 상태 조회

- Given: Supabase client가 구성되어 있다.
- When: Auth hook이 초기화된다.
- Then: 현재 session을 조회하고 auth state 변경을 구독한다.

## AC-004 (P0): 이메일 로그인과 가입 호출

- Given: 사용자가 이메일과 비밀번호를 입력했다.
- When: 로그인 또는 가입 버튼을 누른다.
- Then: Supabase Auth email/password API가 호출되고 결과 메시지가 표시된다.

## AC-005 (P0): 로그아웃

- Given: Supabase session이 있다.
- When: 사용자가 로그아웃한다.
- Then: Supabase session이 종료되고 로컬 가족 context는 삭제되지 않는다.

## AC-006 (P1): 기존 MVP 저장 흐름 보존

- Given: 사용자가 로그인하지 않았다.
- When: 가족 정보를 수정하거나 기록/사진 탭을 사용한다.
- Then: 기존 `AsyncStorage` 기반 로컬 흐름이 계속 동작한다.
