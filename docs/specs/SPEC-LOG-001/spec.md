# SPEC-LOG-001: 빠른 기록 UI

상태: draft
생성일: 2026-04-28
도메인: LOG

## 목적

부모가 홈 화면에서 버튼 한 번으로 주요 육아 기록 후보를 만들고 최근 타임라인에서 즉시 확인할 수 있게 한다.

## 요구사항

- R1 (Must): WHEN 사용자가 홈 화면을 열면, THE SYSTEM SHALL 수유, 수면, 기저귀, 체온, 목욕, 메모 빠른 기록 진입점을 보여준다.
- R2 (Must): WHEN 사용자가 빠른 기록 버튼을 누르면, THE SYSTEM SHALL `quick_button` source의 임시 `BabyLog`를 생성한다.
- R3 (Must): WHEN 기록이 생성되면, THE SYSTEM SHALL 최근 타임라인 영역에 최신순으로 표시한다.
- R4 (Must): WHEN PR-05가 구현되면, THE SYSTEM SHALL 서버 저장소나 영구 저장소를 도입하지 않는다.

## 영향 범위

- 도메인: `src/domain/baby-logs`
- UI/기능: `app/(tabs)/index.tsx`, `src/features/logging`
- 저장소: 없음
- 문서: PR 로드맵, 다음 작업 문서

## 제외 범위

- 텍스트 자연어 입력 연결
- 파싱 결과 확인 화면
- 앱 재시작 후 기록 유지
- Supabase 또는 로컬 영구 저장소
