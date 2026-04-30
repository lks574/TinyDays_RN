# 수락 기준

## AC-001 (P0): 로컬 우선 저장

- Given: 사용자가 빠른 기록 또는 텍스트 기록을 만든다.
- When: 저장을 누른다.
- Then: 앱은 먼저 로컬 `BabyLogRepository.saveLog`를 완료하고 화면 타임라인에 반영한다.

## AC-002 (P0): 원격 백업 성공

- Given: Supabase session과 원격 family mapping이 있다.
- When: 새 기록이 로컬 저장에 성공한다.
- Then: 앱은 Supabase `baby_logs`에 원격 UUID 기준 row를 insert한다.

## AC-003 (P0): 원격 실패 비차단

- Given: 로컬 저장은 성공했지만 Supabase insert가 실패한다.
- When: 저장 흐름이 완료된다.
- Then: 앱은 로컬 기록을 유지하고 실패한 원격 백업을 queue에 남긴다.

## AC-004 (P1): queue 재시도

- Given: 실패한 원격 백업 queue item이 있다.
- When: 이후 원격 백업 경로가 다시 실행되고 Supabase insert가 성공한다.
- Then: 앱은 성공한 queue item을 삭제한다.

## AC-005 (P1): 원격 준비 전 로컬 흐름 유지

- Given: Supabase 설정, session, 원격 mapping 중 하나가 없다.
- When: 사용자가 기록을 저장한다.
- Then: 앱은 원격 백업을 건너뛰고 기존 로컬 저장 흐름을 유지한다.
