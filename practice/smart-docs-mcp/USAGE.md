# Smart Docs MCP Server 사용 가이드

## 설치

1. 프로젝트 클론 또는 다운로드
2. 의존성 설치:
```bash
npm install
```

3. 빌드:
```bash
npm run build
```

## Claude Desktop 설정

Claude Desktop의 설정 파일에 다음 내용을 추가하세요:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "smart-docs": {
      "command": "node",
      "args": ["/절대/경로/practice/smart-docs-mcp/dist/index.js"]
    }
  }
}
```

## 사용 예시

### 1. 코드베이스 분석

프로젝트의 전체 구조를 분석하고 함수, 클래스, import/export 정보를 추출합니다.

```
사용자: 현재 프로젝트의 src 디렉토리를 분석해줘

Claude: analyze_codebase 도구를 사용하여 분석하겠습니다.
{
  "path": "./src",
  "excludePatterns": ["**/*.test.ts", "**/node_modules/**"]
}
```

**결과**:
- 전체 파일 목록
- 각 파일의 함수 및 클래스 정보
- 코드 라인 수 통계
- 언어별 파일 수

### 2. 문서 자동 생성

분석된 코드베이스를 기반으로 마크다운 문서를 자동 생성합니다.

```
사용자: src 디렉토리에 대한 API 문서를 생성해줘

Claude: generate_documentation 도구를 사용하겠습니다.
{
  "path": "./src",
  "outputPath": "./docs/API.md"
}
```

**결과**:
- 함수 시그니처와 파라미터 설명
- 클래스 구조 및 메서드 목록
- 파일 간 의존성
- 자동 생성된 마크다운 문서

### 3. 누락된 문서 탐지

심각도 수준(critical, medium, low)별로 문서가 누락된 코드를 찾아냅니다.

```
사용자: 프로젝트에서 문서화가 누락된 중요한 함수를 찾아줘

Claude: detect_missing_docs 도구를 사용하겠습니다.
{
  "path": "./src",
  "severity": ["critical", "medium"]
}
```

**결과**:
- **Critical**:
  - Public API 함수 (문서 없음)
  - 복잡도 10 이상의 함수
  - 5개 이상 메서드를 가진 클래스
- **Medium**: 내부 함수 및 클래스
- **Low**: Private/Helper 함수

### 4. 문서 개선 제안

기존 문서를 분석하여 구조, 명확성, 완전성, 예제 측면에서 개선안을 제시합니다.

```
사용자: 기존 문서를 개선할 수 있는 방법을 제안해줘

Claude: suggest_improvements 도구를 사용하겠습니다.
{
  "path": "./src",
  "types": ["structure", "clarity", "examples"]
}
```

**결과**:
- **Structure**: JSDoc 형식 제안
- **Clarity**: 더 자세한 설명 추가 제안
- **Completeness**: 누락된 파라미터 설명 추가
- **Examples**: 사용 예제 코드 제안

## 실전 워크플로우

### 워크플로우 1: 새 프로젝트 문서화

1. **분석**: `analyze_codebase`로 프로젝트 구조 파악
2. **탐지**: `detect_missing_docs`로 critical 항목 찾기
3. **문서 작성**: 누락된 문서 수동 작성
4. **생성**: `generate_documentation`으로 최종 문서 생성

### 워크플로우 2: 기존 문서 개선

1. **분석**: `analyze_codebase`로 현재 상태 확인
2. **제안**: `suggest_improvements`로 개선점 파악
3. **수정**: 제안사항 반영하여 문서 개선
4. **검증**: `detect_missing_docs`로 개선 확인

### 워크플로우 3: 코드 리뷰 준비

1. **탐지**: `detect_missing_docs`로 critical/medium 이슈 찾기
2. **문서화**: 발견된 이슈 해결
3. **생성**: `generate_documentation`으로 리뷰용 문서 생성
4. **개선**: `suggest_improvements`로 최종 품질 향상

## 고급 사용법

### 특정 파일 패턴만 분석

```json
{
  "path": "./src",
  "includePatterns": ["**/api/**/*.ts", "**/services/**/*.ts"],
  "excludePatterns": ["**/*.test.ts"]
}
```

### Private 함수 포함 문서 생성

```json
{
  "path": "./src",
  "includePrivate": true
}
```

### 특정 개선 타입만 제안

```json
{
  "path": "./src/utils",
  "types": ["examples"]
}
```

## 트러블슈팅

### 문제: 파서 오류 발생

**원인**: 지원하지 않는 언어 또는 문법 오류

**해결**:
- 지원 언어 확인: TypeScript, JavaScript, Python만 지원
- 문법 오류 수정 후 재시도

### 문제: 파일을 찾을 수 없음

**원인**: 잘못된 경로 또는 excludePatterns

**해결**:
- 절대 경로 사용
- excludePatterns 확인

### 문제: 메모리 부족

**원인**: 대규모 코드베이스 분석

**해결**:
- includePatterns로 범위 제한
- 디렉토리별로 분할 분석

## 팁

1. **점진적 문서화**: critical → medium → low 순으로 처리
2. **정기적 검증**: CI/CD에 `detect_missing_docs` 통합
3. **자동 생성**: pre-commit hook으로 문서 자동 업데이트
4. **품질 관리**: `suggest_improvements`를 정기적으로 실행

## 지원

문제가 발생하면 GitHub Issues에 등록해주세요.
