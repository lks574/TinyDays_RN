# 다음 작업

## 사진 signed URL 만료 갱신 실환경 검증

상태: 대기

선택 이유:

- 사진 signed URL 캐시와 만료 후 갱신은 자동 테스트로 검증했다.
- 실제 R2 signed URL 만료, React Native `Image` 로딩 실패, 단건 URL 갱신은 Supabase Edge Function/R2가 연결된 iOS/Android 환경에서 확인해야 한다.
- Expo SQLite legacy import도 단위 테스트를 통과했지만 기존 AsyncStorage records가 있는 실제 기기에서 수동 확인이 남아 있다.

이번 작업에서 남긴 체크사항:

- `docs/qa/manual-tests/SPEC-PHOTO-007.md` 기준으로 signed URL 캐시 재사용, 만료 후 목록 재조회 갱신, 이미지 오류 후 단건 갱신을 확인한다.
- 같은 문서 기준으로 기존 AsyncStorage records import를 iOS/Android 기기 또는 시뮬레이터에서 확인한다.
- import가 안정화된 뒤 기존 AsyncStorage legacy key cleanup migration을 별도로 검토한다.
- 가족 context와 remote family mapping은 아직 AsyncStorage 저장소를 유지한다.
- SQLite에는 현재 `BabyLog`, `BabyPhoto`, queue item 전체를 JSON payload로 저장한다. 고급 필터, 대량 분석, conflict resolution이 필요해지면 typed column migration을 추가한다.

바로 실행할 요청 예:

```txt
td:validate SPEC-PHOTO-007 실환경 체크리스트 확인해줘
```
