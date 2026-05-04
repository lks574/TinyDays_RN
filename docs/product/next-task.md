# 다음 작업

## `baby_logs`/사진 metadata의 Expo SQLite 이전과 sync queue 통합

상태: 대기

이유:

- SPEC-LOG-006에서 `baby_logs` 원격 read-through downsync와 다중 기기 조회 1차를 추가했다.
- 현재 로컬 기록, 사진 metadata, 원격 백업 queue가 모두 `AsyncStorage`에 분산되어 있다.
- 수정/삭제 downsync, 원격-only 과거 날짜 발견, 중복 방지 강화를 하려면 날짜별 조회와 sync queue에 맞는 로컬 DB 구조가 필요하다.
- `SPEC-PHOTO-006` 실환경 수동 검증은 나중에 Supabase/R2 환경 검증 작업으로 한꺼번에 수행한다. 체크리스트는 `docs/qa/manual-tests/`에 모은다.

예상 범위:

- `baby_logs`와 사진 metadata의 현재 `AsyncStorage` schema를 정리한다.
- Expo SQLite 도입 범위와 migration 전략을 SPEC으로 먼저 확정한다.
- sync queue를 기록/사진 공통 패턴으로 통합할지 판단한다.
- 기존 local-first 저장 흐름과 Supabase/R2 실패 격리 정책은 유지한다.

남은 백엔드 작업 체크:

- [x] 가족 구성원 목록 조회와 역할 표시를 원격 `family_members` 기준으로 보강.
- [x] 구성원 제거 또는 초대 취소 정책 확정.
- [x] SPEC-FAMILY-006 초대 취소와 구성원 제거 구현.
- [x] `baby_logs` 원격 pull/downsync와 다중 기기 조회.
- [ ] `baby_logs`/사진 metadata의 Expo SQLite 이전과 sync queue 통합.
- [ ] 사진 signed URL 캐시와 만료 후 갱신.
- [ ] 사진 썸네일 생성과 파생 object lifecycle.
- [ ] 백그라운드 업로드/삭제 재시도와 R2 orphan 정리.
- [ ] Supabase/R2 실환경 수동 검증 묶음 수행. 가족 구성원 목록은 `docs/qa/manual-tests/SPEC-FAMILY-005.md` 기준으로 확인.

바로 실행할 요청 예:

```txt
td:plan baby_logs/사진 metadata Expo SQLite 이전과 sync queue 통합 정리해줘
```
