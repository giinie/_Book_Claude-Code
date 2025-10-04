# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Express.js 기반의 REST API 프로젝트입니다. 현재 초기 설정 단계이며, Express 5.1.0을 사용합니다.

## 개발 환경

- **Node.js**: CommonJS 모듈 시스템 사용 (`"type": "commonjs"`)
- **Express 버전**: 5.1.0 (주의: Express 5는 breaking changes가 있음)
- **진입점**: `app.js`

## 필수 명령어

### 개발 서버 실행
```bash
node app.js
```

### 의존성 설치
```bash
npm install
```

## Express 5.x 주요 변경사항

Express 5를 사용하므로 다음 사항에 주의:

1. **콜백 에러 처리**: Promise rejection이 자동으로 처리됨
2. **미들웨어 에러**: 동기/비동기 에러 모두 자동으로 next()로 전달
3. **deprecated 메서드 제거**: `app.del()` 등 제거됨
4. **라우터 파라미터 변경**: path-to-regexp 6.x 사용

## 권장 아키텍처 패턴

아직 구조가 정의되지 않았으므로, 다음 패턴을 권장:

```
my-express-api/
├── app.js              # Express 앱 설정 및 서버 시작
├── routes/             # 라우트 정의
│   ├── index.js
│   └── api/
├── controllers/        # 비즈니스 로직
├── middlewares/        # 커스텀 미들웨어
├── models/             # 데이터 모델 (DB 사용 시)
├── utils/              # 유틸리티 함수
└── config/             # 설정 파일
```

## 코딩 컨벤션

- CommonJS 모듈 시스템: `require()`, `module.exports` 사용
- 비동기 처리: `async/await` 권장 (Express 5가 자동으로 에러 처리)
- 에러 핸들링: Express 5의 내장 에러 처리 활용