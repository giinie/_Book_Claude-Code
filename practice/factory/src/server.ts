import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerTools } from './tools/index.js';

export function createSmartDocsServer(): McpServer {
  const server = new McpServer(
    {
      name: 'smart-docs-mcp',
      version: '0.1.0',
    },
    {
      instructions:
        '이 서버는 코드베이스를 분석하여 문서를 생성하고 개선점을 제안합니다. analyze_codebase, generate_documentation, detect_missing_docs, suggest_improvements 도구를 제공합니다.',
      capabilities: {
        tools: {},
      },
    },
  );

  registerTools(server);
  return server;
}

export async function startSmartDocsServer(): Promise<void> {
  const server = createSmartDocsServer();
  const transport = new StdioServerTransport();

  transport.onclose = () => {
    process.exit(0);
  };

  transport.onerror = (error: unknown) => {
    const normalized = error instanceof Error ? error : new Error(String(error));
    console.error('Transport error:', normalized);
    process.exit(1);
  };

  try {
    await server.connect(transport);
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}
