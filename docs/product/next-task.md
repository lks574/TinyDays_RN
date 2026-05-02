# 다음 작업

## `baby_logs` 원격 pull/downsync와 다중 기기 조회

상태: 대기

이유:

- SPEC-FAMILY-006에서 초대 취소와 구성원 제거 구현까지 완료했다.
- 현재 원격 백업은 새 기록을 Supabase `baby_logs`에 올리는 1차 흐름이지만, 다른 기기에서 원격 기록을 내려받아 보는 흐름은 아직 없다.
- 가족 공유가 실제로 유용해지려면 초대받은 구성원이 같은 가족의 기록 타임라인을 원격 기준으로 조회할 수 있어야 한다.
- `SPEC-PHOTO-006` 실환경 수동 검증은 나중에 Supabase/R2 환경 검증 작업으로 한꺼번에 수행한다. 체크리스트는 `docs/qa/manual-tests/`에 모은다.

예상 범위:

- 원격 `baby_logs` 조회 repository를 추가한다.
- 원격 family/child mapping이 있는 사용자가 같은 가족의 기록을 날짜 기준으로 조회할 수 있게 한다.
- 로컬 기록과 원격 기록의 중복 표시 정책을 정한다.
- 완전한 양방향 sync, conflict resolution, Expo SQLite 이전은 별도 후속 작업으로 둔다.

남은 백엔드 작업 체크:

- [x] 가족 구성원 목록 조회와 역할 표시를 원격 `family_members` 기준으로 보강.
- [x] 구성원 제거 또는 초대 취소 정책 확정.
- [x] SPEC-FAMILY-006 초대 취소와 구성원 제거 구현.
- [ ] `baby_logs` 원격 pull/downsync와 다중 기기 조회.
- [ ] `baby_logs`/사진 metadata의 Expo SQLite 이전과 sync queue 통합.
- [ ] 사진 signed URL 캐시와 만료 후 갱신.
- [ ] 사진 썸네일 생성과 파생 object lifecycle.
- [ ] 백그라운드 업로드/삭제 재시도와 R2 orphan 정리.
- [ ] Supabase/R2 실환경 수동 검증 묶음 수행. 가족 구성원 목록은 `docs/qa/manual-tests/SPEC-FAMILY-005.md` 기준으로 확인.

바로 실행할 요청 예:

```txt
td:plan baby_logs 원격 pull/downsync와 다중 기기 조회 정리해줘
```
