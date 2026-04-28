# 수락 기준

## AC-001 (P0): 수유 파싱

- Given: 기준 시각이 있다.
- When: 사용자가 `분유 120ml 먹었어`를 입력한다.
- Then: 파서는 `feeding` 후보, `amount: 120`, `unit: "ml"`을 반환한다.

## AC-002 (P0): 수면 시작 파싱

- Given: 기준 시각이 있다.
- When: 사용자가 `2시에 잠들었어`를 입력한다.
- Then: 파서는 `sleep_start` 후보와 같은 날짜의 2시 기록 시각을 반환한다.

## AC-003 (P0): 기저귀 소변 파싱

- Given: 기준 시각이 있다.
- When: 사용자가 `기저귀 소변`을 입력한다.
- Then: 파서는 `diaper_pee` 후보를 반환한다.

## AC-004 (P0): 체온 파싱

- Given: 기준 시각이 있다.
- When: 사용자가 `열 37.8도`를 입력한다.
- Then: 파서는 `temperature` 후보, `amount: 37.8`, `unit: "C"`를 반환한다.

## AC-005 (P0): 확인 흐름 연결성

- Given: 자연어 파서 결과가 있다.
- When: 호출자가 결과를 확인 화면으로 전달한다.
- Then: 결과에는 `parsedLog`, `confidence`, `needsConfirmation`, `originalText`가 포함된다.
