# 구현 계획

## 태스크

- [x] T1: 원격 `media_assets` row와 signed download URL을 앱 사진 모델로 변환하는 도메인 helper를 추가한다.
- [x] T2: Supabase `media_assets` 조회 repository를 추가한다.
- [x] T3: 로컬 사진과 원격 사진을 병합하는 로드 서비스를 추가한다.
- [x] T4: 사진 탭의 초기 로드 경로를 원격 병합 서비스로 교체한다.
- [x] T5: 도메인/서비스 단위 테스트를 추가한다.

## 구현 순서

1. 원격 사진 asset 타입과 정규화 함수를 정의한다.
2. 원격 asset과 download URL을 `BabyPhoto`로 변환한다.
3. 로컬 `remote_media_asset_id`와 원격 asset id 기준으로 중복을 제거한다.
4. 사진 탭에서 로컬 우선 로드 서비스를 호출한다.
5. 검증 명령을 실행한다.

## 테스트 계획

- 원격 asset row 정규화와 `BabyPhoto` 변환을 테스트한다.
- 로컬 사진과 원격 사진 중복 제거를 테스트한다.
- session, mapping, 원격 실패 케이스에서 로컬 목록이 유지되는지 테스트한다.
