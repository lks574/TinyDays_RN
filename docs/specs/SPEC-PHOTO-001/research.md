# 리서치

## 기존 문서

- `docs/product/mvp-scope.md`: 사진 탭은 날짜별 사진 타임라인, 업로드 진입점, 이후 영상 만들기를 포함한다.
- `docs/product/roadmaps/mvp-pr-roadmap.md`: PR-12는 사진 탭, 날짜별 사진 목록, 업로드 진입점, 저장소 선택 검토가 범위다.
- `docs/architecture/decisions.md`: PR-07 기록 저장소와 PR-11 family context는 `AsyncStorage`로 시작한다.

## 기존 코드

- `app/(tabs)/photos.tsx`: placeholder 화면만 있다.
- `src/domain/family`: `family_id`, `child_id`, `created_by`를 제공하는 family context가 있다.
- `src/features/logging/local-baby-log-repository.ts`: `AsyncStorage` repository 패턴이 있다.
- `src/features/timeline/timeline.ts`: 날짜 key 생성과 날짜별 옵션 생성 패턴이 있다.

## 결정

- PR-12는 서버 업로드가 아니라 로컬 사진 메타데이터 저장으로 구현한다.
- 이미지 선택은 Expo SDK 54 호환 `expo-image-picker`를 사용한다.
- 저장된 값은 실제 파일 복사가 아니라 선택 결과의 로컬 URI와 메타데이터다.

## 리스크

- 선택한 로컬 URI의 장기 유지 여부는 플랫폼 동작에 의존한다. 원격 동기화나 안정적 파일 관리는 Supabase Storage 또는 파일 시스템 저장 전략 결정 시 다시 다룬다.
- 사진은 민감한 가족 데이터이므로 공개 공유, 댓글, 반응으로 연결하지 않는다.
