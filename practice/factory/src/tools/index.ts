import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerAnalyzeCodebaseTool } from './analyzeCodebase.js';
import { registerGenerateDocumentationTool } from './generateDocumentation.js';
import { registerDetectMissingDocsTool } from './detectMissingDocs.js';
import { registerSuggestImprovementsTool } from './suggestImprovements.js';

export function registerTools(server: McpServer): void {
  registerAnalyzeCodebaseTool(server);
  registerGenerateDocumentationTool(server);
  registerDetectMissingDocsTool(server);
  registerSuggestImprovementsTool(server);
}
