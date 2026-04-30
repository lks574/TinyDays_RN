# 다음 작업

## 원격 사진 실환경 검증

상태: 대기

이유:

- PR-18까지 로드맵의 원격 사진 조회 URL 연결을 코드와 단위 테스트로 완료했다.
- 남은 핵심 리스크는 배포된 Supabase Edge Function, R2 환경 변수, 실제 Auth session/family mapping 조합에서 signed download URL이 정상 동작하는지 확인하는 것이다.
- 이 검증이 끝나야 사진 원격 저장/조회 루프를 가족 공유 기능의 안정된 기반으로 볼 수 있다.

검증 범위:

- 로그인한 `parent`가 사진을 업로드하면 R2 원본 저장과 `media_assets.status = uploaded` 갱신이 완료되는지 확인한다.
- 같은 가족 구성원이 사진 탭에서 원격 사진을 signed download URL로 볼 수 있는지 확인한다.
- 가족 구성원이 아닌 사용자가 `media_assets` 조회 또는 download URL 발급을 받을 수 없는지 확인한다.
- 원격 조회 실패 시 기존 로컬 사진 목록이 계속 표시되는지 확인한다.

바로 실행할 요청 예:

```txt
td:validate 원격 사진 실환경 검증 체크리스트 실행해줘
```
