# 구현 계획

## 태스크

- [x] T1: Supabase Auth 의존성과 React Native URL polyfill을 추가한다.
- [x] T2: Expo public env 기반 Supabase config parser를 작성하고 단위 테스트를 추가한다.
- [x] T3: `AsyncStorage` 기반 Supabase client singleton을 작성한다.
- [x] T4: session 조회, auth state 구독, email/password sign in, sign up, sign out hook을 작성한다.
- [x] T5: 가족 탭에 원격 계정 상태 패널을 추가한다.
- [x] T6: 환경 변수 예시와 세팅 문서를 업데이트한다.
- [x] T7: PR-14 상태와 다음 작업 문서를 업데이트한다.
- [x] T8: `lint`, `typecheck`, `test`를 실행한다.

## 구현 순서

1. `@supabase/supabase-js`와 `react-native-url-polyfill`을 설치한다.
2. 앱 entry에서 URL polyfill을 먼저 import한다.
3. Supabase 환경 변수를 읽는 순수 함수를 만든다.
4. 환경 변수가 없으면 client를 만들지 않고 설정 필요 상태를 반환한다.
5. Auth hook은 client가 있을 때만 session 조회와 auth 구독을 수행한다.
6. 가족 탭에 이메일/비밀번호 입력, 로그인, 가입, 로그아웃, 현재 계정 표시를 추가한다.
7. 기존 family context 저장/표시 UI는 변경하지 않는다.

## 테스트 계획

- Supabase config parser 단위 테스트.
- 환경 변수가 없을 때 missing config 상태를 반환하는지 테스트.
- `npm run lint`
- `npm run typecheck`
- `npm test`
