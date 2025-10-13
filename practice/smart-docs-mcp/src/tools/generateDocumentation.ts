import * as fs from 'fs/promises';
import * as path from 'path';
import { getParser } from '../parsers/index.js';
import { DocumentationItem, SupportedLanguage } from '../types/index.js';
import { generateMarkdown } from '../generators/markdown.js';

const LANGUAGE_EXTENSIONS: Record<string, SupportedLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python'
};

export async function generateDocumentation(
  dirPath: string,
  outputPath?: string
): Promise<string> {
  const files = await getAllFiles(dirPath);
  const allItems: DocumentationItem[] = [];

  for (const file of files) {
    const ext = path.extname(file);
    const language = LANGUAGE_EXTENSIONS[ext];
    
    if (!language) continue;

    try {
      const content = await fs.readFile(file, 'utf-8');
      const parser = getParser(language);
      const { items } = parser.extractDocumentation(file, content);
      allItems.push(...items);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  const projectName = path.basename(dirPath);
  const markdown = generateMarkdown(allItems, projectName);

  if (outputPath) {
    await fs.writeFile(outputPath, markdown, 'utf-8');
  }

  return markdown;
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
