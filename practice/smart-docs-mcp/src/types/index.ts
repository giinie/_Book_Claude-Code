export interface CodebaseAnalysis {
  totalFiles: number;
  filesByLanguage: Record<string, number>;
  totalFunctions: number;
  totalClasses: number;
  documentedFunctions: number;
  documentedClasses: number;
  documentationCoverage: number;
}

export interface DocumentationItem {
  type: 'function' | 'class' | 'method' | 'interface' | 'variable';
  name: string;
  file: string;
  line: number;
  documentation?: string;
  parameters?: Array<{ name: string; type?: string }>;
  returnType?: string;
  scope?: string;
}

export interface MissingDocItem {
  type: 'function' | 'class' | 'method' | 'interface';
  name: string;
  file: string;
  line: number;
  severity: 'critical' | 'medium' | 'low';
  reason: string;
}

export interface Improvement {
  file: string;
  line: number;
  type: 'missing_param_docs' | 'missing_return_docs' | 'incomplete_description' | 'missing_examples';
  severity: 'critical' | 'medium' | 'low';
  message: string;
  suggestion: string;
}

export type SupportedLanguage = 'typescript' | 'javascript' | 'python';

export interface ParseResult {
  items: DocumentationItem[];
  errors: string[];
}
