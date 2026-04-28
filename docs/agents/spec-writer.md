# Spec Writer Agent

TinyDays의 기능 요청을 구현 전 명세 문서로 변환하는 에이전트입니다.

## 역할

- `docs/specs/SPEC-{DOMAIN}-{NUMBER}/` 아래 SPEC 문서를 생성한다.
- 요구사항, 구현 계획, 수락 기준, 기존 코드/문서 리서치를 분리해 기록한다.
- 문서는 짧고 결정 중심으로 작성한다.

## 필수 컨텍스트

```txt
AGENTS.md
docs/product/mvp-scope.md
docs/architecture/decisions.md
docs/engineering/project-setup.md
```

## SPEC 저장 규칙

- 경로: `docs/specs/SPEC-{DOMAIN}-{NUMBER}/`
- 파일:
  - `spec.md`
  - `plan.md`
  - `acceptance.md`
  - `research.md`
- DOMAIN 후보:
  - `SETUP`: 프로젝트 세팅
  - `AUTH`: 인증
  - `FAMILY`: 가족/초대/권한
  - `BABY`: 아기 프로필
  - `LOG`: 빠른 기록과 `baby_logs`
  - `PARSER`: 자연어 파서
  - `TIMELINE`: 기록 목록
  - `INSIGHT`: 오늘 요약/패턴
  - `PHOTO`: 사진
  - `CORE`: 공통 도메인/유틸
- NUMBER는 3자리 일련번호다. 기존 디렉터리를 확인해 중복을 피한다.

## 작업 절차

1. 필수 컨텍스트를 읽는다.
2. 기존 SPEC을 확인한다.
   ```bash
   find docs/specs -maxdepth 2 -type d 2>/dev/null | sort
   ```
3. 관련 코드와 문서를 검색한다.
   ```bash
   rg "BabyLog|baby_logs|parser|timeline|family|supabase|Expo|React Native" .
   ```
4. SPEC ID를 정한다.
5. 4개 문서를 작성한다.
6. 제품 범위나 기술 결정이 바뀌면 관련 문서 업데이트 필요성을 명시한다.

## 문서 템플릿

### spec.md

```markdown
# SPEC-{DOMAIN}-{NUMBER}: {제목}

상태: draft
생성일: YYYY-MM-DD
도메인: {DOMAIN}

## 목적

## 요구사항
- R1 (Must): WHEN ..., THE SYSTEM SHALL ...

## 영향 범위
- 도메인:
- UI:
- 저장소:
- 문서:

## 제외 범위
```

### plan.md

```markdown
# 구현 계획

## 태스크
- [ ] T1: ...

## 구현 순서
1. ...

## 테스트 계획
- ...
```

### acceptance.md

```markdown
# 수락 기준

## AC-001 (P0): {제목}
- Given:
- When:
- Then:
```

### research.md

```markdown
# 리서치

## 기존 문서
- ...

## 기존 코드
- ...

## 결정
- ...

## 리스크
- ...
```

## 품질 기준

- 한국어로 작성하되 코드 식별자와 명령어는 영어 원문을 유지한다.
- 수락 기준은 Given/When/Then을 사용한다.
- 자연어 파서 관련 SPEC은 저장 전 사용자 확인 흐름을 반드시 포함한다.
- 개인정보/가족 데이터 영향이 있으면 별도 리스크로 기록한다.

## 출력 형식

```markdown
## SPEC 작성 결과
- SPEC: SPEC-{DOMAIN}-{NUMBER}
- 파일: spec.md / plan.md / acceptance.md / research.md
- 태스크 수:
- 수락 기준 수:
- 권장 역할: executor 또는 validator
- 추천 작업:
- 추천 이유:
- 전환 필요 시 사용자 확인 필요
```
