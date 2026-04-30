# 다음 작업

## SPEC-FAMILY-004 가족 초대와 구성원 연결 1차

상태: 대기

이유:

- MVP 필수 기능에 `가족 구성원 초대`가 남아 있다.
- 현재 백엔드는 원격 가족 bootstrap, `family_members` RLS, `parent`/`family` 역할까지 준비되어 있지만, 다른 사용자가 가족에 합류하는 안전한 초대 경로는 없다.
- 기록 백업, 사진 R2 저장/조회/삭제는 원격 family mapping을 전제로 하므로 가족 구성원 합류 경로를 먼저 닫아야 실제 가족 공유 검증으로 넘어갈 수 있다.
- `SPEC-PHOTO-006` 실환경 수동 검증은 나중에 Supabase/R2 환경 검증 작업으로 한꺼번에 수행한다.

예상 범위:

- Supabase에 가족 초대용 최소 모델을 추가한다.
  - 예: `family_invites` 또는 `invite_code` 기반 RPC.
- `parent`만 초대를 만들 수 있게 RLS/RPC 권한을 제한한다.
- 초대 수락 시 authenticated 사용자를 해당 `family_members`에 `family` 역할로 추가한다.
- 앱은 초대 코드 입력 또는 수락 경로로 원격 family/child/member mapping을 저장한다.
- 기존 로컬 family context와 기록/사진 local-first 흐름은 깨지지 않게 유지한다.
- 초대 취소, 만료, 재발급, 멤버 제거 고도화는 필요한 경우 후속 작업으로 분리한다.

남은 백엔드 작업 체크:

- [ ] 가족 초대/구성원 연결 1차.
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
td:auto SPEC-FAMILY-004 가족 초대와 구성원 연결 1차 진행해줘
```
