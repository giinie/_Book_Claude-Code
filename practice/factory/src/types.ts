export type SupportedLanguage = 'typescript' | 'javascript' | 'python';

export type SeverityLevel = 'critical' | 'medium' | 'low';

export interface CodeLocation {
  line: number;
  column: number;
}

export type CodeEntityType = 'function' | 'class' | 'method';

export interface CodeEntity {
  name: string;
  type: CodeEntityType;
  language: SupportedLanguage;
  location: CodeLocation;
  hasDoc: boolean;
  exported: boolean;
  complexityScore: number;
  summary?: string;
}

export interface MissingDocIssue extends CodeEntity {
  severity: SeverityLevel;
  rationale: string;
}

export interface FileAnalysis {
  path: string;
  language: SupportedLanguage;
  linesOfCode: number;
  entityMetrics: {
    total: number;
    documented: number;
    undocumented: number;
    functions: number;
    classes: number;
    methods: number;
  };
  entities: CodeEntity[];
}

export interface AnalysisSummary {
  rootPath: string;
  totalFiles: number;
  languages: Record<SupportedLanguage, number>;
  totalEntities: number;
  documentedEntities: number;
  undocumentedEntities: number;
  documentationCoverage: number;
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  files: FileAnalysis[];
  missingDocs: MissingDocIssue[];
  suggestions: Suggestion[];
}

export interface Suggestion {
  title: string;
  description: string;
  impact: SeverityLevel;
  targets: string[];
}
