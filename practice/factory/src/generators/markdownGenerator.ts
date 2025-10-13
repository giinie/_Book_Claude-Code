import { AnalysisResult, MissingDocIssue, Suggestion } from '../types.js';

function renderSummary(result: AnalysisResult): string {
  const { summary } = result;
  const languageRows = Object.entries(summary.languages)
    .map(([language, count]) => `| ${language} | ${count} |\n`)
    .join('');

  return (
    '## 개요\n\n' +
    `- 분석 경로: \\n${summary.rootPath}\n` +
    `- 총 파일 수: ${summary.totalFiles}\n` +
    `- 총 엔티티: ${summary.totalEntities}\n` +
    `- 문서화 커버리지: ${summary.documentationCoverage}%\n\n` +
    '### 언어별 파일 수\n\n' +
    '| 언어 | 파일 수 |\n| --- | --- |\n' +
    (languageRows || '| - | - |\n') +
    '\n'
  );
}

function renderMissingDocs(issues: MissingDocIssue[]): string {
  if (!issues.length) {
    return '## 문서 누락 현황\n\n- 문서 누락이 발견되지 않았습니다.\n';
  }

  const header = '| 심각도 | 위치 | 이름 | 근거 |\n| --- | --- | --- | --- |\n';

  const rows = issues
    .map((issue) => {
      const location = issue.summary ?? `${issue.location.line}행`;
      return `| ${issue.severity} | ${location} | ${issue.name} | ${issue.rationale} |\n`;
    })
    .join('');

  return `## 문서 누락 현황\n\n${header}${rows}`;
}

function renderSuggestions(suggestions: Suggestion[]): string {
  const items = suggestions
    .map((suggestion) => {
      const targets = suggestion.targets.length
        ? suggestion.targets.map((target) => `  - ${target}`).join('\n')
        : '  - 해당 사항 없음';
      return `- **${suggestion.title}** (${suggestion.impact})\n  ${suggestion.description}\n${targets}`;
    })
    .join('\n');

  return `## 개선 제안\n\n${items || '- 제안 없음'}`;
}

function renderFileDetails(result: AnalysisResult): string {
  if (!result.files.length) {
    return '## 파일별 상세 분석\n\n- 분석 가능한 파일이 없습니다.';
  }

  const sections = result.files.map((file) => {
    const documentedRate = file.entityMetrics.total
      ? Number(((file.entityMetrics.documented / file.entityMetrics.total) * 100).toFixed(2))
      : 100;

    const entities = file.entities
      .map((entity) => {
        const status = entity.hasDoc ? '✅' : '⚠️';
        return `| ${status} | ${entity.type} | ${entity.name} | ${entity.location.line} | ${
          entity.exported ? '예' : '아니오'
        } | ${entity.complexityScore} |`;
      })
      .join('\n');

    return (
      `### ${file.path}\n\n` +
      `- 언어: ${file.language}\n` +
      `- 라인 수: ${file.linesOfCode}\n` +
      `- 엔티티: 총 ${file.entityMetrics.total}, 문서화 ${file.entityMetrics.documented}, 누락 ${file.entityMetrics.undocumented}\n` +
      `- 파일 문서화 비율: ${documentedRate}%\n\n` +
      '| 문서 | 유형 | 이름 | 라인 | 외부 노출 | 복잡도 |\n| --- | --- | --- | --- | --- | --- |\n' +
      (entities || '| - | - | - | - | - | - |') +
      '\n'
    );
  });

  return `## 파일별 상세 분석\n\n${sections.join('\n')}`;
}

export function generateDocumentationMarkdown(result: AnalysisResult): string {
  return [
    '# Smart Docs 리포트',
    renderSummary(result),
    renderMissingDocs(result.missingDocs),
    renderSuggestions(result.suggestions),
    renderFileDetails(result),
  ].join('\n\n');
}
