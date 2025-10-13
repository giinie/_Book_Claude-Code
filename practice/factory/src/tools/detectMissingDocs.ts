import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { performAnalysis } from '../services/analysisService.js';

const detectInput = z.object({
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

type DetectArgs = z.infer<typeof detectInput>;

function renderMissingDocsMarkdown(analysis: Awaited<ReturnType<typeof performAnalysis>>): string {
  if (!analysis.missingDocs.length) {
    return '# 문서 누락 감지\n\n- 문서 누락이 발견되지 않았습니다.';
  }

  const grouped = analysis.missingDocs.reduce<Record<string, typeof analysis.missingDocs>>(
    (acc, issue) => {
      if (!acc[issue.severity]) {
        acc[issue.severity] = [];
      }
      acc[issue.severity].push(issue);
      return acc;
    },
    {},
  );

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => {
      const order: Record<string, number> = { critical: 0, medium: 1, low: 2 };
      return order[a] - order[b];
    })
    .map(([severity, issues]) => {
      const rows = issues
        .map((issue) => `| ${issue.name} | ${issue.summary ?? issue.location.line} | ${issue.rationale} |`)
        .join('\n');
      return `## ${severity.toUpperCase()} (${issues.length})\n\n| 엔티티 | 위치 | 근거 |\n| --- | --- | --- |\n${rows}`;
    });

  return ['# 문서 누락 감지', ...sections].join('\n\n');
}

export function registerDetectMissingDocsTool(server: McpServer): void {
  server.registerTool(
    'detect_missing_docs',
    {
      title: '문서 누락 감지',
      description: '문서가 없는 구성 요소를 찾아 심각도와 함께 보고합니다.',
      inputSchema: detectInput.shape,
    },
    async ({ rootPath, maxFiles, excludePatterns }: DetectArgs) => {
      const analysis = await performAnalysis({ rootPath, maxFiles, excludePatterns });

      return {
        content: [
          {
            type: 'text',
            text: renderMissingDocsMarkdown(analysis),
          },
        ],
      };
    },
  );
}
