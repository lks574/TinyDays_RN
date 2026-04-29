# 백엔드와 저장소 전략

TinyDays는 local-first 베이비 라이프로그 서비스로 설계한다. 앱은 로컬 저장소를 먼저 사용하고, 서버는 가족 공유, 권한, 동기화, 백업을 담당한다. 사진과 영상 같은 대용량 미디어는 서버 DB와 분리해 object storage에 둔다.

## 최종 지향 구조

```txt
React Native 앱
  -> Expo SQLite
  -> Supabase Auth / Postgres / RLS
  -> Cloudflare R2
  -> 선택형 개인 저장소: NAS / S3 / WebDAV
```

## 역할 분리

| 영역 | 기술 | 역할 |
|------|------|------|
| 앱 내부 저장소 | Expo SQLite | 빠른 기록, 자연어 기록, 타임라인, 오늘 요약, 오프라인 사용, sync queue |
| 서버 인증 | Supabase Auth | 부모 계정, 가족 멤버 식별 |
| 서버 DB | Supabase Postgres | 가족, 아기, 멤버, `baby_logs`, 미디어 metadata의 서버 기준 데이터 |
| 서버 권한 | Supabase RLS | `family_id` 기준 접근 제어 |
| 미디어 저장소 | Cloudflare R2 | 사진/영상 원본, 썸네일, 압축본 |
| 미디어 접근 | signed URL | private bucket을 유지하고 권한 확인 후 업로드/다운로드 |
| 개인 저장소 | NAS / S3 / WebDAV | 고급 사용자용 원본 미디어 보관 옵션 |

## 개발 단계 구조

개발 단계에서는 제품 검증 속도와 운영 비용을 우선한다.

```txt
앱
  -> AsyncStorage 또는 Expo SQLite
  -> Supabase Free
  -> Cloudflare R2 Free
```

원칙:

- 현재 MVP 기록 루프는 기존 `AsyncStorage` repository를 유지한다.
- 날짜별 조회, 수정/삭제, 동기화 queue가 필요해지는 시점에 `baby_logs`부터 Expo SQLite로 이전한다.
- Supabase Free는 인증, 가족 권한, 서버 schema, RLS 검증에 사용한다.
- R2 Free는 private bucket, signed upload/download, 썸네일 흐름 검증에 사용한다.
- 개발 단계에서는 서버 AI 파싱을 도입하지 않는다.

개발 단계의 저장 흐름:

```txt
기록 생성
  -> 앱 로컬 저장소에 즉시 저장
  -> 서버 동기화는 후속 단계에서 queue로 처리

사진/영상 선택
  -> 앱에 metadata 저장
  -> R2 업로드 실험
  -> Supabase에는 media metadata만 저장
```

## 상용 단계 구조

상용 단계에서는 개인정보 보호, 비용 예측 가능성, 다중 기기 동기화를 우선한다.

```txt
앱
  -> Expo SQLite
  -> Supabase Auth / Postgres / RLS
  -> Cloudflare R2 private bucket
  -> 선택형 NAS / S3 / WebDAV
```

상용 원칙:

- 앱은 Expo SQLite를 기준으로 빠르게 동작한다.
- Supabase는 서버 기준 데이터와 권한의 source of truth로 둔다.
- R2는 미디어 파일 저장소로 사용하고, Supabase에는 파일 metadata만 둔다.
- 모든 미디어 bucket은 private으로 유지한다.
- 업로드와 다운로드는 signed URL 또는 Edge Function을 통해 권한 확인 후 처리한다.
- NAS, S3, WebDAV 연동은 고급 사용자용 선택 기능으로 제공하고 제품 필수 경로에는 두지 않는다.
- 광고 기반 수익화는 피하고 저장공간과 가족 공유 중심의 유료 모델을 사용한다.

상용 미디어 업로드 흐름:

```txt
1. 앱에서 사진/영상 선택
2. 앱이 Supabase에 media_assets 초안 생성 요청
3. 서버가 가족 권한을 확인
4. 서버가 R2 signed upload URL 발급
5. 앱이 R2에 파일 업로드
6. 업로드 완료 후 media_assets 상태를 uploaded로 변경
7. 앱 SQLite에 metadata 동기화
```

상용 미디어 조회 흐름:

```txt
1. 앱이 SQLite metadata로 화면 구성
2. 필요한 미디어만 서버에 접근 URL 요청
3. 서버가 가족 권한을 확인
4. R2 signed download URL 발급
5. 앱이 R2에서 이미지/영상을 로드
```

## 수익화 기준

초기 유료 모델은 저장공간과 가족 공유를 기준으로 단순하게 시작한다.

| 플랜 | 방향 |
|------|------|
| Free | 로컬 기록, 기본 타임라인, 제한된 클라우드 백업 |
| Plus | 가족 공유, 클라우드 동기화, 기본 미디어 용량 |
| Family | 더 큰 미디어 용량, 여러 가족 구성원, 여러 아이, 고급 검색/리포트 |
| Storage Add-on | 추가 저장공간 과금 |
| BYOS | NAS / S3 / WebDAV 연결 |

## 결정 요약

TinyDays는 부모가 최소 행동으로 남긴 기록과 사진을 가족만의 private timeline, 오늘 요약, 생활 패턴으로 바꾸는 local-first 서비스로 간다. 기록과 metadata는 SQLite와 Supabase를 기준으로 관리하고, 대용량 미디어는 R2에 분리 저장한다.
