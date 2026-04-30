# 다음 작업

## 가족 구성원 목록 조회와 역할 표시

상태: 대기

이유:

- SPEC-FAMILY-004에서 가족 초대 코드 생성과 수락 흐름을 추가했다.
- 가족 탭의 구성원 영역은 아직 로컬 현재 사용자 1명만 표시한다.
- 초대 수락 후 실제 가족 공유 상태를 확인하려면 원격 `family_members` 목록을 읽어 역할과 구성원을 표시해야 한다.
- `SPEC-PHOTO-006` 실환경 수동 검증은 나중에 Supabase/R2 환경 검증 작업으로 한꺼번에 수행한다.

예상 범위:

- 원격 family mapping이 있으면 `family_members`를 조회한다.
- 가족 탭 구성원 목록을 원격 구성원 기준으로 표시한다.
- 현재 사용자와 `parent`/`family` 역할을 구분해 보여준다.
- 원격 조회 실패가 기존 로컬 가족 정보 표시를 막지 않게 한다.
- 기존 로컬 family context와 기록/사진 local-first 흐름은 깨지지 않게 유지한다.

남은 백엔드 작업 체크:

- [ ] 가족 구성원 목록 조회와 역할 표시를 원격 `family_members` 기준으로 보강.
- [ ] 구성원 제거 또는 초대 취소 정책 확정.
- [ ] `baby_logs` 원격 pull/downsync와 다중 기기 조회.
- [ ] `baby_logs`/사진 metadata의 Expo SQLite 이전과 sync queue 통합.
- [ ] 사진 signed URL 캐시와 만료 후 갱신.
- [ ] 사진 썸네일 생성과 파생 object lifecycle.
- [ ] 백그라운드 업로드/삭제 재시도와 R2 orphan 정리.
- [ ] Supabase/R2 실환경 수동 검증 묶음 수행.

바로 실행할 요청 예:

```txt
td:auto SPEC-FAMILY-005 가족 구성원 목록 조회와 역할 표시 진행해줘
```
