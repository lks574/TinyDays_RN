# 구현 계획

## 태스크

- [x] T1: signed URL 캐시와 만료 갱신 SPEC을 작성한다.
- [x] T2: signed download URL freshness 판단 helper를 추가한다.
- [x] T3: 앱 프로세스 메모리 기반 download URL cache repository를 추가한다.
- [x] T4: 사진 목록 원격 조회가 유효 캐시를 재사용하고 만료 URL은 새로 발급받게 연결한다.
- [x] T5: 사진 이미지 로딩 실패 시 단건 signed URL 갱신을 연결한다.
- [x] T6: 캐시 hit, 만료 갱신, 단건 갱신 단위 테스트를 추가한다.

## 구현 순서

1. signed URL은 개인정보가 담긴 원본 접근 토큰이므로 영구 저장하지 않고 메모리 캐시로 제한한다.
2. 캐시는 `media_asset_id`를 key로 저장하고, `expires_at`이 현재 시각 기준 완충 시간 안에 들어오면 stale로 본다.
3. 사진 탭 로드 시 원격 metadata는 계속 조회하되, 각 asset의 download URL은 캐시 hit이면 재요청하지 않는다.
4. `Image` 로딩 실패는 원격 사진에 한해 단건 refresh service를 호출하고, 성공 시 화면의 해당 사진 URI만 교체한다.
5. refresh 실패는 로컬 목록 렌더링 실패로 만들지 않고 상태 메시지로만 알린다.

## 테스트 계획

- 캐시 repository가 유효 URL만 반환하고 만료 또는 완충 시간 안 URL은 반환하지 않는지 테스트한다.
- 원격 사진 목록 로드가 유효 캐시를 사용하면 `getDownloadUrl`을 호출하지 않는지 테스트한다.
- 캐시가 만료되면 새 signed URL을 요청하고 결과를 캐시에 저장하는지 테스트한다.
- 단건 refresh가 원격 사진 URI를 새 signed URL로 교체하는지 테스트한다.
- session 또는 mapping이 없으면 refresh가 안전하게 `skipped` 되는지 테스트한다.
