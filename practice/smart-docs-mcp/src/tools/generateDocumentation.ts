/**
 * Generate Documentation Tool
 * Generates markdown documentation for analyzed codebase
 */

import { z } from 'zod';
import type { DocumentationOutput } from '../types/index.js';
import { analyzeCodebase } from './analyzeCodebase.js';
import { MarkdownGenerator } from '../generators/index.js';
import { writeFileContent, isDirectory } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { join } from 'path';

export const GenerateDocumentationArgsSchema = z.object({
  path: z.string().describe('Path to the codebase directory or file'),
  outputPath: z
    .string()
    .optional()
    .describe('Optional output path for the documentation file'),
  includePrivate: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include private functions and classes'),
  format: z
    .enum(['markdown'])
    .optional()
    .default('markdown')
    .describe('Documentation format'),
});

export type GenerateDocumentationArgs = z.infer<
  typeof GenerateDocumentationArgsSchema
>;

export async function generateDocumentation(
  args: GenerateDocumentationArgs
): Promise<DocumentationOutput> {
  try {
    logger.info(`Starting documentation generation: ${args.path}`);

    // Analyze the codebase first
    const analysis = await analyzeCodebase({
      path: args.path,
    });

    // Generate markdown documentation
    const generator = new MarkdownGenerator();
    const isDir = await isDirectory(args.path);

    let content: string;
    let outputPath: string;

    if (isDir) {
      // Generate comprehensive codebase documentation
      content = generator.generateCodebaseDocumentation(analysis);
      outputPath =
        args.outputPath || join(args.path, 'DOCUMENTATION.md');
    } else {
      // Generate single file documentation
      if (analysis.files.length === 0) {
        throw new Error('No files were analyzed');
      }
      content = generator.generateFileDocumentation(analysis.files[0]);
      outputPath =
        args.outputPath ||
        args.path.replace(/\.(ts|js|py)$/, '.md');
    }

    // Write documentation to file if output path is provided
    if (outputPath) {
      await writeFileContent(outputPath, content);
      logger.info(`Documentation written to: ${outputPath}`);
    }

    const result = generator.createDocumentationOutput(
      outputPath || args.path,
      content
    );

    logger.info('Documentation generation completed successfully');
    return result;
  } catch (error) {
    logger.error('Documentation generation failed', error);
    throw error;
  }
}

export const generateDocumentationToolDefinition = {
  name: 'generate_documentation',
  description:
    'Generates comprehensive markdown documentation for a codebase or individual file, including all functions, classes, and their details',
  inputSchema: GenerateDocumentationArgsSchema,
};
