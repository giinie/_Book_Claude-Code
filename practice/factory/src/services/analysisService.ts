import path from 'node:path';

import { CodebaseAnalyzer } from '../analyzers/index.js';
import { AnalysisResult } from '../types.js';

const analyzer = new CodebaseAnalyzer();

export interface AnalysisRequestOptions {
  rootPath: string;
  maxFiles?: number;
  excludePatterns?: string[];
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const normalized = escaped
    .replace(/\*\*/g, '::DOUBLE_WILDCARD::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_WILDCARD::/g, '.*');
  return new RegExp(`^${normalized}$`);
}

function buildExcludeMatcher(patterns: string[] | undefined): ((filePath: string) => boolean) | undefined {
  if (!patterns?.length) {
    return undefined;
  }

  const regexes = patterns.map((pattern) => globToRegExp(pattern));

  return (filePath: string) => regexes.some((regex) => regex.test(filePath));
}

export async function performAnalysis(options: AnalysisRequestOptions): Promise<AnalysisResult> {
  const rootPath = path.resolve(options.rootPath);
  const exclude = buildExcludeMatcher(options.excludePatterns);

  return analyzer.analyze(rootPath, {
    maxFiles: options.maxFiles,
    exclude,
  });
}
