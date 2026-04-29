# 리서치

## 기존 문서

- `docs/product/mvp-scope.md`: 사진 탭은 날짜별 사진 타임라인과 업로드 진입점을 포함한다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-12는 사진 탭, 날짜별 사진 목록, 업로드 진입점이 범위다.
- `docs/design/prototype/screens-other.jsx`: 사진 화면은 privacy pill, 사진 추가 버튼, 기간 필터, 날짜별 3열 그리드 패턴을 사용한다.

## 기존 코드

- `app/(tabs)/photos.tsx`: 사진 선택, 로컬 메타데이터 저장, 날짜별 목록 표시가 이미 구현되어 있다.
- `src/shared/ui/design-system.tsx`: `ScreenHeader`, `Button`, `Chip`, `Badge`, `EmptyState`, text primitives를 제공한다.
- `src/domain/photos/photo.ts`: 날짜별 사진 그룹과 최신순 정렬 helper를 제공한다.

## 결정

- 새 저장소나 사진 데이터 모델은 추가하지 않는다.
- 이벤트/마일스톤 필터는 별도 데이터 모델이 필요하므로 이번 프로토타입 적용에서 제외한다.
- 기간 필터는 화면 상태와 기존 날짜 그룹만 사용해 구현한다.

## 리스크

- 로컬 URI 기반 사진 보존 한계는 PR-12의 기존 제약과 동일하다.
- 실제 이미지가 없는 상태에서는 그리드 밀도만 확인 가능하며, 상세 보기 UX는 별도 작업이 필요하다.
