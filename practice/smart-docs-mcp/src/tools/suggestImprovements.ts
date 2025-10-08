/**
 * Suggest Improvements Tool
 * Suggests improvements for existing documentation
 */

import { z } from 'zod';
import type { Improvement, ImprovementSuggestions } from '../types/index.js';
import { analyzeCodebase } from './analyzeCodebase.js';
import { logger } from '../utils/logger.js';

export const SuggestImprovementsArgsSchema = z.object({
  path: z.string().describe('Path to the codebase directory or file'),
  types: z
    .array(z.enum(['structure', 'clarity', 'completeness', 'examples']))
    .optional()
    .describe('Types of improvements to suggest'),
});

export type SuggestImprovementsArgs = z.infer<
  typeof SuggestImprovementsArgsSchema
>;

function analyzeDocstring(
  docstring: string | undefined,
  name: string,
  filePath: string,
  line: number,
  params: string[]
): Improvement[] {
  const improvements: Improvement[] = [];

  if (!docstring || docstring.trim().length === 0) {
    return improvements; // No docstring to analyze
  }

  const cleanDoc = docstring.trim();

  // Check structure
  const hasProperFormat =
    cleanDoc.includes('@param') ||
    cleanDoc.includes('@returns') ||
    cleanDoc.includes('Parameters:') ||
    cleanDoc.includes('Returns:');

  if (!hasProperFormat && params.length > 0) {
    improvements.push({
      filePath,
      line,
      type: 'structure',
      current: cleanDoc,
      suggested: generateStructuredDoc(name, params, cleanDoc),
      reason:
        'Documentation lacks structured format with parameter and return descriptions',
    });
  }

  // Check clarity
  if (cleanDoc.length < 20) {
    improvements.push({
      filePath,
      line,
      type: 'clarity',
      current: cleanDoc,
      suggested: `${cleanDoc}\n\nProvide more detailed explanation of what this function does, its purpose, and any important behavior.`,
      reason: 'Documentation is too brief and lacks detail',
    });
  }

  // Check completeness
  if (params.length > 0) {
    const missingParams = params.filter(
      (param) => !cleanDoc.toLowerCase().includes(param.toLowerCase())
    );

    if (missingParams.length > 0) {
      improvements.push({
        filePath,
        line,
        type: 'completeness',
        current: cleanDoc,
        suggested: addMissingParams(cleanDoc, missingParams),
        reason: `Missing documentation for parameters: ${missingParams.join(', ')}`,
      });
    }
  }

  // Check for examples
  const hasExample =
    cleanDoc.includes('@example') ||
    cleanDoc.includes('Example:') ||
    cleanDoc.includes('```');

  if (!hasExample && params.length > 0) {
    improvements.push({
      filePath,
      line,
      type: 'examples',
      current: cleanDoc,
      suggested: addExample(cleanDoc, name, params),
      reason: 'Documentation would benefit from usage examples',
    });
  }

  return improvements;
}

function generateStructuredDoc(
  _name: string,
  params: string[],
  original: string
): string {
  let doc = original + '\n\n';

  if (params.length > 0) {
    doc += 'Parameters:\n';
    for (const param of params) {
      doc += `  @param {type} ${param} - Description of ${param}\n`;
    }
  }

  doc += '  @returns {type} Description of return value\n';

  return doc;
}

function addMissingParams(original: string, missingParams: string[]): string {
  let doc = original;

  if (!doc.includes('Parameters:') && !doc.includes('@param')) {
    doc += '\n\nParameters:\n';
  }

  for (const param of missingParams) {
    doc += `  @param {type} ${param} - Description of ${param}\n`;
  }

  return doc;
}

function addExample(original: string, funcName: string, params: string[]): string {
  let doc = original + '\n\n';

  doc += 'Example:\n';
  doc += '```typescript\n';

  const exampleParams = params.map((p) => `example${p.charAt(0).toUpperCase() + p.slice(1)}`).join(', ');

  doc += `const result = ${funcName}(${exampleParams});\n`;
  doc += '```\n';

  return doc;
}

export async function suggestImprovements(
  args: SuggestImprovementsArgs
): Promise<ImprovementSuggestions> {
  try {
    logger.info(`Starting improvement suggestions: ${args.path}`);

    // Analyze the codebase
    const analysis = await analyzeCodebase({
      path: args.path,
    });

    const allImprovements: Improvement[] = [];
    const filterTypes = args.types || [
      'structure',
      'clarity',
      'completeness',
      'examples',
    ];

    // Check each file
    for (const file of analysis.files) {
      // Check functions
      for (const func of file.functions) {
        const improvements = analyzeDocstring(
          func.docstring,
          func.name,
          file.filePath,
          func.startLine,
          func.parameters
        );

        allImprovements.push(
          ...improvements.filter((imp) => filterTypes.includes(imp.type))
        );
      }

      // Check classes
      for (const cls of file.classes) {
        const improvements = analyzeDocstring(
          cls.docstring,
          cls.name,
          file.filePath,
          cls.startLine,
          []
        );

        allImprovements.push(
          ...improvements.filter((imp) => filterTypes.includes(imp.type))
        );

        // Check class methods
        for (const method of cls.methods) {
          const methodImprovements = analyzeDocstring(
            method.docstring,
            `${cls.name}.${method.name}`,
            file.filePath,
            method.startLine,
            method.parameters
          );

          allImprovements.push(
            ...methodImprovements.filter((imp) => filterTypes.includes(imp.type))
          );
        }
      }
    }

    // Calculate summary
    const byType: Record<string, number> = {
      structure: 0,
      clarity: 0,
      completeness: 0,
      examples: 0,
    };

    for (const improvement of allImprovements) {
      byType[improvement.type]++;
    }

    const suggestions: ImprovementSuggestions = {
      improvements: allImprovements,
      summary: {
        total: allImprovements.length,
        byType,
      },
    };

    logger.info(
      `Improvement suggestions completed: ${allImprovements.length} suggestions generated`
    );
    return suggestions;
  } catch (error) {
    logger.error('Improvement suggestions failed', error);
    throw error;
  }
}

export const suggestImprovementsToolDefinition = {
  name: 'suggest_improvements',
  description:
    'Analyzes existing documentation and suggests improvements for structure, clarity, completeness, and examples. Helps enhance documentation quality',
  inputSchema: SuggestImprovementsArgsSchema,
};
