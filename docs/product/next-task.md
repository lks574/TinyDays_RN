# 다음 작업

## PR-18 원격 사진 조회 URL 연결 1차

상태: 대기

이유:

- PR-17에서 사진 원본을 R2 private bucket에 저장하고 Supabase `media_assets` metadata만 남기는 첫 업로드 경로를 만들었다.
- 다음 제품 흐름은 다른 기기나 가족 구성원이 업로드된 사진을 볼 수 있도록 `media_assets` 조회와 signed download URL 발급을 앱에 연결하는 것이다.
- 원격 조회 실패가 기존 로컬 사진 목록을 막지 않도록 local-first 흐름을 유지해야 한다.

바로 실행할 요청 예:

```txt
td:auto PR-18
```
