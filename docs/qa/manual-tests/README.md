# 실환경 수동 검증

이 디렉터리는 자동 테스트로 확인하기 어려운 Supabase, R2, 실제 계정/session 기반 검증 체크리스트를 모아둔다.

## 체크리스트

- `SPEC-FAMILY-005.md`: 가족 구성원 목록 조회와 역할 표시.
- `SPEC-PHOTO-004.md`: 원격 사진 조회와 R2 signed download URL.
- `SPEC-PHOTO-006.md`: 사진 삭제와 R2 object 정리.
- `SPEC-PHOTO-007.md`: 사진 signed URL 캐시와 만료 갱신.

## 작성 규칙

- 파일명은 관련 SPEC ID를 사용한다.
- 앱에 service role key나 R2 secret을 넣는 절차를 문서화하지 않는다.
- 준비물, 앱 환경 변수, 단계별 PASS 기준, 최종 PASS 기준을 포함한다.
- 실환경 계정, 외부 secret, 원격 데이터 삭제가 필요한 검증은 자동 진행하지 않고 사람이 수행한다.
