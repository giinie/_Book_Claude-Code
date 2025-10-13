# Smart Docs MCP

A production-ready Model Context Protocol (MCP) server for intelligent codebase analysis and documentation generation.

## Features

- **Analyze Codebase**: Get comprehensive statistics about your documentation coverage
- **Generate Documentation**: Automatically create markdown documentation from your code
- **Detect Missing Docs**: Find undocumented functions, classes, and methods with severity levels
- **Suggest Improvements**: Get actionable suggestions to improve existing documentation

## Supported Languages

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- Python (`.py`)

## Installation

```bash
npm install
npm run build
```

## Usage

### As MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "smart-docs": {
      "command": "node",
      "args": ["/path/to/smart-docs-mcp/dist/index.js"]
    }
  }
}
```

### Available Tools

#### 1. analyze_codebase

Analyzes a codebase and returns documentation statistics.

**Parameters:**
- `directory` (string, required): Absolute path to the directory to analyze

**Returns:**
```json
{
  "totalFiles": 42,
  "filesByLanguage": {
    "typescript": 30,
    "javascript": 10,
    "python": 2
  },
  "totalFunctions": 156,
  "totalClasses": 23,
  "documentedFunctions": 120,
  "documentedClasses": 18,
  "documentationCoverage": 77
}
```

#### 2. generate_documentation

Generates markdown documentation for your codebase.

**Parameters:**
- `directory` (string, required): Absolute path to the directory to document
- `outputPath` (string, optional): Path to save the documentation file

**Returns:** Markdown formatted documentation

#### 3. detect_missing_docs

Detects undocumented code elements with severity levels.

**Parameters:**
- `directory` (string, required): Absolute path to the directory to check

**Returns:**
```json
[
  {
    "type": "class",
    "name": "UserController",
    "file": "/path/to/file.ts",
    "line": 15,
    "severity": "critical",
    "reason": "Missing documentation for class 'UserController'"
  }
]
```

**Severity Levels:**
- **Critical**: Public classes, interfaces, and exported functions
- **Medium**: Public methods and commonly used functions
- **Low**: Private methods and internal utilities

#### 4. suggest_improvements

Analyzes existing documentation and suggests improvements.

**Parameters:**
- `directory` (string, required): Absolute path to the directory to analyze

**Returns:**
```json
[
  {
    "file": "/path/to/file.ts",
    "line": 42,
    "type": "missing_param_docs",
    "severity": "medium",
    "message": "Function 'processData' documentation missing parameter details",
    "suggestion": "Add @param tags for: data, options"
  }
]
```

## Project Structure

```
smart-docs-mcp/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── types/             # TypeScript type definitions
│   ├── parsers/           # Language-specific parsers
│   │   ├── base.ts        # Base parser class
│   │   ├── typescript.ts  # TypeScript/JavaScript parser
│   │   ├── python.ts      # Python parser
│   │   └── index.ts       # Parser factory
│   ├── tools/             # MCP tool implementations
│   │   ├── analyzeCodebase.ts
│   │   ├── generateDocumentation.ts
│   │   ├── detectMissingDocs.ts
│   │   └── suggestImprovements.ts
│   └── generators/        # Documentation generators
│       └── markdown.ts    # Markdown generator
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Run
npm start
```

## Error Handling

All tools include comprehensive error handling:
- Invalid directory paths are caught and reported
- Parse errors are logged without stopping analysis
- Malformed code is handled gracefully
- All errors return descriptive messages

## License

MIT
