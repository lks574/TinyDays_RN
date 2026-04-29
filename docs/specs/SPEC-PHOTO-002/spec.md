# SPEC-PHOTO-002: 사진 화면 디자인 시스템 프로토타입 적용

상태: draft
생성일: 2026-04-29
도메인: PHOTO

## 목적

기존 사진 탭의 업로드와 날짜별 목록 흐름은 유지하되, 앱 공통 디자인 시스템과 `docs/design/prototype`의 사진 화면 패턴을 적용해 MVP 검증용 화면 품질을 높인다.

## 요구사항

- R1 (Must): WHEN 사용자가 사진 탭을 열면, THE SYSTEM SHALL 공통 `theme`와 `src/shared/ui` 컴포넌트를 사용해 헤더, 버튼, 필터, 빈 상태를 렌더링한다.
- R2 (Must): WHEN 사진이 저장되어 있으면, THE SYSTEM SHALL 선택된 아기의 사진을 날짜별 3열 그리드로 표시한다.
- R3 (Should): WHEN 사용자가 기간 필터를 선택하면, THE SYSTEM SHALL 전체, 오늘, 최근 7일, 이번 달 기준으로 사진 그룹을 좁혀 보여준다.
- R4 (Must): WHEN 사진 탭이 표시되면, THE SYSTEM SHALL 가족 내부 비공개 사진이라는 상태를 UI에서 명확히 보여준다.

## 영향 범위

- 도메인: 없음.
- UI: `app/(tabs)/photos.tsx`
- 저장소: 없음.
- 문서: `docs/specs/SPEC-PHOTO-002`

## 제외 범위

- 사진 이벤트/마일스톤 데이터 모델 추가.
- 사진 삭제, 편집, 상세 화면.
- Supabase Storage, 원격 동기화, 공개 공유.
