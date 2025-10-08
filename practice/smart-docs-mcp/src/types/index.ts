/**
 * Core types for smart-docs-mcp server
 */

export type Language = 'typescript' | 'javascript' | 'python';

export type Severity = 'critical' | 'medium' | 'low';

export interface CodeNode {
  type: string;
  name: string;
  startLine: number;
  endLine: number;
  text: string;
  children?: CodeNode[];
}

export interface FunctionInfo {
  name: string;
  parameters: string[];
  returnType?: string;
  docstring?: string;
  startLine: number;
  endLine: number;
  complexity?: number;
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  properties: string[];
  docstring?: string;
  startLine: number;
  endLine: number;
}

export interface FileAnalysis {
  filePath: string;
  language: Language;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: string[];
  exports: string[];
  totalLines: number;
  codeLines: number;
  commentLines: number;
}

export interface CodebaseAnalysis {
  rootPath: string;
  files: FileAnalysis[];
  summary: {
    totalFiles: number;
    totalFunctions: number;
    totalClasses: number;
    totalLines: number;
    languages: Record<Language, number>;
  };
  analyzedAt: string;
}

export interface MissingDoc {
  filePath: string;
  type: 'function' | 'class' | 'parameter';
  name: string;
  line: number;
  severity: Severity;
  reason: string;
}

export interface MissingDocsReport {
  missing: MissingDoc[];
  summary: {
    total: number;
    bySeverity: Record<Severity, number>;
    byType: Record<string, number>;
  };
}

export interface Improvement {
  filePath: string;
  line: number;
  type: 'structure' | 'clarity' | 'completeness' | 'examples';
  current: string;
  suggested: string;
  reason: string;
}

export interface ImprovementSuggestions {
  improvements: Improvement[];
  summary: {
    total: number;
    byType: Record<string, number>;
  };
}

export interface DocumentationOutput {
  filePath: string;
  content: string;
  format: 'markdown';
  generatedAt: string;
}

export interface ParserConfig {
  language: Language;
  extensions: string[];
  parser: any;
}

export interface AnalyzeOptions {
  path: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  maxDepth?: number;
}

export interface GenerateDocsOptions {
  path: string;
  outputPath?: string;
  includePrivate?: boolean;
  format?: 'markdown';
}

export interface DetectMissingOptions {
  path: string;
  severity?: Severity[];
  includeTypes?: Array<'function' | 'class' | 'parameter'>;
}

export interface SuggestImprovementsOptions {
  path: string;
  types?: Array<'structure' | 'clarity' | 'completeness' | 'examples'>;
}
