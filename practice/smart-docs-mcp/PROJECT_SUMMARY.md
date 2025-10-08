# Smart Docs MCP Server - 프로젝트 요약

## 프로젝트 개요

Production-ready MCP 서버로, TypeScript, JavaScript, Python 코드베이스를 분석하고 문서를 자동 생성하는 도구입니다.

## 주요 기능

### 1. 코드베이스 분석 (analyze_codebase)
- 함수, 클래스, import/export 추출
- 코드 복잡도 계산
- 라인 수 통계
- 다중 언어 지원 (TypeScript, JavaScript, Python)

### 2. 문서 자동 생성 (generate_documentation)
- 마크다운 형식 문서 자동 생성
- 함수 시그니처 및 파라미터 설명
- 클래스 구조 및 메서드 목록
- 파일 간 의존성 문서화

### 3. 누락 문서 탐지 (detect_missing_docs)
- 심각도 수준별 분류 (critical, medium, low)
  - Critical: Public API, 복잡도 10+ 함수, 5+ 메서드 클래스
  - Medium: 내부 함수 및 클래스
  - Low: Private/Helper 함수
- 미문서화 파라미터 탐지

### 4. 문서 개선 제안 (suggest_improvements)
- 구조(structure): JSDoc 형식 제안
- 명확성(clarity): 상세한 설명 추가
- 완전성(completeness): 누락된 파라미터 문서화
- 예제(examples): 사용 예제 코드 제안

## 기술 스택

### 핵심 기술
- **Tree-sitter**: 고성능 코드 파싱
- **MCP SDK**: Model Context Protocol 구현
- **TypeScript**: 타입 안전성 보장
- **Zod**: 런타임 타입 검증

### 의존성
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "tree-sitter": "^0.22.1",
    "tree-sitter-typescript": "^0.23.2",
    "tree-sitter-javascript": "^0.23.0",
    "tree-sitter-python": "^0.23.5",
    "glob": "^11.0.0",
    "zod": "^3.23.8"
  }
}
```

## 프로젝트 구조

```
smart-docs-mcp/
├── src/
│   ├── index.ts                 # MCP 서버 엔트리포인트
│   ├── types/
│   │   └── index.ts             # 타입 정의
│   ├── parsers/                 # Tree-sitter 파서
│   │   ├── baseParser.ts        # 파서 베이스 클래스
│   │   ├── typescriptParser.ts  # TS/JS 파서
│   │   ├── pythonParser.ts      # Python 파서
│   │   └── index.ts             # 파서 팩토리
│   ├── generators/              # 문서 생성기
│   │   ├── markdownGenerator.ts # 마크다운 생성
│   │   └── index.ts
│   ├── tools/                   # MCP 도구 구현
│   │   ├── analyzeCodebase.ts
│   │   ├── generateDocumentation.ts
│   │   ├── detectMissingDocs.ts
│   │   ├── suggestImprovements.ts
│   │   └── index.ts
│   └── utils/                   # 유틸리티
│       ├── logger.ts            # 로깅
│       ├── errors.ts            # 에러 핸들링
│       └── fileSystem.ts        # 파일 시스템 작업
├── dist/                        # 빌드 출력
├── tests/                       # 테스트 (향후 추가)
├── package.json
├── tsconfig.json
├── README.md                    # 영문 문서
├── USAGE.md                     # 한글 사용 가이드
└── .gitignore
```

## 아키텍처 설계

### 레이어 구조

1. **MCP Server Layer** (index.ts)
   - MCP 프로토콜 구현
   - 도구 등록 및 요청 라우팅
   - 에러 핸들링

2. **Tools Layer** (tools/)
   - 4개 MCP 도구 구현
   - 입력 검증 (Zod 스키마)
   - 비즈니스 로직 조율

3. **Core Logic Layer** (parsers/, generators/)
   - Tree-sitter 기반 파싱
   - 문서 생성 로직
   - 언어별 특화 처리

4. **Infrastructure Layer** (utils/)
   - 로깅
   - 파일 시스템 작업
   - 에러 핸들링

### 주요 설계 패턴

- **Factory Pattern**: 파서 팩토리로 언어별 파서 생성
- **Strategy Pattern**: 언어별 파싱 전략 분리
- **Template Method**: BaseParser의 공통 로직
- **Builder Pattern**: 마크다운 생성기의 문서 빌드

## 구현 세부사항

### 1. Tree-sitter 통합
```typescript
// 각 언어별 파서 초기화
const parser = new Parser();
parser.setLanguage(TypeScriptLanguage);

// AST 파싱
const tree = parser.parse(content);
const functions = parseFunctions(tree, content);
```

### 2. 심각도 판정 알고리즘
```typescript
function determineSeverity(type, item, context) {
  // Public API → Critical
  // 복잡도 > 10 → Critical
  // 메서드 5개 이상 클래스 → Critical
  // Private 함수 → Low
  // 나머지 → Medium
}
```

### 3. 문서 개선 분석
```typescript
// 구조 검사: @param, @returns 존재 여부
// 명확성 검사: 최소 20자 이상
// 완전성 검사: 모든 파라미터 문서화
// 예제 검사: @example, ``` 코드 블록
```

## 에러 핸들링

### 커스텀 에러 타입
- `ParserError`: 파싱 오류
- `FileSystemError`: 파일 시스템 오류
- `ValidationError`: 입력 검증 오류
- `ConfigurationError`: 설정 오류

### 에러 전파
```typescript
try {
  // 도구 실행
} catch (error) {
  const errorInfo = handleError(error);
  throw new McpError(ErrorCode.InternalError, errorInfo.error);
}
```

## 성능 최적화

1. **파서 캐싱**: 언어별 파서 인스턴스 재사용
2. **점진적 분석**: 파일 단위로 분석하여 메모리 효율성
3. **효율적인 Tree-sitter**: 빠르고 정확한 파싱
4. **스트림 처리**: 대용량 파일 효율적 처리

## 빌드 및 실행

### 빌드
```bash
npm install --legacy-peer-deps
npm run build
```

### 실행
```bash
node dist/index.js
```

### Claude Desktop 설정
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

## 향후 개선 사항

### 단기 (Phase 1)
- [ ] Jest 테스트 추가
- [ ] JSDoc/TSDoc 형식 지원
- [ ] 증분 분석 (변경된 파일만)
- [ ] 문서 템플릿 커스터마이징

### 중기 (Phase 2)
- [ ] Go, Rust, Java 지원
- [ ] HTML/PDF 출력 형식
- [ ] Git 통합 (커밋 메시지 기반 문서화)
- [ ] CI/CD 통합

### 장기 (Phase 3)
- [ ] AI 기반 문서 생성
- [ ] 다국어 문서 지원
- [ ] 인터랙티브 문서 생성
- [ ] VS Code 확장 프로그램

## 기술적 도전 과제

### 해결된 문제
1. **Tree-sitter 버전 호환성**
   - 문제: tree-sitter 라이브러리 간 peer dependency 충돌
   - 해결: `--legacy-peer-deps` 사용 및 타입 캐스팅

2. **TypeScript 타입 추론**
   - 문제: tree-sitter-typescript 타입 선언 부재
   - 해결: `@ts-ignore` 및 `as any` 타입 캐스팅

3. **MCP SDK 통합**
   - 문제: 동적 인자 타입 검증
   - 해결: Zod 스키마를 활용한 런타임 검증

## 라이선스

MIT License

## 작성자

Gi-in Jeong

## 참고 자료

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
