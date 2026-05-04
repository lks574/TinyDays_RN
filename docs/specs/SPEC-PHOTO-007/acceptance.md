# 수락 기준

## AC-001 (P0): 유효 signed URL 캐시 재사용

- Given: 원격 사진의 signed download URL 캐시가 있고 만료 완충 시간 밖이다.
- When: 사용자가 사진 탭을 다시 연다.
- Then: 앱은 해당 사진의 download URL 발급 요청을 생략하고 캐시 URL로 사진을 표시한다.

## AC-002 (P0): 만료 URL 갱신

- Given: 원격 사진의 signed download URL 캐시가 만료됐거나 곧 만료된다.
- When: 사용자가 사진 탭을 연다.
- Then: 앱은 새 signed download URL을 요청하고 캐시를 새 값으로 교체한다.

## AC-003 (P0): 이미지 실패 후 단건 갱신

- Given: 표시 중인 원격 사진의 signed URL이 만료되어 이미지 로딩이 실패한다.
- When: 앱이 이미지 로딩 실패를 감지한다.
- Then: 앱은 해당 사진의 새 signed download URL만 요청하고 화면의 사진 URI를 갱신한다.

## AC-004 (P0): 원격 실패 격리

- Given: 로컬 사진이 있고 session, mapping, signed URL 요청 중 하나가 실패한다.
- When: 사진 탭을 열거나 단건 갱신을 시도한다.
- Then: 앱은 로컬 사진 목록 표시를 유지하고 원격 실패 메시지만 표시한다.

## AC-005 (P1): signed URL 비영구 저장

- Given: 앱이 signed download URL을 받았다.
- When: 캐시에 저장한다.
- Then: 앱은 URL을 SQLite 또는 AsyncStorage에 저장하지 않고 프로세스 메모리에만 보관한다.
