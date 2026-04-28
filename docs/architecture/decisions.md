# 아키텍처 결정 기록

이 문서는 구현 방향을 좌우하는 제품 및 엔지니어링 결정을 기록합니다. 프로젝트 구조, 데이터 모델, 백엔드 설계, 플랫폼 방향에 영향을 주는 결정을 내릴 때 새 항목을 추가합니다.

## ADR-001: React Native 모바일 우선

상태: 채택

첫 번째 제품 표면은 React Native 모바일 앱입니다. 아기 돌봄 기록은 실시간으로 발생하며 보통 휴대폰에서 입력됩니다. 음성 인식, 카메라 접근, 이미지 업로드, 알림, 향후 Siri 연동 같은 모바일 기능이 제품의 중심입니다.

React Web은 이후 가족 조회와 관리에 적합한 대시보드로 둡니다.

## ADR-002: 초기 세팅은 Expo 우선

상태: 채택

필수 네이티브 기능이 Expo Dev Client 또는 Bare React Native를 요구하기 전까지는 Expo + TypeScript로 모바일 앱을 시작합니다.

근거:

- MVP 세팅 속도가 빠릅니다.
- iOS, Android, 웹 실험을 한 구조에서 시작할 수 있습니다.
- 에셋, 권한, 빌드 흐름이 단순합니다.
- 이후 네이티브 모듈이 필요해지면 Dev Client로 확장할 수 있습니다.

초기 기술 기준:

- 런타임: Node 22 LTS.
- 패키지 매니저: npm.
- 앱 프레임워크: Expo SDK 54.
- UI 런타임: React Native 0.81, React 19.
- 언어: TypeScript 5.9.
- 검증: ESLint 9, Jest 29, `jest-expo` 54.

버전의 세부 범위는 `package.json`과 `docs/engineering/project-setup.md`를 기준으로 확인합니다. Expo 관련 패키지는 `npx expo install --check`가 통과하는 조합을 유지합니다.

선택 이유:

- Node는 최신 비-LTS보다 LTS가 Expo와 React Native 개발 환경에서 재현성이 좋습니다.
- npm은 초기 저장소에 `package-lock.json`을 만들었고, MVP 단계에서 별도 패키지 매니저 도입 비용을 만들 필요가 없습니다.
- Expo, React Native, React, TypeScript 버전은 `create-expo-app`의 TypeScript 템플릿과 Expo SDK 54 호환 조합을 따릅니다.
- ESLint와 `eslint-config-expo`, Jest와 `jest-expo`는 Expo SDK 54에서 `npx expo install --check`가 통과하는 조합을 기준으로 둡니다.
- 버전 업그레이드는 개별 패키지를 임의로 올리기보다 Expo SDK 업그레이드 단위로 검토합니다.

## ADR-003: 초기 백엔드 후보는 Supabase

상태: 제안

인증, PostgreSQL, Storage, Row Level Security, Edge Functions를 위해 Supabase를 초기 백엔드 후보로 둡니다.

근거:

- MVP 개발 속도가 빠릅니다.
- PostgreSQL은 가족 단위 데이터와 타임라인 쿼리에 적합합니다.
- Storage로 사진과 이후 생성 영상을 관리할 수 있습니다.
- RLS는 `family_members` 기반 접근 제어와 잘 맞습니다.

## ADR-004: MVP에서는 통합 Baby Log 테이블 사용

상태: 채택

MVP에서는 수유, 수면, 기저귀, 약 등 기록별 테이블을 분리하지 않고 하나의 `baby_logs` 테이블로 시작합니다.

근거:

- 타임라인 렌더링이 단순합니다.
- 자연어 파서 결과를 균일하게 저장할 수 있습니다.
- 시간순 기록을 기반으로 분석을 시작하기 쉽습니다.
- 제품 검증 단계에서 스키마 복잡도를 낮출 수 있습니다.

초기 필드:

```txt
id
child_id
family_id
created_by
log_type
recorded_at
amount
unit
memo
source: manual | quick_button | voice | siri | imported
original_text
confidence
created_at
updated_at
```

## ADR-005: 서버 AI보다 룰 기반 파서를 먼저 사용

상태: 채택

MVP에서는 서버 사이드 AI 대신 앱 내부 룰 기반 자연어 파서를 사용합니다.

근거:

- 비용이 낮습니다.
- 개인정보 보호 측면에서 유리합니다.
- 한국어 육아 기록의 자주 쓰는 표현을 빠르게 개선할 수 있습니다.
- 초기 문장 집합은 결정적 파싱으로 충분히 다룰 수 있습니다.

특히 음성 입력이나 낮은 confidence 결과는 저장 전에 사용자 확인을 받아야 합니다.

## ADR-006: 가족 단위 개인정보 모델

상태: 채택

아기 기록, 사진, 영상, 댓글은 모두 `family_id`로 범위를 제한합니다. 사용자는 가족 구성원 자격을 통해 아기 데이터에 접근합니다.

초기 역할:

- `parent`: 기록 생성/수정, 사진 업로드, 초대, 아기 프로필 관리 가능.
- `family`: 타임라인, 사진, 영상 조회 가능. 이후 댓글 또는 반응 가능.

## ADR-007: PR-07 기록 저장소는 AsyncStorage로 시작

상태: 채택

PR-07에서는 빠른 기록과 자연어 기록으로 생성한 `BabyLog`를 `AsyncStorage`에 로컬 저장합니다. 현재 목표는 서버 계정, 가족 권한, 원격 동기화가 아니라 앱 재시작 후에도 핵심 기록 루프가 유지되는지 검증하는 것입니다.

근거:

- 로컬 기기 저장은 초기 운영 비용이 낮습니다.
- 아기 기록과 건강 관련 메모를 서버로 보내지 않아 개인정보 노출면이 작습니다.
- 현재 홈 화면은 최근 기록 표시 중심이므로 key-value 저장소로 충분합니다.
- repository interface를 먼저 두면 이후 SQLite 또는 Supabase로 전환할 때 UI 변경을 줄일 수 있습니다.

제약:

- 앱 삭제, 기기 분실, 다중 기기 동기화는 해결하지 않습니다.
- 날짜별 조회, 분석, 가족 공유가 본격화되면 SQLite 또는 Supabase 전환을 다시 검토합니다.
- ADR-003의 Supabase 후보는 유지하되, 인증과 가족 모델을 구현하는 PR에서 채택 여부를 다시 확정합니다.
