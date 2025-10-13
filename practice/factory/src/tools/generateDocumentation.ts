import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { performAnalysis } from '../services/analysisService.js';
import { generateDocumentationMarkdown } from '../generators/markdownGenerator.js';

const generateInput = z.object({
  rootPath: z
    .string()
    .min(1, '문서를 생성할 경로를 입력하세요.')
    .describe('문서를 생성할 코드베이스 루트 경로'),
  maxFiles: z
    .number()
    .int()
    .positive()
    .max(5000)
    .optional()
    .describe('분석할 최대 파일 수 (기본값: 제한 없음)'),
  excludePatterns: z
    .array(z.string())
    .optional()
    .describe('제외할 경로 패턴 (glob 유사 표현)'),
});

type GenerateArgs = z.infer<typeof generateInput>;

export function registerGenerateDocumentationTool(server: McpServer): void {
  server.registerTool(
    'generate_documentation',
    {
      title: '문서 생성',
      description: '분석 결과를 기반으로 마크다운 문서를 생성합니다.',
      inputSchema: generateInput.shape,
    },
    async ({ rootPath, maxFiles, excludePatterns }: GenerateArgs) => {
      const analysis = await performAnalysis({ rootPath, maxFiles, excludePatterns });
      const markdown = generateDocumentationMarkdown(analysis);

      return {
        content: [
          {
            type: 'text',
            text: markdown,
          },
        ],
      };
    },
  );
}
