# 수락 기준

## AC-001 (P0): Supabase schema 생성

- Given: Supabase local 환경이 준비되어 있다.
- When: PR-13 migration을 적용한다.
- Then: `families`, `family_members`, `children`, `baby_logs`, `media_assets` 테이블이 생성된다.

## AC-002 (P0): 가족 구성원 조회 권한

- Given: 사용자가 특정 가족의 `family_members` row를 가지고 있다.
- When: 해당 가족의 `families`, `children`, `baby_logs`, `media_assets`를 조회한다.
- Then: 같은 `family_id`의 데이터만 조회된다.

## AC-003 (P0): 비구성원 접근 차단

- Given: 사용자가 특정 가족의 `family_members` row를 가지고 있지 않다.
- When: 해당 가족의 `children`, `baby_logs`, `media_assets`를 조회하거나 변경하려 한다.
- Then: RLS에 의해 데이터가 노출되거나 변경되지 않는다.

## AC-004 (P0): `parent` write 허용

- Given: 사용자가 같은 가족의 `parent` 구성원이다.
- When: 해당 가족의 아기, 기록, 미디어 metadata를 생성하거나 수정한다.
- Then: 작업이 허용된다.

## AC-005 (P0): `family` write 차단

- Given: 사용자가 같은 가족의 `family` 구성원이다.
- When: 해당 가족의 아기, 기록, 미디어 metadata를 생성하거나 수정한다.
- Then: 작업이 차단된다.

## AC-006 (P0): 역할 제한

- Given: `family_members.role`에 값을 저장한다.
- When: 값이 `parent` 또는 `family`가 아니다.
- Then: 저장이 실패한다.

## AC-007 (P1): `baby_logs` 도메인 정렬

- Given: 앱의 `BabyLog` 필드 기준으로 원격 기록 row를 만든다.
- When: `baby_logs`에 insert한다.
- Then: `family_id`, `child_id`, `created_by`, `log_type`, `recorded_at`, `source`, `confidence`가 보존된다.

## AC-008 (P1): 미디어 metadata 분리

- Given: 사진 업로드를 위한 metadata를 만든다.
- When: `media_assets`에 insert한다.
- Then: R2 `object_key`와 metadata만 저장되고 public URL이나 파일 원본은 저장되지 않는다.
