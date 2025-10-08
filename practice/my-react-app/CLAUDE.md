# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

### 프로젝트 정보
**카페 예약 시스템 (Cafe Reservation System)**

- **목적**: 카페 좌석 예약 및 주문 관리 시스템
- **기간**: 3개월 개발 프로젝트 (2025년 1월 ~ 3월)
- **팀 구성**:
  - 개발자 2명 (Frontend + Backend)
  - 디자이너 1명 (UI/UX)

### 주요 기능
1. **사용자 기능**
   - 카페 검색 및 좌석 실시간 조회
   - 날짜/시간별 좌석 예약
   - 사전 주문 및 결제
   - 예약 내역 조회/수정/취소

2. **카페 관리자 기능**
   - 좌석 배치 및 상태 관리
   - 예약 현황 대시보드
   - 메뉴 등록/수정/삭제
   - 매출 통계 및 리포트

3. **시스템 기능**
   - 실시간 좌석 상태 동기화
   - 알림 및 푸시 메시지
   - 결제 처리 (PG 연동)
   - 관리자 권한 관리

### 기술 스택

**Frontend**
- React 19.2.0 + TypeScript 5.x
- React Router v6 (페이지 라우팅)
- Zustand (상태 관리)
- Axios (API 통신)
- Tailwind CSS (스타일링)
- React Query (서버 상태 관리)

**Backend**
- Node.js 20.x + Express
- TypeScript
- PostgreSQL (주요 DB)
- Redis (세션/캐시)
- Socket.io (실시간 통신)
- JWT (인증)

**DevOps & Tools**
- Git + GitHub (버전 관리)
- GitHub Actions (CI/CD)
- Docker (컨테이너화)
- AWS EC2/RDS (배포)
- Postman (API 테스트)
- Figma (디자인 협업)

## Development Commands

### Core Development
```bash
# Start development server (http://localhost:3000)
npm start

# Run all tests in interactive watch mode
npm test

# Build production bundle to build/ folder
npm run build
```

### Testing
```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- App.test.js

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

## Architecture

### 디렉토리 구조
```
my-react-app/
├── public/                 # 정적 파일
├── src/
│   ├── api/               # API 통신 모듈
│   │   ├── axios.ts       # Axios 인스턴스 설정
│   │   └── endpoints/     # API 엔드포인트별 함수
│   ├── components/        # 재사용 컴포넌트
│   │   ├── common/        # 공통 컴포넌트 (Button, Input 등)
│   │   ├── layout/        # 레이아웃 컴포넌트 (Header, Footer 등)
│   │   └── domain/        # 도메인별 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── Home/
│   │   ├── Reservation/
│   │   ├── MyPage/
│   │   └── Admin/
│   ├── hooks/             # Custom Hooks
│   ├── store/             # Zustand 스토어
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   ├── constants/         # 상수 정의
│   ├── styles/            # 전역 스타일
│   ├── App.tsx
│   └── index.tsx
├── server/                # Backend (Node.js)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
└── package.json
```

### Application Structure
- **Entry Point**: `src/index.tsx` - React 19 uses `ReactDOM.createRoot()` for rendering, wrapped in `<React.StrictMode>`
- **Main Component**: `src/App.tsx` - Root application component with routing
- **Styling**: Tailwind CSS + CSS Modules for component-specific styles
- **Static Assets**: Located in `public/` folder, referenced from `public/index.html`

### Key Technologies
- **React 19.2.0**: Uses latest React features including Concurrent Rendering
- **Testing Library**: Complete setup with @testing-library/react, @testing-library/jest-dom, and @testing-library/user-event
- **Web Vitals**: Performance monitoring configured via `reportWebVitals.js`

### CRA Configuration
- ESLint extends `react-app` and `react-app/jest` configs
- Browserslist configured for modern browsers in production, latest versions in development
- All build configuration is abstracted by react-scripts (do not eject unless absolutely necessary)

## Important Notes

### React 19 Specifics
- Uses `ReactDOM.createRoot()` instead of legacy `ReactDOM.render()`
- StrictMode is enabled by default for development warnings
- Component files use functional components as the standard pattern

### Testing Setup
- Jest is pre-configured through react-scripts
- Test files should use `.test.js` or `.spec.js` suffix
- Testing utilities from @testing-library are available globally after `setupTests.js` import

### Build System
- Webpack configuration is managed by react-scripts
- Environment variables must be prefixed with `REACT_APP_`
- Source maps and optimizations are handled automatically in production builds

## 코딩 컨벤션

### TypeScript
```typescript
// 인터페이스 명명: Pascal Case with 'I' prefix
interface IUser {
  id: number;
  name: string;
}

// 타입 명명: Pascal Case with 'T' prefix
type TStatus = 'pending' | 'confirmed' | 'cancelled';

// Enum 명명: Pascal Case
enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

// 함수 명명: camelCase, 동사로 시작
const getUserById = async (id: number): Promise<IUser> => {
  // ...
};

// 상수 명명: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
```

### React 컴포넌트
```typescript
// 파일명: PascalCase.tsx
// components/common/Button.tsx

import React from 'react';

interface IButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

/**
 * 공통 버튼 컴포넌트
 * @param children - 버튼 텍스트 또는 자식 요소
 * @param onClick - 클릭 이벤트 핸들러
 * @param variant - 버튼 스타일 (기본값: 'primary')
 * @param disabled - 비활성화 여부
 */
export const Button: React.FC<IButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

### CSS/Tailwind
```typescript
// Tailwind 클래스 순서:
// 1. 레이아웃 (display, position, flex, grid)
// 2. 크기 (width, height, padding, margin)
// 3. 타이포그래피 (font, text)
// 4. 색상 (background, text color, border)
// 5. 기타 (transition, animation)

<div className="flex items-center justify-between w-full h-16 px-4 py-2 text-lg font-semibold bg-white border-b border-gray-200 transition-all">
```

### API 명명 규칙
```typescript
// REST API 엔드포인트
// GET    /api/reservations          - 예약 목록 조회
// GET    /api/reservations/:id      - 예약 상세 조회
// POST   /api/reservations          - 예약 생성
// PUT    /api/reservations/:id      - 예약 수정
// DELETE /api/reservations/:id      - 예약 삭제

// API 함수 명명
export const getReservations = () => api.get('/reservations');
export const getReservationById = (id: number) => api.get(`/reservations/${id}`);
export const createReservation = (data: IReservationCreate) => api.post('/reservations', data);
export const updateReservation = (id: number, data: IReservationUpdate) => api.put(`/reservations/${id}`, data);
export const deleteReservation = (id: number) => api.delete(`/reservations/${id}`);
```

## 팀 협업 규칙

### Git 워크플로우
```bash
# 브랜치 전략 (Git Flow)
main              # 프로덕션 배포 브랜치 (보호됨)
develop           # 개발 통합 브랜치
feature/*         # 기능 개발 브랜치
bugfix/*          # 버그 수정 브랜치
hotfix/*          # 긴급 수정 브랜치
release/*         # 릴리스 준비 브랜치

# 브랜치 생성 예시
git checkout -b feature/reservation-list    # 예약 목록 기능
git checkout -b bugfix/login-validation     # 로그인 검증 버그 수정
git checkout -b hotfix/payment-error        # 결제 오류 긴급 수정
```

### Commit 메시지 규칙
```bash
# 형식: <type>(<scope>): <subject>
# 예시:
feat(reservation): 예약 목록 페이지 구현
fix(auth): 로그인 토큰 만료 처리 오류 수정
docs(readme): API 문서 업데이트
style(button): 버튼 컴포넌트 스타일 개선
refactor(api): API 호출 로직 리팩토링
test(reservation): 예약 생성 테스트 추가
chore(deps): React Query 버전 업데이트

# Type 종류:
# feat     - 새로운 기능 추가
# fix      - 버그 수정
# docs     - 문서 수정
# style    - 코드 포맷팅, 세미콜론 누락 등
# refactor - 코드 리팩토링
# test     - 테스트 코드 추가/수정
# chore    - 빌드 업무, 패키지 관리 등
```

### Pull Request 프로세스
1. **PR 생성 전**
   - 최신 develop 브랜치와 동기화
   - 로컬에서 충분한 테스트 수행
   - 코드 자체 리뷰 및 포맷팅 확인

2. **PR 템플릿**
   ```markdown
   ## 작업 내용
   - 구현한 기능 또는 수정 내용 요약

   ## 변경 사항
   - 주요 파일 변경 내역
   - API 변경 사항
   - DB 스키마 변경 사항

   ## 테스트 결과
   - [ ] 로컬 테스트 완료
   - [ ] 단위 테스트 작성/수정
   - [ ] 통합 테스트 확인

   ## 스크린샷 (UI 변경 시)
   - Before/After 스크린샷 첨부

   ## 체크리스트
   - [ ] 코딩 컨벤션 준수
   - [ ] TypeScript 타입 정의 완료
   - [ ] 주석 및 문서 작성
   - [ ] Breaking Changes 없음 (또는 명시)
   ```

3. **리뷰 규칙**
   - 최소 1명의 승인 필요
   - 리뷰어는 24시간 내 응답
   - 변경 요청 시 구체적인 개선 방안 제시
   - 승인 후 본인이 직접 merge

### 코드 리뷰 가이드라인
```typescript
// ✅ Good: 명확한 변수명과 주석
/**
 * 사용자의 예약 가능 여부를 확인합니다.
 * @param userId - 사용자 ID
 * @param reservationDate - 예약 날짜
 * @returns 예약 가능 여부
 */
const checkReservationAvailability = async (
  userId: number,
  reservationDate: Date
): Promise<boolean> => {
  const existingReservations = await getReservationsByUser(userId);
  return !existingReservations.some(r => isSameDay(r.date, reservationDate));
};

// ❌ Bad: 불명확한 변수명, 주석 없음
const check = async (u: number, d: Date) => {
  const r = await get(u);
  return !r.some(x => same(x.d, d));
};
```

## 테스트 및 디버깅

### 테스트 전략
```typescript
// 단위 테스트 예시 - src/__tests__/utils/dateUtils.test.ts
import { formatDate, isSameDay } from '@/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('날짜를 YYYY-MM-DD 형식으로 변환', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('2025-01-15');
    });
  });

  describe('isSameDay', () => {
    it('같은 날짜인지 확인', () => {
      const date1 = new Date('2025-01-15 10:00:00');
      const date2 = new Date('2025-01-15 15:30:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });
});

// 컴포넌트 테스트 예시 - src/__tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('버튼을 렌더링하고 클릭 이벤트가 동작', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    const button = screen.getByText('클릭');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭 이벤트가 동작하지 않음', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>클릭</Button>);

    const button = screen.getByText('클릭');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 디버깅 도구
```typescript
// React DevTools 활용
// 컴포넌트 계층 구조 및 Props/State 확인

// Redux DevTools (Zustand DevTools)
import { devtools } from 'zustand/middleware';

export const useReservationStore = create(
  devtools(
    (set) => ({
      reservations: [],
      addReservation: (reservation) => set((state) => ({
        reservations: [...state.reservations, reservation]
      }))
    }),
    { name: 'ReservationStore' }
  )
);

// 환경변수 기반 로깅
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => isDev && console.log('[LOG]', ...args),
  error: (...args: any[]) => isDev && console.error('[ERROR]', ...args),
  warn: (...args: any[]) => isDev && console.warn('[WARN]', ...args),
};
```

## 배포 및 환경 설정

### 환경 변수
```bash
# .env.development (개발 환경)
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_ENV=development

# .env.production (프로덕션 환경)
REACT_APP_API_URL=https://api.cafe-reservation.com/api
REACT_APP_SOCKET_URL=https://api.cafe-reservation.com
REACT_APP_ENV=production

# .env.local (로컬 개발자별 설정, Git 제외)
REACT_APP_API_URL=http://localhost:8080/api
```

### 배포 스크립트
```json
// package.json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:dev": "env-cmd -f .env.development react-scripts build",
    "build:prod": "env-cmd -f .env.production react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "deploy:dev": "npm run build:dev && aws s3 sync build/ s3://cafe-dev-bucket",
    "deploy:prod": "npm run build:prod && aws s3 sync build/ s3://cafe-prod-bucket"
  }
}
```

### CI/CD (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Build
        run: npm run build:prod
        env:
          REACT_APP_API_URL: ${{ secrets.PROD_API_URL }}

      - name: Deploy to AWS S3
        run: |
          aws s3 sync build/ s3://cafe-prod-bucket --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 문서화 및 유지보수

### 코드 문서화
```typescript
/**
 * 예약 생성 API 호출
 *
 * @param data - 예약 생성 데이터
 * @param data.cafeId - 카페 ID
 * @param data.userId - 사용자 ID
 * @param data.seatId - 좌석 ID
 * @param data.reservationDate - 예약 날짜
 * @param data.startTime - 시작 시간
 * @param data.endTime - 종료 시간
 * @returns 생성된 예약 정보
 * @throws {ApiError} API 요청 실패 시
 *
 * @example
 * ```typescript
 * const reservation = await createReservation({
 *   cafeId: 1,
 *   userId: 123,
 *   seatId: 5,
 *   reservationDate: new Date('2025-01-20'),
 *   startTime: '14:00',
 *   endTime: '16:00'
 * });
 */
export const createReservation = async (
  data: IReservationCreate
): Promise<IReservation> => {
  // ...
};
```

### API 문서 관리
```markdown
# API Documentation

## 예약 API

### 예약 생성
**POST** `/api/reservations`

**Request Body:**
json
{
  "cafeId": 1,
  "userId": 123,
  "seatId": 5,
  "reservationDate": "2025-01-20",
  "startTime": "14:00",
  "endTime": "16:00"
}


**Response (200):**
json
{
  "id": 456,
  "cafeId": 1,
  "userId": 123,
  "seatId": 5,
  "reservationDate": "2025-01-20",
  "startTime": "14:00",
  "endTime": "16:00",
  "status": "CONFIRMED",
  "createdAt": "2025-01-15T10:30:00Z"
}


**Error Responses:**
- `400 Bad Request` - 잘못된 요청 데이터
- `401 Unauthorized` - 인증 실패
- `404 Not Found` - 카페 또는 좌석을 찾을 수 없음
- `409 Conflict` - 이미 예약된 시간대
```

### 변경 이력 관리
```markdown
# CHANGELOG.md

## [0.3.0] - 2025-02-15
### Added
- 관리자 대시보드 통계 기능
- 실시간 좌석 상태 동기화 (Socket.io)
- 예약 알림 푸시 기능

### Changed
- 예약 목록 페이지 UI 개선
- API 응답 속도 최적화 (Redis 캐싱)

### Fixed
- 중복 예약 방지 로직 버그 수정
- 날짜 선택 캘린더 한국 시간대 이슈 해결

## [0.2.0] - 2025-01-30
### Added
- 예약 생성/조회/수정/삭제 기능
- 사용자 인증 (JWT)
- 카페 검색 및 필터링

## [0.1.0] - 2025-01-15
### Added
- 프로젝트 초기 설정
- 기본 React 앱 구조
- TypeScript 설정
```

## 팀 커뮤니케이션

### 주간 미팅
- **일시**: 매주 월요일 10:00 AM
- **참석**: 전체 팀원
- **안건**:
  - 지난 주 작업 리뷰
  - 이번 주 목표 및 할당
  - 이슈 및 블로커 공유
  - 기술 토론

### 데일리 스탠드업 (선택)
- **일시**: 매일 오전 9:30 AM (15분)
- **형식**: 각자 3가지 공유
  1. 어제 한 일
  2. 오늘 할 일
  3. 블로커 또는 도움 요청

### 이슈 트래킹
- **GitHub Issues** 활용
- 라벨 분류:
  - `bug` - 버그 수정
  - `feature` - 새로운 기능
  - `enhancement` - 기능 개선
  - `documentation` - 문서 작업
  - `question` - 질문 및 논의
  - `priority:high` - 높은 우선순위
  - `priority:medium` - 중간 우선순위
  - `priority:low` - 낮은 우선순위

### 디자인 협업
- **Figma** 파일 공유 및 코멘트
- 디자인 변경 시 개발팀에 알림
- 구현 전 디자인 시안 확인 및 피드백
