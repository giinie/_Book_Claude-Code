import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { performAnalysis } from '../services/analysisService.js';

const suggestionInput = z.object({
  rootPath: z
    .string()
    .min(1, '분석할 경로를 입력하세요.')
    .describe('분석 루트 경로'),
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

type SuggestArgs = z.infer<typeof suggestionInput>;

function renderSuggestionsMarkdown(analysis: Awaited<ReturnType<typeof performAnalysis>>): string {
  const header = '# 문서화 개선 제안\n';

  if (!analysis.suggestions.length) {
    return `${header}\n- 추가 개선 제안이 없습니다.`;
  }

  const items = analysis.suggestions
    .map((suggestion) => {
      const targets = suggestion.targets.length
        ? suggestion.targets.map((target) => `  - ${target}`).join('\n')
        : '  - 대상 없음';
      return `- **${suggestion.title}** (${suggestion.impact})\n  ${suggestion.description}\n${targets}`;
    })
    .join('\n');

  return `${header}\n${items}`;
}

export function registerSuggestImprovementsTool(server: McpServer): void {
  server.registerTool(
    'suggest_improvements',
    {
      title: '개선 제안',
      description: '문서화와 관련된 개선 사항을 제안합니다.',
      inputSchema: suggestionInput.shape,
    },
    async ({ rootPath, maxFiles, excludePatterns }: SuggestArgs) => {
      const analysis = await performAnalysis({ rootPath, maxFiles, excludePatterns });

      return {
        content: [
          {
            type: 'text',
            text: renderSuggestionsMarkdown(analysis),
          },
        ],
      };
    },
  );
}
