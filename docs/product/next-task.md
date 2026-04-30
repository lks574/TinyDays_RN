# 다음 작업

## 사진 삭제와 R2 정리

상태: 대기

이유:

- PR-19에서 사진 원격 업로드 실패 재시도 queue를 추가했다.
- 남은 사진 백엔드 리스크는 사용자가 사진을 삭제할 때 로컬 metadata, Supabase `media_assets`, R2 object 상태가 분리될 수 있다는 점이다.
- 실환경 Supabase/R2 검증은 `docs/specs/SPEC-PHOTO-004/manual-test.md`로 보류하고, 개발은 사진 lifecycle의 다음 필수 흐름인 삭제/정리로 이어간다.

예상 범위:

- 로컬 사진 metadata 삭제 경로를 추가한다.
- 원격 사진은 Supabase `media_assets.status = deleted`로 갱신한다.
- R2 object 삭제는 Edge Function에서 가족 권한 확인 후 처리한다.
- 원격 삭제 실패가 로컬 사진 목록 동작을 깨지 않게 한다.
- 실제 R2 object 삭제 실환경 검증은 별도 수동 검증으로 둔다.

바로 실행할 요청 예:

```txt
td:auto SPEC-PHOTO-006 사진 삭제와 R2 정리 진행해줘
```
