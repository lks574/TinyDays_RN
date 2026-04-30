# SPEC-LOG-005: baby_logs 클라우드 백업 1차

상태: draft
생성일: 2026-04-30
도메인: LOG

## 목적

기존 로컬 기록 저장 흐름을 유지하면서 로그인 및 원격 가족 연결이 준비된 경우 새 `BabyLog`를 Supabase `baby_logs`에 백업한다.

## 요구사항

- R1 (Must): WHEN 사용자가 빠른 기록 또는 텍스트 기록을 저장하면, THE SYSTEM SHALL 로컬 `AsyncStorage` 저장을 먼저 완료한다.
- R2 (Must): WHEN Supabase session과 원격 family mapping이 있으면, THE SYSTEM SHALL 로컬 `BabyLog`를 원격 `family_id`, `child_id`, `created_by`로 변환해 `baby_logs`에 insert한다.
- R3 (Must): WHEN 원격 저장이 실패하면, THE SYSTEM SHALL 빠른 기록 흐름을 실패시키지 않고 재시도 가능한 queue item으로 남긴다.
- R4 (Must): WHEN queue item 재시도가 성공하면, THE SYSTEM SHALL 해당 item을 queue에서 제거한다.
- R5 (Should): WHEN Supabase 설정, session, mapping 중 하나가 없으면, THE SYSTEM SHALL 기존 로컬 기록 흐름을 유지하고 원격 백업을 건너뛴다.

## 영향 범위

- 도메인: `src/domain/baby-logs`
- UI: 홈 기록 저장 흐름의 상태 메시지
- 저장소: `AsyncStorage` 기반 최소 sync queue, Supabase `baby_logs`
- 문서: PR 로드맵, 다음 작업 문서

## 제외 범위

- 다중 기기 양방향 동기화.
- 충돌 해결.
- 기존 로컬 기록 전체 backfill.
- SQLite 이전.
- 서버 사이드 LLM 파싱.
