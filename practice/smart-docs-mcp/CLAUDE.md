# Smart Docs MCP - AI Agent Guide

## Quick Commands

### Build & Test
```bash
npm install
npm run build
npm run dev
```

### Testing Tools
```bash
node test.js
```

## MCP Configuration

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "smart-docs": {
      "command": "node",
      "args": [
        "/Users/giinie/JWS/ClaudeCode/_Book_Claude-Code/practice/smart-docs-mcp/dist/index.js"
      ]
    }
  }
}
```

## Architecture

### Core Components
- **Parsers**: Language-specific code parsers using tree-sitter
  - `TypeScriptParser`: Handles .ts, .tsx, .js, .jsx
  - `PythonParser`: Handles .py files
  
- **Tools**: Four main MCP tools
  - `analyze_codebase`: Documentation coverage statistics
  - `generate_documentation`: Markdown doc generation
  - `detect_missing_docs`: Find undocumented code (with severity)
  - `suggest_improvements`: Documentation quality suggestions

- **Generators**: Documentation formatters
  - `markdown.ts`: Generates markdown from parsed code

### File Structure
```
src/
├── index.ts           # MCP server
├── types/index.ts     # Type definitions
├── parsers/
│   ├── base.ts        # Base parser
│   ├── typescript.ts  # TS/JS parser
│   ├── python.ts      # Python parser
│   └── index.ts       # Parser factory
├── tools/             # MCP tools
└── generators/        # Doc generators
```

## Testing Results

✅ All 4 tools working correctly
- Analyzed 12 TypeScript files
- Detected 34 missing documentation items
- Generated 34 improvement suggestions
- Created comprehensive markdown documentation

## Known Limitations

- Only supports TypeScript, JavaScript, Python
- Skips `node_modules`, `dist`, `.git` automatically
- Requires proper JSDoc/docstring format for detection
