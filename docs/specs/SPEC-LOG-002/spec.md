# SPEC-LOG-002: 텍스트 기록과 파싱 확인 화면

상태: draft
생성일: 2026-04-28
도메인: LOG

## 목적

부모가 홈 화면에서 자연어 텍스트를 입력하면 앱이 룰 기반 파서로 기록 후보를 만들고, 사용자가 확인 또는 수정한 뒤 최근 타임라인에 저장할 수 있게 한다.

## 요구사항

- R1 (Must): WHEN 사용자가 홈 화면에서 텍스트 기록을 입력하면, THE SYSTEM SHALL 자연어 parser를 호출한다.
- R2 (Must): WHEN parser가 결과를 반환하면, THE SYSTEM SHALL 저장 전에 확인 UI를 표시한다.
- R3 (Must): WHEN 사용자가 확인 UI에서 기록 타입, 수치, 메모를 수정하면, THE SYSTEM SHALL 수정값을 저장 후보에 반영한다.
- R4 (Must): WHEN 사용자가 저장을 누르면, THE SYSTEM SHALL 로컬 타임라인에 기록을 추가한다.
- R5 (Must): WHEN parser confidence가 낮거나 자연어 입력 결과가 반환되면, THE SYSTEM SHALL 자동 저장하지 않는다.

## 영향 범위

- 도메인: `src/domain/parser`, `src/domain/baby-logs`
- UI/기능: `app/(tabs)/index.tsx`, `src/features/logging`
- 저장소: 없음
- 문서: PR 로드맵, 다음 작업 문서

## 제외 범위

- 음성 입력
- 영구 저장소
- 서버 사이드 LLM
- 별도 상세 편집 화면
