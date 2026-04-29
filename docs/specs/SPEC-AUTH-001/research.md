# 리서치

## 기존 문서

- `docs/product/mvp-scope.md`: 회원가입 및 로그인은 MVP 필수 기능이다.
- `docs/architecture/decisions.md`: ADR-010은 Supabase Auth/Postgres/RLS를 최종 서버 기준으로 채택했다.
- `docs/engineering/project-setup.md`: PR-13은 Supabase schema/RLS까지만 추가했고 앱 로그인 UI와 `@supabase/supabase-js`는 제외했다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-14는 앱 Supabase Auth client와 세션 계층 연결이며, 기존 로컬 기록 저장 흐름은 유지한다.
- `docs/product/next-task.md`: 다음 작업은 PR-14 앱 Supabase Auth 연결이다.

## 기존 코드

- `app/_layout.tsx`: 앱 root layout이며 URL polyfill import 위치로 적합하다.
- `app/(tabs)/family.tsx`: 가족 설정과 구성원 정보를 보여주며 원격 계정 상태 패널을 붙일 위치다.
- `src/features/family/local-family-context-repository.ts`: 로컬 family context 저장소이며 PR-14에서 교체하지 않는다.
- `src/features/logging/local-baby-log-repository.ts`: 로컬 `baby_logs` 저장소이며 PR-14에서 교체하지 않는다.
- `src/features/photos/local-baby-photo-repository.ts`: 로컬 사진 metadata 저장소이며 PR-14에서 교체하지 않는다.

## 결정

- Supabase 환경 변수는 Expo public env인 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`를 사용한다.
- Supabase Auth session persistence는 기존 `AsyncStorage`를 사용한다.
- 환경 변수가 없으면 앱은 원격 계정 비활성 상태로 동작한다.
- PR-14에서는 원격 가족 생성이나 로컬 ID 매핑을 하지 않는다.
- 가족 탭은 로컬 가족 context와 원격 계정 상태가 분리되어 있음을 표시한다.

## 리스크

- anon key는 클라이언트에 포함되는 공개 키이지만, service role key를 잘못 넣으면 심각한 권한 노출이 된다.
- 실제 Supabase project URL/key가 없으면 로그인 API는 검증할 수 없으므로 missing config 경로와 client 구성 단위 테스트를 우선한다.
- React Native에서 Supabase URL 처리에 `react-native-url-polyfill`이 필요하므로 앱 entry import 순서가 중요하다.
- PR-15에서 원격 가족 bootstrap을 붙이기 전까지 로그인한 사용자와 로컬 `current_member`는 같은 개념이 아니다.
