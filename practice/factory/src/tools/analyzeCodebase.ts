import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { performAnalysis } from '../services/analysisService.js';

const analyzeInput = z.object({
  rootPath: z
    .string()
    .min(1, '분석할 경로를 입력하세요.')
    .describe('분석 시작 루트 경로'),
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

type AnalyzeArgs = z.infer<typeof analyzeInput>;

function formatSummary(result: Awaited<ReturnType<typeof performAnalysis>>): string {
  const { summary } = result;
  const lines = [
    '# 코드베이스 분석 요약',
    `- 분석 경로: ${summary.rootPath}`,
    `- 총 파일 수: ${summary.totalFiles}`,
    `- 총 엔티티: ${summary.totalEntities}`,
    `- 문서화 커버리지: ${summary.documentationCoverage}%`,
    '',
    '## 언어별 파일 수',
  ];

  Object.entries(summary.languages).forEach(([language, count]) => {
    lines.push(`- ${language}: ${count}`);
  });

  const topFiles = result.files
    .sort((a, b) => b.entityMetrics.undocumented - a.entityMetrics.undocumented)
    .slice(0, 5)
    .map(
      (file) =>
        `- ${file.path} (미문서화 ${file.entityMetrics.undocumented}/${file.entityMetrics.total} 엔티티)`,
    );

  lines.push('', '## 문서화 우선순위 파일', topFiles.join('\n') || '- 해당 없음');

  return lines.join('\n');
}

export function registerAnalyzeCodebaseTool(server: McpServer): void {
  server.registerTool(
    'analyze_codebase',
    {
      title: '코드베이스 분석',
      description: '지정한 경로의 코드 구조와 문서화 상태를 분석합니다.',
      inputSchema: analyzeInput.shape,
    },
    async ({ rootPath, maxFiles, excludePatterns }: AnalyzeArgs) => {
      const analysis = await performAnalysis({ rootPath, maxFiles, excludePatterns });
      return {
        content: [
          {
            type: 'text',
            text: formatSummary(analysis),
          },
        ],
        _meta: {
          analysis,
        },
      };
    },
  );
}
