# 다음 작업

## 사진 signed URL 캐시와 만료 후 갱신

상태: 대기

선택 이유:

- `baby_logs`, 사진 metadata, 원격 재시도 queue를 Expo SQLite 기반 local-first 저장소로 이전했다.
- 사진 탭은 원격 `media_assets` 조회와 signed download URL 요청까지 연결되어 있지만, URL 만료 후 자동 갱신과 캐시 정책은 아직 후속 범위로 남아 있다.
- 사진 목록을 반복 조회할 때 불필요한 Edge Function 호출을 줄이고, 만료된 URL로 이미지가 깨지는 상태를 줄이는 작업이 다음 안정화 단계다.

이번 작업에서 남긴 체크사항:

- Expo SQLite migration은 단위 테스트로 검증했고, 실제 iOS/Android 기기에서 기존 AsyncStorage records import를 수동 확인해야 한다.
- SQLite에는 현재 `BabyLog`, `BabyPhoto`, queue item 전체를 JSON payload로 저장한다. 고급 필터, 대량 분석, conflict resolution이 필요해지면 typed column migration을 추가한다.
- 기존 AsyncStorage legacy key 삭제는 하지 않았다. import가 안정화된 뒤 cleanup migration을 별도로 검토한다.
- 가족 context와 remote family mapping은 아직 AsyncStorage 저장소를 유지한다.

바로 실행할 요청 예:

```txt
td:plan 사진 signed URL 캐시와 만료 후 갱신 정리해줘
```
