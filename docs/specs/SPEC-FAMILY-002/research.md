# 리서치

## 기존 문서

- `docs/design/prototype/README.md`: 프로토타입은 화면 구조, 토큰, 카피, 상호작용 흐름 기준으로만 사용하고 기존 TypeScript 저장소/도메인 로직을 유지하라고 명시한다.
- `docs/design/prototype/screens-other.jsx`: 가족 화면은 가족 정보, 등록된 아기, 구성원, 대기 초대, 비공개 안내 섹션을 제공한다.
- `docs/architecture/decisions.md`: PR-11 가족과 아기 최소 모델은 로컬 `family context`로 시작하고 실제 초대/인증/다중 기기 접근 제어는 구현하지 않는다.

## 기존 코드

- `app/(tabs)/family.tsx`: 로컬 `family context`를 불러와 가족 이름, 아기 이름, 생년월일을 편집하고 저장한다.
- `src/shared/ui`: `ScreenHeader`, `Section`, `Field`, `Button`, `Badge`, `ListRow` 등 React Native 디자인 시스템 컴포넌트가 있다.
- `src/domain/family`: `parent`, `family` 역할과 선택된 아기/D+ 계산 helper를 제공한다.

## 결정

- 가족 탭은 프로토타입의 시각 구조를 따르되 실제 초대, 구성원 제거, 권한 변경은 열지 않는다.
- MVP 로컬 모델과 맞게 현재 구성원 1명과 선택된 아기 1명을 표시한다.
- 입력/저장 동작은 기존 구현을 유지한다.

## 리스크

- 프로토타입에는 `guardian`, `caregiver` 역할이 있으나 앱 도메인은 `parent`, `family`만 허용한다. 이식 시 도메인 역할만 표시해야 한다.
- 가족 정보는 민감 데이터이므로 공개 공유나 외부 전송 UI로 연결하지 않는다.
