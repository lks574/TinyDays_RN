# 구현 계획

## 태스크

- [x] T1: Expo SQLite 의존성을 추가한다.
- [x] T2: 공통 SQLite JSON table 저장 유틸을 만든다.
- [x] T3: `baby_logs` repository를 SQLite로 이전하고 AsyncStorage import를 유지한다.
- [x] T4: 사진 metadata repository를 SQLite로 이전하고 AsyncStorage import를 유지한다.
- [x] T5: 기록 백업 queue와 사진 업로드 queue를 단일 `sync_queue` 테이블로 통합한다.
- [x] T6: repository 단위 테스트를 SQLite adapter 기준으로 갱신한다.
- [x] T7: 저장소 결정 문서를 업데이트한다.

## 구현 순서

1. `expo-sqlite`를 SDK 54 호환 버전으로 설치한다.
2. `tinydays.db`를 여는 공통 모듈을 추가한다.
3. `baby_logs`, `baby_photo_metadata`, `sync_queue` 테이블을 생성한다.
4. 기존 AsyncStorage records를 테이블이 비어 있을 때만 가져온다.
5. 기존 feature service와 UI는 repository interface를 그대로 사용하게 둔다.

## 테스트 계획

- `local-baby-log-repository.test.ts`
- `local-baby-photo-repository.test.ts`
- `remote-baby-log-backup-queue-repository.test.ts`
- `remote-baby-photo-upload-queue-repository.test.ts`
- `npm run lint`
- `npm run typecheck`
- `npm test`
