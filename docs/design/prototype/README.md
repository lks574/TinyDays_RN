# TinyDays 디자인 프로토타입

이 폴더는 전달받은 TinyDays 디자인 시안 원본을 보관한다.

## 실행

```sh
cd docs/design/prototype
python3 -m http.server 5178 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:5178/`을 연다.

## 주요 파일

- `index.html`: 프로토타입 진입점
- `styles.css`: 디자인 토큰 원본
- `ds.jsx`: 디자인 시스템 컴포넌트 원본
- `ds-showcase.jsx`: 디자인 시스템 쇼케이스
- `app-state.jsx`: 기록 타입, 샘플 데이터, 표시 헬퍼
- `screens-home.jsx`: 홈, 빠른 기록, 텍스트 기록 확인 시트
- `screens-other.jsx`: 기록, 캘린더, 인사이트, 사진, 가족 화면
- `app.jsx`: 탭 구성과 전체 아트보드

## 이식 기준

이 코드는 React Native 앱 소스가 아니라 브라우저용 React 프로토타입이다.
앱에 반영할 때는 화면 구조, 토큰, 카피, 상호작용 흐름을 기준으로 삼고,
저장소와 도메인 로직은 `src/`의 기존 TypeScript 구현을 유지한다.
