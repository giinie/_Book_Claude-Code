# Smart Docs MCP 사용 가이드

## 빠른 시작

### 1. 설치

```bash
cd smart-docs-mcp
npm install
npm run build
```

### 2. MCP 클라이언트 설정

Claude Desktop 또는 다른 MCP 클라이언트의 설정 파일에 추가:

```json
{
  "mcpServers": {
    "smart-docs": {
      "command": "node",
      "args": ["/Users/giinie/JWS/ClaudeCode/_Book_Claude-Code/practice/smart-docs-mcp/dist/index.js"]
    }
  }
}
```

## 도구 사용 예제

### 코드베이스 분석

프로젝트의 문서화 현황을 파악합니다:

```
코드베이스 분석해줘: /Users/giinie/JWS/ClaudeCode/my-project
```

결과:
- 전체 파일 수
- 언어별 파일 분포
- 함수/클래스 개수
- 문서화된 항목 개수
- 문서화 커버리지 비율

### 문서 자동 생성

마크다운 형식의 API 문서를 자동 생성:

```
/Users/giinie/JWS/ClaudeCode/my-project 디렉토리의 문서를 생성하고 
/Users/giinie/JWS/ClaudeCode/my-project/DOCS.md에 저장해줘
```

### 누락된 문서 감지

문서가 없는 코드를 심각도별로 찾아냅니다:

```
/Users/giinie/JWS/ClaudeCode/my-project에서 문서가 누락된 부분을 찾아줘
```

심각도 수준:
- **Critical**: 공개 API, 클래스, 인터페이스
- **Medium**: 공개 메서드, 주요 함수
- **Low**: 내부 유틸리티, private 메서드

### 문서 개선 제안

기존 문서의 품질을 평가하고 개선 방안 제시:

```
/Users/giinie/JWS/ClaudeCode/my-project의 문서를 검토하고 개선점을 제안해줘
```

제안 유형:
- 파라미터 설명 누락
- 반환값 설명 누락
- 너무 짧은 설명
- 사용 예제 부족

## 실전 워크플로우

### 1. 새 프로젝트 문서화

```bash
# 1단계: 현황 파악
analyze_codebase(/path/to/project)

# 2단계: 누락된 문서 확인
detect_missing_docs(/path/to/project)

# 3단계: 문서 작성 후 검토
suggest_improvements(/path/to/project)

# 4단계: 최종 문서 생성
generate_documentation(/path/to/project, /path/to/project/API.md)
```

### 2. 기존 프로젝트 문서 품질 향상

```bash
# 현재 문서화 수준 확인
analyze_codebase(/path/to/project)

# 개선점 파악
suggest_improvements(/path/to/project)

# Critical 항목부터 수정
detect_missing_docs(/path/to/project)
```

## 팁

1. **정기적 분석**: CI/CD에 통합하여 문서화 커버리지 모니터링
2. **우선순위**: Critical → Medium → Low 순으로 처리
3. **자동화**: `generate_documentation`으로 정기적으로 문서 갱신
4. **코드 리뷰**: PR 시 `suggest_improvements`로 문서 품질 체크

## 제한사항

- `node_modules`, `dist`, `.git` 디렉토리는 자동 제외
- 현재 TypeScript, JavaScript, Python만 지원
- JSDoc, docstring 형식의 주석을 문서로 인식
