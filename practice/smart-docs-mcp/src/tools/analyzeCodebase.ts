/**
 * Analyze Codebase Tool
 * Analyzes a codebase and returns comprehensive structure information
 */

import { z } from 'zod';
import type { CodebaseAnalysis, FileAnalysis, Language } from '../types/index.js';
import { getParser } from '../parsers/index.js';
import {
  findFiles,
  readFileContent,
  getLanguageFromExtension,
  isDirectory,
} from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';

export const AnalyzeCodebaseArgsSchema = z.object({
  path: z.string().describe('Path to the codebase directory or file'),
  includePatterns: z
    .array(z.string())
    .optional()
    .describe('Glob patterns for files to include'),
  excludePatterns: z
    .array(z.string())
    .optional()
    .describe('Glob patterns for files to exclude'),
  maxDepth: z.number().optional().describe('Maximum directory depth to analyze'),
});

export type AnalyzeCodebaseArgs = z.infer<typeof AnalyzeCodebaseArgsSchema>;

export async function analyzeCodebase(
  args: AnalyzeCodebaseArgs
): Promise<CodebaseAnalysis> {
  try {
    logger.info(`Starting codebase analysis: ${args.path}`);

    const isDir = await isDirectory(args.path);
    const files = isDir
      ? await findFiles(args.path, args.includePatterns, args.excludePatterns)
      : [args.path];

    logger.info(`Found ${files.length} files to analyze`);

    const fileAnalyses: FileAnalysis[] = [];
    const languageCounts: Record<string, number> = {};

    for (const filePath of files) {
      try {
        const language = getLanguageFromExtension(filePath);
        if (!language) {
          logger.warn(`Skipping file with unsupported extension: ${filePath}`);
          continue;
        }

        const content = await readFileContent(filePath);
        const parser = getParser(language);
        const analysis = await parser.analyze(filePath, content);

        fileAnalyses.push(analysis);

        // Count languages
        languageCounts[language] = (languageCounts[language] || 0) + 1;
      } catch (error) {
        logger.error(`Failed to analyze file: ${filePath}`, error);
        // Continue with other files
      }
    }

    const summary = {
      totalFiles: fileAnalyses.length,
      totalFunctions: fileAnalyses.reduce(
        (sum, file) => sum + file.functions.length,
        0
      ),
      totalClasses: fileAnalyses.reduce(
        (sum, file) => sum + file.classes.length,
        0
      ),
      totalLines: fileAnalyses.reduce((sum, file) => sum + file.totalLines, 0),
      languages: languageCounts as Record<Language, number>,
    };

    const result: CodebaseAnalysis = {
      rootPath: args.path,
      files: fileAnalyses,
      summary,
      analyzedAt: new Date().toISOString(),
    };

    logger.info('Codebase analysis completed successfully');
    return result;
  } catch (error) {
    logger.error('Codebase analysis failed', error);
    throw error;
  }
}

export const analyzeCodebaseToolDefinition = {
  name: 'analyze_codebase',
  description:
    'Analyzes a codebase (TypeScript, JavaScript, or Python) and returns comprehensive structure information including functions, classes, imports, and exports',
  inputSchema: AnalyzeCodebaseArgsSchema,
};
