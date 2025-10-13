import * as fs from 'fs/promises';
import * as path from 'path';
import { getParser } from '../parsers/index.js';
import { Improvement, SupportedLanguage } from '../types/index.js';

const LANGUAGE_EXTENSIONS: Record<string, SupportedLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python'
};

export async function suggestImprovements(dirPath: string): Promise<Improvement[]> {
  const files = await getAllFiles(dirPath);
  const improvements: Improvement[] = [];

  for (const file of files) {
    const ext = path.extname(file);
    const language = LANGUAGE_EXTENSIONS[ext];
    
    if (!language) continue;

    try {
      const content = await fs.readFile(file, 'utf-8');
      const parser = getParser(language);
      const { items } = parser.extractDocumentation(file, content);

      for (const item of items) {
        if (!item.documentation) {
          improvements.push({
            file: item.file,
            line: item.line,
            type: 'incomplete_description',
            severity: 'critical',
            message: `${item.type} '${item.name}' has no documentation`,
            suggestion: `Add a descriptive comment explaining the purpose and usage of this ${item.type}`
          });
          continue;
        }

        if (item.type === 'function' || item.type === 'method') {
          if (item.parameters && item.parameters.length > 0) {
            const docLower = item.documentation.toLowerCase();
            const missingParams = item.parameters.filter(
              p => !docLower.includes(p.name.toLowerCase())
            );

            if (missingParams.length > 0) {
              improvements.push({
                file: item.file,
                line: item.line,
                type: 'missing_param_docs',
                severity: 'medium',
                message: `Function '${item.name}' documentation missing parameter details`,
                suggestion: `Add @param tags for: ${missingParams.map(p => p.name).join(', ')}`
              });
            }
          }

          if (item.returnType && item.returnType !== 'void') {
            const docLower = item.documentation.toLowerCase();
            if (!docLower.includes('return')) {
              improvements.push({
                file: item.file,
                line: item.line,
                type: 'missing_return_docs',
                severity: 'medium',
                message: `Function '${item.name}' documentation missing return value description`,
                suggestion: 'Add @returns tag describing what the function returns'
              });
            }
          }
        }

        if (item.documentation.length < 20) {
          improvements.push({
            file: item.file,
            line: item.line,
            type: 'incomplete_description',
            severity: 'low',
            message: `${item.type} '${item.name}' has minimal documentation`,
            suggestion: 'Expand documentation with more details about purpose, usage, and examples'
          });
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  return improvements.sort((a, b) => {
    const severityOrder = { critical: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

async function getAllFiles(dirPath: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      await getAllFiles(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (LANGUAGE_EXTENSIONS[ext]) {
        files.push(fullPath);
      }
    }
  }

  return files;
}
