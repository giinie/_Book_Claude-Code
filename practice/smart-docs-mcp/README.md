# Smart Docs MCP Server

Production-ready MCP server for intelligent codebase analysis and documentation generation.

## Features

- 🔍 **Codebase Analysis**: Comprehensive analysis of TypeScript, JavaScript, and Python codebases
- 📝 **Documentation Generation**: Automatic generation of well-structured markdown documentation
- 🔎 **Missing Docs Detection**: Identifies undocumented code with severity levels (critical, medium, low)
- 💡 **Improvement Suggestions**: AI-powered suggestions to enhance existing documentation

## Supported Languages

- TypeScript (.ts, .tsx)
- JavaScript (.js, .jsx, .mjs, .cjs)
- Python (.py)

## Installation

```bash
npm install
npm run build
```

## Usage

### As an MCP Server

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "smart-docs": {
      "command": "node",
      "args": ["/path/to/smart-docs-mcp/dist/index.js"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Available Tools

#### 1. `analyze_codebase`

Analyzes a codebase and returns comprehensive structure information.

**Parameters:**
- `path` (string, required): Path to the codebase directory or file
- `includePatterns` (string[], optional): Glob patterns for files to include
- `excludePatterns` (string[], optional): Glob patterns for files to exclude
- `maxDepth` (number, optional): Maximum directory depth to analyze

**Example:**
```json
{
  "path": "./src",
  "includePatterns": ["**/*.ts"],
  "excludePatterns": ["**/*.test.ts"]
}
```

**Returns:**
```typescript
{
  rootPath: string;
  files: FileAnalysis[];
  summary: {
    totalFiles: number;
    totalFunctions: number;
    totalClasses: number;
    totalLines: number;
    languages: Record<Language, number>;
  };
  analyzedAt: string;
}
```

#### 2. `generate_documentation`

Generates comprehensive markdown documentation for a codebase or individual file.

**Parameters:**
- `path` (string, required): Path to the codebase directory or file
- `outputPath` (string, optional): Optional output path for the documentation file
- `includePrivate` (boolean, optional, default: false): Include private functions and classes
- `format` (enum: 'markdown', optional, default: 'markdown'): Documentation format

**Example:**
```json
{
  "path": "./src",
  "outputPath": "./docs/API.md",
  "includePrivate": false
}
```

**Returns:**
```typescript
{
  filePath: string;
  content: string;
  format: 'markdown';
  generatedAt: string;
}
```

#### 3. `detect_missing_docs`

Detects missing documentation in code with severity levels.

**Parameters:**
- `path` (string, required): Path to the codebase directory or file
- `severity` (array, optional): Filter by severity levels: 'critical', 'medium', 'low'
- `includeTypes` (array, optional): Types to detect: 'function', 'class', 'parameter'

**Severity Levels:**
- **Critical**: Public APIs, complex functions (complexity > 10), large classes (> 5 methods)
- **Medium**: Internal functions and classes
- **Low**: Private/helper functions

**Example:**
```json
{
  "path": "./src",
  "severity": ["critical", "medium"],
  "includeTypes": ["function", "class"]
}
```

**Returns:**
```typescript
{
  missing: MissingDoc[];
  summary: {
    total: number;
    bySeverity: Record<Severity, number>;
    byType: Record<string, number>;
  };
}
```

#### 4. `suggest_improvements`

Analyzes existing documentation and suggests improvements.

**Parameters:**
- `path` (string, required): Path to the codebase directory or file
- `types` (array, optional): Types of improvements: 'structure', 'clarity', 'completeness', 'examples'

**Improvement Types:**
- **Structure**: Add proper formatting with parameter and return descriptions
- **Clarity**: Enhance brief documentation with more detail
- **Completeness**: Document missing parameters
- **Examples**: Add usage examples

**Example:**
```json
{
  "path": "./src",
  "types": ["structure", "examples"]
}
```

**Returns:**
```typescript
{
  improvements: Improvement[];
  summary: {
    total: number;
    byType: Record<string, number>;
  };
}
```

## Development

### Project Structure

```
smart-docs-mcp/
├── src/
│   ├── index.ts              # Main MCP server entry point
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── parsers/              # Tree-sitter based parsers
│   │   ├── baseParser.ts
│   │   ├── typescriptParser.ts
│   │   ├── pythonParser.ts
│   │   └── index.ts
│   ├── generators/           # Documentation generators
│   │   ├── markdownGenerator.ts
│   │   └── index.ts
│   ├── tools/                # MCP tools implementation
│   │   ├── analyzeCodebase.ts
│   │   ├── generateDocumentation.ts
│   │   ├── detectMissingDocs.ts
│   │   ├── suggestImprovements.ts
│   │   └── index.ts
│   └── utils/                # Utility functions
│       ├── logger.ts
│       ├── errors.ts
│       ├── fileSystem.ts
│       └── index.ts
├── tests/                    # Test files
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Environment Variables

- `LOG_LEVEL`: Set logging level (debug, info, warn, error). Default: info

## Error Handling

The server implements comprehensive error handling with custom error types:

- `ParserError`: Errors during code parsing
- `FileSystemError`: File system operation errors
- `ValidationError`: Input validation errors
- `ConfigurationError`: Configuration-related errors

All errors are properly logged and returned to the client with detailed information.

## Performance Considerations

- **Parser Caching**: Parsers are cached per language for better performance
- **Incremental Analysis**: Large codebases are analyzed file by file
- **Efficient Tree-sitter**: Uses tree-sitter for fast and accurate parsing
- **Stream Processing**: Handles large files efficiently

## License

MIT

## Author

Gi-in Jeong

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### Version 1.0.0
- Initial release
- Support for TypeScript, JavaScript, and Python
- Four tools: analyze_codebase, generate_documentation, detect_missing_docs, suggest_improvements
- Tree-sitter based parsing
- Comprehensive error handling
- Markdown documentation generation
- Severity-based missing documentation detection
