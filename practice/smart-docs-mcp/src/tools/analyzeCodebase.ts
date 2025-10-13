import * as fs from 'fs/promises';
import * as path from 'path';
import { getParser } from '../parsers/index.js';
import { CodebaseAnalysis, SupportedLanguage, DocumentationItem } from '../types/index.js';

const LANGUAGE_EXTENSIONS: Record<string, SupportedLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python'
};

export async function analyzeCodebase(dirPath: string): Promise<CodebaseAnalysis> {
  const files = await getAllFiles(dirPath);
  const filesByLanguage: Record<string, number> = {};
  
  let totalFunctions = 0;
  let totalClasses = 0;
  let documentedFunctions = 0;
  let documentedClasses = 0;
  
  const allItems: DocumentationItem[] = [];

  for (const file of files) {
    const ext = path.extname(file);
    const language = LANGUAGE_EXTENSIONS[ext];
    
    if (!language) continue;

    filesByLanguage[language] = (filesByLanguage[language] || 0) + 1;

    try {
      const content = await fs.readFile(file, 'utf-8');
      const parser = getParser(language);
      const { items } = parser.extractDocumentation(file, content);
      
      allItems.push(...items);

      for (const item of items) {
        if (item.type === 'function' || item.type === 'method') {
          totalFunctions++;
          if (item.documentation) {
            documentedFunctions++;
          }
        } else if (item.type === 'class') {
          totalClasses++;
          if (item.documentation) {
            documentedClasses++;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  const totalDocumentable = totalFunctions + totalClasses;
  const totalDocumented = documentedFunctions + documentedClasses;
  const documentationCoverage = totalDocumentable > 0 
    ? Math.round((totalDocumented / totalDocumentable) * 100) 
    : 0;

  return {
    totalFiles: files.length,
    filesByLanguage,
    totalFunctions,
    totalClasses,
    documentedFunctions,
    documentedClasses,
    documentationCoverage
  };
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
