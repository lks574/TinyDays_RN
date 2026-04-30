# 구현 계획

## 태스크

- [x] T1: 사진 삭제 SPEC과 수락 기준을 작성한다.
- [x] T2: 로컬 사진 repository에 `deletePhoto`를 추가한다.
- [x] T3: 원격 사진 삭제 repository/service를 추가한다.
- [x] T4: 사진 탭에 삭제 확인 UI와 상태 메시지를 연결한다.
- [x] T5: `media-r2-url` Edge Function에 R2 `DELETE`와 `media_assets.status = deleted` 갱신 action을 추가한다.
- [x] T6: 로컬/서비스 단위 테스트를 추가하고 검증을 실행한다.

## 구현 순서

1. 삭제는 사용자가 확인한 뒤 실행한다.
2. 앱은 로컬 metadata와 업로드 queue item을 먼저 정리해 local-first 목록 동작을 유지한다.
3. 원격 asset id가 있으면 Supabase session과 mapping을 확인한 뒤 Edge Function `delete_photo` action을 호출한다.
4. Edge Function은 RLS로 조회 가능한 `media_assets` row만 대상으로 삼고, R2 `DELETE` 성공 후 `status = deleted`로 갱신한다.
5. 원격 삭제 실패는 목록 렌더링 실패로 만들지 않고 화면 메시지로만 알린다.

## 테스트 계획

- 로컬 repository가 사진 id로 metadata를 삭제하고 최근순 목록을 유지하는지 테스트한다.
- 삭제 서비스가 로컬 삭제와 queue 제거를 먼저 수행하는지 테스트한다.
- remote asset id가 있으면 원격 삭제를 호출하는지 테스트한다.
- session 또는 mapping이 없으면 원격 삭제를 건너뛰는지 테스트한다.
- 원격 삭제 실패가 로컬 삭제 결과를 되돌리지 않는지 테스트한다.
