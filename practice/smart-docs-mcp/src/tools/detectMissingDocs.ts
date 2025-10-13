import * as fs from 'fs/promises';
import * as path from 'path';
import { getParser } from '../parsers/index.js';
import { MissingDocItem, SupportedLanguage } from '../types/index.js';

const LANGUAGE_EXTENSIONS: Record<string, SupportedLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python'
};

export async function detectMissingDocs(dirPath: string): Promise<MissingDocItem[]> {
  const files = await getAllFiles(dirPath);
  const missingDocs: MissingDocItem[] = [];

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
          const severity = determineSeverity(item.name, item.type);
          missingDocs.push({
            type: item.type as 'function' | 'class' | 'method' | 'interface',
            name: item.name,
            file: item.file,
            line: item.line,
            severity,
            reason: `Missing documentation for ${item.type} '${item.name}'`
          });
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  return missingDocs.sort((a, b) => {
    const severityOrder = { critical: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function determineSeverity(
  name: string,
  type: string
): 'critical' | 'medium' | 'low' {
  if (name.startsWith('_') || name.startsWith('private')) {
    return 'low';
  }

  if (type === 'class' || type === 'interface') {
    return 'critical';
  }

  if (name.includes('public') || name.includes('export')) {
    return 'critical';
  }

  const publicKeywords = ['init', 'create', 'get', 'set', 'update', 'delete', 'process'];
  if (publicKeywords.some(keyword => name.toLowerCase().includes(keyword))) {
    return 'medium';
  }

  return 'medium';
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
