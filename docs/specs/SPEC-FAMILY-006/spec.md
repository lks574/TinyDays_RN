# SPEC-FAMILY-006: 초대 취소와 구성원 제거 정책

상태: draft
생성일: 2026-04-30
도메인: FAMILY

## 목적

원격 가족을 관리하는 `parent`가 대기 중인 초대를 취소하고, 더 이상 접근 권한을 주지 않을 구성원을 제거할 수 있게 한다. 구성원 제거는 가족 데이터 접근 권한을 끊는 동작으로 제한하며, 기존 아기 기록과 사진 metadata는 삭제하지 않는다.

## 요구사항

- R1 (Must): WHEN 원격 가족 mapping이 있는 `parent`가 대기 초대 취소를 요청하면, THE SYSTEM SHALL 해당 `family_invites.revoked_at`을 기록한다.
- R2 (Must): WHEN 초대가 이미 수락, 취소, 만료되었으면, THE SYSTEM SHALL 초대 취소 요청을 거부하거나 no-op 성공으로 처리하지 않고 명확한 실패로 반환한다.
- R3 (Must): WHEN 취소, 만료, 수락된 초대 코드로 가족 합류를 요청하면, THE SYSTEM SHALL 가족 합류를 거부한다.
- R4 (Must): WHEN `family` 역할 또는 비구성원이 초대 취소를 요청하면, THE SYSTEM SHALL 요청을 거부한다.
- R5 (Must): WHEN 원격 가족 mapping이 있는 `parent`가 구성원 제거를 요청하면, THE SYSTEM SHALL 대상 구성원의 향후 원격 가족 데이터 접근을 차단한다.
- R6 (Must): WHEN 제거 대상이 마지막 `parent`이면, THE SYSTEM SHALL 구성원 제거를 거부한다.
- R7 (Must): WHEN 제거 대상이 현재 로그인한 자기 자신이면, THE SYSTEM SHALL 1차 구현에서 구성원 제거를 거부한다.
- R8 (Must): WHEN 구성원이 제거되면, THE SYSTEM SHALL 기존 `baby_logs`, `media_assets`, R2 object를 삭제하지 않는다.
- R9 (Should): WHEN 초대 취소 또는 구성원 제거가 성공하면, THE SYSTEM SHALL 가족 탭의 초대/구성원 목록을 다시 조회한다.
- R10 (Should): WHEN 원격 작업이 실패하면, THE SYSTEM SHALL 기존 로컬 가족/기록/사진 흐름을 유지하고 실패 메시지를 표시한다.

## 영향 범위

- 도메인: `src/domain/family`
- UI: `app/(tabs)/family.tsx`
- 저장소/백엔드: `src/features/family`, Supabase migration/RPC/RLS
- 문서: `docs/architecture/decisions.md`, `docs/engineering/project-setup.md`, `docs/product/next-task.md`

## 정책

- 초대 취소는 `accepted_at is null`, `revoked_at is null`, `expires_at > now()` 상태의 초대만 대상으로 한다.
- 초대 재발급은 기존 초대를 수정하지 않고 새 초대를 생성하는 방식으로 처리한다.
- 구성원 제거는 `family_members` row 삭제 또는 접근 불가 상태 전환 중 구현 시점에 선택하되, 제거된 사용자가 RLS 기준 가족 구성원으로 판정되지 않아야 한다.
- 기존 기록의 `created_by`와 사진 metadata는 감사와 타임라인 보존을 위해 유지한다.
- 제거된 구성원이 로컬 기기에 가진 `RemoteFamilyMapping`은 서버 접근에서 무효가 되며, 앱은 원격 조회 실패 시 로컬 흐름을 유지한다.

## 제외 범위

- 구성원 역할 변경.
- 가족 소유권 이전.
- 자기 자신 가족 나가기.
- 기존 기록, 사진 metadata, R2 object 일괄 삭제.
- 여러 가족 전환.
- 초대 deep link, 연락처 공유, 재발급 관리 화면 고도화.
