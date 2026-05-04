# SPEC-CORE-001: Expo SQLite 로컬 저장소와 sync queue 통합

상태: draft
생성일: 2026-05-04
도메인: CORE

## 목적

`baby_logs`, 사진 metadata, 원격 동기화 queue를 Expo SQLite 기반 로컬 저장소로 이전해 날짜별 조회, 수정/삭제, 재시도 queue의 기반을 정리한다.

## 요구사항

- R1 (Must): WHEN 앱이 `baby_logs`를 저장하거나 조회하면, THE SYSTEM SHALL Expo SQLite `baby_logs` 테이블을 기본 저장소로 사용한다.
- R2 (Must): WHEN 앱이 사진 metadata를 저장, 조회, 삭제하면, THE SYSTEM SHALL Expo SQLite `baby_photo_metadata` 테이블을 기본 저장소로 사용한다.
- R3 (Must): WHEN 원격 기록 백업 또는 사진 업로드가 실패하면, THE SYSTEM SHALL 단일 Expo SQLite `sync_queue` 테이블에 queue type별 item을 저장한다.
- R4 (Must): WHEN 기존 AsyncStorage 데이터가 있고 SQLite 테이블이 비어 있으면, THE SYSTEM SHALL 유효한 기존 records를 SQLite로 가져온다.
- R5 (Must): WHEN SQLite 저장소가 유효하지 않은 legacy JSON을 만나면, THE SYSTEM SHALL 앱 흐름을 중단하지 않고 빈 목록으로 복구한다.

## 영향 범위

- 도메인: `BabyLog`, `BabyPhoto`
- UI: 홈, 기록, 인사이트, 사진 탭의 repository 사용 경로 유지
- 저장소: Expo SQLite `tinydays.db`
- 문서: `decisions.md`, `project-setup.md`, PR 로드맵

## 제외 범위

- Supabase downsync 영구 저장과 충돌 해결
- 백그라운드 자동 동기화
- R2 orphan 정리
- 가족/아기 context와 remote mapping의 SQLite 이전
