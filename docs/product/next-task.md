# 다음 작업

## 구성원 제거 또는 초대 취소 정책 확정

상태: 대기

이유:

- SPEC-FAMILY-004에서 가족 초대 코드 생성과 수락 흐름을 추가했다.
- SPEC-FAMILY-005에서 원격 `family_members` 기준 구성원 목록과 역할 표시를 보강했다.
- 가족 탭에서 실제 구성원을 볼 수 있게 되었으므로, 구성원 제거와 초대 취소/재발급을 구현하기 전에 권한과 데이터 보존 정책을 먼저 정해야 한다.
- 구성원 제거는 가족 데이터 접근 권한, 기존 기록의 `created_by`, 사진/로그 소유 표시와 연결되므로 바로 구현하기보다 SPEC으로 정책을 확정한다.
- `SPEC-PHOTO-006` 실환경 수동 검증은 나중에 Supabase/R2 환경 검증 작업으로 한꺼번에 수행한다. 체크리스트는 `docs/qa/manual-tests/`에 모은다.

예상 범위:

- `parent`만 구성원 제거와 초대 취소/재발급을 할 수 있는지 정책을 확정한다.
- 마지막 `parent` 제거를 금지할지 결정한다.
- 제거된 구성원이 만든 기존 `baby_logs`, 사진 metadata, media object를 보존할지 삭제할지 결정한다.
- 수락 전 초대 코드 취소, 만료, 재발급 UX 범위를 정한다.
- 정책 결정이 끝나면 후속 구현 SPEC을 작성한다.

남은 백엔드 작업 체크:

- [x] 가족 구성원 목록 조회와 역할 표시를 원격 `family_members` 기준으로 보강.
- [ ] 구성원 제거 또는 초대 취소 정책 확정.
- [ ] `baby_logs` 원격 pull/downsync와 다중 기기 조회.
- [ ] `baby_logs`/사진 metadata의 Expo SQLite 이전과 sync queue 통합.
- [ ] 사진 signed URL 캐시와 만료 후 갱신.
- [ ] 사진 썸네일 생성과 파생 object lifecycle.
- [ ] 백그라운드 업로드/삭제 재시도와 R2 orphan 정리.
- [ ] Supabase/R2 실환경 수동 검증 묶음 수행. 가족 구성원 목록은 `docs/qa/manual-tests/SPEC-FAMILY-005.md` 기준으로 확인.

바로 실행할 요청 예:

```txt
td:plan 구성원 제거와 초대 취소 정책 정리해줘
```
