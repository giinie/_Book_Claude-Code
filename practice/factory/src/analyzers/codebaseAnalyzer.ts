import path from 'node:path';

import Parser from 'tree-sitter';

type SyntaxNode = Parser.SyntaxNode;

import {
  AnalysisResult,
  AnalysisSummary,
  CodeEntity,
  CodeEntityType,
  FileAnalysis,
  MissingDocIssue,
  SeverityLevel,
  SupportedLanguage,
  Suggestion,
} from '../types.js';
import { TreeSitterManager } from '../parsers/treeSitterManager.js';
import { walkCodeFiles } from '../utils/fileSystem.js';

const SUPPORTED_EXTENSIONS = new Map<string, SupportedLanguage>([
  ['.ts', 'typescript'],
  ['.tsx', 'typescript'],
  ['.js', 'javascript'],
  ['.jsx', 'javascript'],
  ['.mjs', 'javascript'],
  ['.cjs', 'javascript'],
  ['.py', 'python'],
]);

export interface AnalyzerOptions {
  maxFiles?: number;
  exclude?: (filePath: string) => boolean;
}

interface EntityExtractionContext {
  language: SupportedLanguage;
  filePath: string;
  relativePath: string;
  rootPath: string;
  content: string;
  tree: Parser.Tree;
}

export class CodebaseAnalyzer {
  private readonly parserManager = TreeSitterManager.getInstance();

  async analyze(rootPath: string, options: AnalyzerOptions = {}): Promise<AnalysisResult> {
    const normalizedRoot = path.resolve(rootPath);
    const files = await walkCodeFiles(normalizedRoot, {
      extensions: new Set(SUPPORTED_EXTENSIONS.keys()),
      maxFiles: options.maxFiles,
      exclude: options.exclude,
    });

    const fileAnalyses: FileAnalysis[] = [];
    const missingDocs: MissingDocIssue[] = [];

    for (const file of files) {
      const extension = path.extname(file.path).toLowerCase();
      const language = SUPPORTED_EXTENSIONS.get(extension);
      if (!language) {
        continue;
      }

      try {
        const tree = this.parserManager.parse(file.content, language);

        const analysis = this.analyzeFile({
          language,
          filePath: file.path,
          relativePath: file.relativePath,
          rootPath: normalizedRoot,
          content: file.content,
          tree,
        });

        fileAnalyses.push(analysis.fileAnalysis);
        missingDocs.push(...analysis.missingDocs);
      } catch (error) {
        missingDocs.push({
          name: 'ParserFailure',
          type: 'function',
          language,
          location: { line: 0, column: 0 },
          exported: false,
          hasDoc: false,
          complexityScore: 0,
          severity: 'medium',
          rationale: `파싱 오류 발생: ${(error as Error).message}`,
          summary: `파일 ${file.relativePath} 파싱 실패`,
        });
      }
    }

    const summary = this.buildSummary(normalizedRoot, fileAnalyses);
    const suggestions = this.buildSuggestions(summary, missingDocs);

    return {
      summary,
      files: fileAnalyses,
      missingDocs,
      suggestions,
    };
  }

  private analyzeFile(context: EntityExtractionContext): {
    fileAnalysis: FileAnalysis;
    missingDocs: MissingDocIssue[];
  } {
    const { language, content, filePath, relativePath, tree } = context;
    const entities = this.extractEntities(tree.rootNode, language, content, filePath, relativePath);

    const totalLines = content.split(/\r?\n/).length;
    const documented = entities.filter((entity) => entity.hasDoc).length;
    const undocumented = entities.length - documented;

    const missingDocs: MissingDocIssue[] = entities
      .filter((entity) => !entity.hasDoc)
      .map((entity) => ({
        ...entity,
        severity: this.calculateSeverity(entity),
        rationale: this.buildRationale(entity),
      }));

    const fileAnalysis: FileAnalysis = {
      path: filePath,
      language,
      linesOfCode: totalLines,
      entityMetrics: {
        total: entities.length,
        documented,
        undocumented,
        functions: entities.filter((entity) => entity.type === 'function').length,
        classes: entities.filter((entity) => entity.type === 'class').length,
        methods: entities.filter((entity) => entity.type === 'method').length,
      },
      entities,
    };

    return { fileAnalysis, missingDocs };
  }

  private extractEntities(
    node: SyntaxNode,
    language: SupportedLanguage,
    content: string,
    filePath: string,
    relativePath: string,
  ): CodeEntity[] {
    const entities: CodeEntity[] = [];

    const visit = (current: SyntaxNode, parentType?: string): void => {
      const typeInfo = this.identifyEntityType(current, language, parentType);
      if (typeInfo) {
        const name = this.extractName(current, language);
        if (name) {
          const hasDoc = this.hasDocumentation(current, language, content);
          const exported = this.isExported(current, language);
          const complexityScore = this.estimateComplexity(current, content);
          const location = {
            line: current.startPosition.row + 1,
            column: current.startPosition.column + 1,
          };

          entities.push({
            name,
            type: typeInfo,
            language,
            location,
            hasDoc,
            exported,
            complexityScore,
            summary: `${relativePath}:${location.line}`,
          });
        }
      }

      for (const child of current.namedChildren) {
        visit(child, current.type);
      }
    };

    visit(node);
    return entities;
  }

  private identifyEntityType(
    node: SyntaxNode,
    language: SupportedLanguage,
    parentType?: string,
  ): CodeEntityType | undefined {
    switch (language) {
      case 'javascript':
      case 'typescript': {
        if (node.type === 'function_declaration') {
          return 'function';
        }
        if (node.type === 'class_declaration') {
          return 'class';
        }
        if (node.type === 'method_definition') {
          return 'method';
        }
        if (node.type === 'public_field_definition') {
          const value = node.childForFieldName('value');
          if (value && ['arrow_function', 'function'].includes(value.type)) {
            return 'method';
          }
        }
        if (node.type === 'variable_declarator') {
          const value = node.childForFieldName('value');
          if (value && ['arrow_function', 'function'].includes(value.type)) {
            return parentType === 'class_body' ? 'method' : 'function';
          }
        }
        return undefined;
      }
      case 'python': {
        if (node.type === 'function_definition' || node.type === 'async_function_definition') {
          return parentType === 'class_definition' ? 'method' : 'function';
        }
        if (node.type === 'class_definition') {
          return 'class';
        }
        return undefined;
      }
      default:
        return undefined;
    }
  }

  private extractName(node: SyntaxNode, language: SupportedLanguage): string | undefined {
    switch (language) {
      case 'javascript':
      case 'typescript': {
        if (node.type === 'function_declaration' || node.type === 'class_declaration') {
          const nameNode = node.childForFieldName('name') ?? node.namedChildren.find((child) => child.type === 'identifier');
          return nameNode?.text;
        }

        if (node.type === 'method_definition') {
          const prop = node.childForFieldName('property');
          return prop?.text;
        }

        if (node.type === 'public_field_definition') {
          const prop = node.childForFieldName('property');
          return prop?.text;
        }

        if (node.type === 'variable_declarator') {
          const nameNode = node.childForFieldName('name');
          return nameNode?.text;
        }

        return undefined;
      }
      case 'python': {
        const nameNode = node.childForFieldName('name');
        return nameNode?.text;
      }
      default:
        return undefined;
    }
  }

  private hasDocumentation(
    node: SyntaxNode,
    language: SupportedLanguage,
    content: string,
  ): boolean {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return this.hasJsDoc(node, content);
      case 'python':
        return this.hasPythonDocstring(node);
      default:
        return false;
    }
  }

  private hasJsDoc(node: SyntaxNode, content: string): boolean {
    const check = (target: SyntaxNode | null): boolean => {
      let current = target?.previousSibling ?? null;

      while (current) {
        if (current.type === 'comment') {
          const text = content.slice(current.startIndex, current.endIndex).trim();
          if (text.startsWith('/**')) {
            return true;
          }
          if (!text.startsWith('//')) {
            break;
          }
          current = current.previousSibling;
          continue;
        }

      if (!current.isMissing) {
          break;
        }

      current = current.previousSibling;
      }

      return false;
    };

    if (check(node)) {
      return true;
    }

    const parent = node.parent;
    if (parent && parent.type.startsWith('export')) {
      return check(parent);
    }

    return false;
  }

  private hasPythonDocstring(node: SyntaxNode): boolean {
    const suite = node.childForFieldName('body');
    if (!suite) {
      return false;
    }

    const firstStatement = suite.namedChildren.find((child) => child.isNamed);
    if (!firstStatement) {
      return false;
    }

    if (firstStatement.type === 'expression_statement') {
      const expression = firstStatement.namedChildren[0];
      return expression?.type === 'string';
    }

    return false;
  }

  private isExported(node: SyntaxNode, language: SupportedLanguage): boolean {
    if (language === 'python') {
      return node.parent?.type === 'module';
    }

    let current: SyntaxNode | null = node;
    while (current) {
      if (current.type.startsWith('export')) {
        return true;
      }
      current = current.parent;
    }

    if (node.type === 'variable_declarator') {
      const value = node.childForFieldName('value');
      return !!(value && /module\.exports|exports\./.test(value.text));
    }

    const preceding = node.previousSibling;
    if (preceding?.type === 'export') {
      return true;
    }

    return false;
  }

  private estimateComplexity(node: SyntaxNode, content: string): number {
    const text = content.slice(node.startIndex, node.endIndex);
    const lines = text.split(/\r?\n/).length;
    const branches = (text.match(/if\s*\(|if\s+[^(]|switch\s*\(|for\s*\(|while\s*\(|case\s+/g) ?? []).length;
    return lines + branches * 3;
  }

  private calculateSeverity(entity: CodeEntity): SeverityLevel {
    if (entity.exported || entity.type === 'class') {
      return 'critical';
    }

    if (entity.type === 'method') {
      return entity.complexityScore > 30 ? 'critical' : 'medium';
    }

    return entity.complexityScore > 40 ? 'medium' : 'low';
  }

  private buildRationale(entity: CodeEntity): string {
    const parts: string[] = [];
    parts.push(`문서 없음: ${entity.type} ${entity.name}`);
    if (entity.exported) {
      parts.push('외부 노출 대상');
    }
    if (entity.complexityScore > 30) {
      parts.push(`복잡도 지표 ${entity.complexityScore}`);
    }
    return parts.join(', ');
  }

  private buildSummary(rootPath: string, files: FileAnalysis[]): AnalysisSummary {
    const languages: AnalysisSummary['languages'] = {
      javascript: 0,
      python: 0,
      typescript: 0,
    };

    let totalEntities = 0;
    let documented = 0;
    let undocumented = 0;

    for (const file of files) {
      languages[file.language] += 1;
      totalEntities += file.entityMetrics.total;
      documented += file.entityMetrics.documented;
      undocumented += file.entityMetrics.undocumented;
    }

    const documentationCoverage = totalEntities
      ? Number(((documented / totalEntities) * 100).toFixed(2))
      : 100;

    return {
      rootPath,
      totalFiles: files.length,
      languages,
      totalEntities,
      documentedEntities: documented,
      undocumentedEntities: undocumented,
      documentationCoverage,
    };
  }

  private buildSuggestions(
    summary: AnalysisSummary,
    missingDocs: MissingDocIssue[],
  ): Suggestion[] {
    const hasCritical = missingDocs.some((issue) => issue.severity === 'critical');
    const hasMedium = missingDocs.some((issue) => issue.severity === 'medium');

    const suggestions: Suggestion[] = [];

    if (hasCritical) {
      const targets = missingDocs
        .filter((issue) => issue.severity === 'critical')
        .slice(0, 10)
        .map((issue) => `${issue.name} (${issue.location.line}행)`);
      suggestions.push({
        title: '핵심 API 문서화 우선 처리',
        description:
          '외부에 노출되는 함수와 클래스부터 JSDoc 또는 docstring을 추가해 신뢰도를 확보하세요.',
        impact: 'critical',
        targets,
      });
    }

    if (hasMedium) {
      const targets = missingDocs
        .filter((issue) => issue.severity === 'medium')
        .slice(0, 10)
        .map((issue) => `${issue.name} (${issue.location.line}행)`);
      suggestions.push({
        title: '중요 로직에 대한 요약 문서 추가',
        description:
          '복잡도가 높은 메서드에 요약 설명과 파라미터/반환값 문서를 작성해 유지보수를 용이하게 하세요.',
        impact: 'medium',
        targets,
      });
    }

    if (summary.documentationCoverage < 70) {
      suggestions.push({
        title: '문서화 기준 수립',
        description:
          '전체 커버리지가 낮습니다. 최소 문서화 가이드라인을 정의하고 코드 리뷰에 문서 기준을 추가하세요.',
        impact: 'medium',
        targets: [],
      });
    }

    if (!missingDocs.length) {
      suggestions.push({
        title: '문서화 상태 양호',
        description: '문서 누락이 발견되지 않았습니다. 현행 문서화 프로세스를 유지해주세요.',
        impact: 'low',
        targets: [],
      });
    }

    return suggestions;
  }
}
