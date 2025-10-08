/**
 * Detect Missing Documentation Tool
 * Identifies functions and classes lacking documentation with severity levels
 */

import { z } from 'zod';
import type {
  MissingDoc,
  MissingDocsReport,
  Severity,
  FunctionInfo,
  ClassInfo,
} from '../types/index.js';
import { analyzeCodebase } from './analyzeCodebase.js';
import { logger } from '../utils/logger.js';

export const DetectMissingDocsArgsSchema = z.object({
  path: z.string().describe('Path to the codebase directory or file'),
  severity: z
    .array(z.enum(['critical', 'medium', 'low']))
    .optional()
    .describe('Filter by severity levels'),
  includeTypes: z
    .array(z.enum(['function', 'class', 'parameter']))
    .optional()
    .describe('Types of missing documentation to detect'),
});

export type DetectMissingDocsArgs = z.infer<typeof DetectMissingDocsArgsSchema>;

function determineSeverity(
  type: 'function' | 'class' | 'parameter',
  item: FunctionInfo | ClassInfo,
  _context?: string
): Severity {
  // Critical: Public API functions/classes without documentation
  // Medium: Internal functions/classes without documentation
  // Low: Private/helper functions without documentation

  const name = item.name;

  // Check if it's likely a private function/class
  const isPrivate =
    name.startsWith('_') || name.startsWith('#') || name.includes('internal');

  // Check if it's likely a public API
  const isPublicAPI =
    !isPrivate &&
    (name === 'default' ||
      name.includes('export') ||
      name.includes('public') ||
      !name.startsWith('handle') ||
      !name.startsWith('on'));

  // Check complexity for functions
  if (type === 'function' && 'complexity' in item) {
    const complexity = item.complexity || 1;
    if (complexity > 10 && !item.docstring) {
      return 'critical'; // High complexity without docs is critical
    }
  }

  // Check if class has many methods
  if (type === 'class' && 'methods' in item) {
    const methodCount = item.methods.length;
    if (methodCount > 5 && !item.docstring) {
      return 'critical'; // Large classes without docs are critical
    }
  }

  if (isPublicAPI) {
    return 'critical';
  }

  if (isPrivate) {
    return 'low';
  }

  return 'medium';
}

function checkFunctionDoc(
  func: FunctionInfo,
  filePath: string
): MissingDoc[] {
  const missing: MissingDoc[] = [];

  // Check if function has docstring
  if (!func.docstring || func.docstring.trim().length === 0) {
    const severity = determineSeverity('function', func);
    missing.push({
      filePath,
      type: 'function',
      name: func.name,
      line: func.startLine,
      severity,
      reason: 'Function lacks documentation',
    });
  }

  // Check if parameters are documented
  if (func.parameters.length > 0 && func.docstring) {
    for (const param of func.parameters) {
      if (!func.docstring.includes(param)) {
        missing.push({
          filePath,
          type: 'parameter',
          name: `${func.name}.${param}`,
          line: func.startLine,
          severity: 'low',
          reason: `Parameter '${param}' not documented`,
        });
      }
    }
  }

  return missing;
}

function checkClassDoc(cls: ClassInfo, filePath: string): MissingDoc[] {
  const missing: MissingDoc[] = [];

  // Check if class has docstring
  if (!cls.docstring || cls.docstring.trim().length === 0) {
    const severity = determineSeverity('class', cls);
    missing.push({
      filePath,
      type: 'class',
      name: cls.name,
      line: cls.startLine,
      severity,
      reason: 'Class lacks documentation',
    });
  }

  // Check methods
  for (const method of cls.methods) {
    if (!method.docstring || method.docstring.trim().length === 0) {
      const severity = determineSeverity('function', method, cls.name);
      missing.push({
        filePath,
        type: 'function',
        name: `${cls.name}.${method.name}`,
        line: method.startLine,
        severity,
        reason: 'Method lacks documentation',
      });
    }
  }

  return missing;
}

export async function detectMissingDocs(
  args: DetectMissingDocsArgs
): Promise<MissingDocsReport> {
  try {
    logger.info(`Starting missing documentation detection: ${args.path}`);

    // Analyze the codebase
    const analysis = await analyzeCodebase({
      path: args.path,
    });

    const allMissing: MissingDoc[] = [];

    // Check each file
    for (const file of analysis.files) {
      const includeTypes = args.includeTypes || [
        'function',
        'class',
        'parameter',
      ];

      // Check functions
      if (includeTypes.includes('function')) {
        for (const func of file.functions) {
          allMissing.push(...checkFunctionDoc(func, file.filePath));
        }
      }

      // Check classes
      if (includeTypes.includes('class')) {
        for (const cls of file.classes) {
          allMissing.push(...checkClassDoc(cls, file.filePath));
        }
      }
    }

    // Filter by severity if specified
    const filtered = args.severity
      ? allMissing.filter((doc) => args.severity!.includes(doc.severity))
      : allMissing;

    // Calculate summary
    const bySeverity: Record<Severity, number> = {
      critical: 0,
      medium: 0,
      low: 0,
    };

    const byType: Record<string, number> = {
      function: 0,
      class: 0,
      parameter: 0,
    };

    for (const doc of filtered) {
      bySeverity[doc.severity]++;
      byType[doc.type]++;
    }

    const report: MissingDocsReport = {
      missing: filtered,
      summary: {
        total: filtered.length,
        bySeverity,
        byType,
      },
    };

    logger.info(
      `Missing documentation detection completed: ${filtered.length} issues found`
    );
    return report;
  } catch (error) {
    logger.error('Missing documentation detection failed', error);
    throw error;
  }
}

export const detectMissingDocsToolDefinition = {
  name: 'detect_missing_docs',
  description:
    'Detects missing documentation in code with severity levels (critical, medium, low). Critical includes public APIs and complex functions, medium for internal functions, low for private helpers',
  inputSchema: DetectMissingDocsArgsSchema,
};
