/**
 * File system utilities for smart-docs-mcp
 */

import { readFile, stat, writeFile, mkdir } from 'fs/promises';
import { dirname, extname } from 'path';
import { glob } from 'glob';
import { FileSystemError } from './errors.js';
import { logger } from './logger.js';
import type { Language } from '../types/index.js';

const LANGUAGE_EXTENSIONS: Record<Language, string[]> = {
  typescript: ['.ts', '.tsx'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  python: ['.py'],
};

export async function readFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    logger.error(`Failed to read file: ${filePath}`, error);
    throw new FileSystemError(`Failed to read file: ${filePath}`, filePath);
  }
}

export async function writeFileContent(
  filePath: string,
  content: string
): Promise<void> {
  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf-8');
    logger.info(`File written successfully: ${filePath}`);
  } catch (error) {
    logger.error(`Failed to write file: ${filePath}`, error);
    throw new FileSystemError(`Failed to write file: ${filePath}`, filePath);
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export function getLanguageFromExtension(filePath: string): Language | null {
  const ext = extname(filePath);

  for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return language as Language;
    }
  }

  return null;
}

export async function findFiles(
  rootPath: string,
  includePatterns: string[] = ['**/*.{ts,tsx,js,jsx,py}'],
  excludePatterns: string[] = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
  ]
): Promise<string[]> {
  try {
    logger.debug(`Finding files in: ${rootPath}`);

    const allFiles: string[] = [];

    for (const pattern of includePatterns) {
      const files = await glob(pattern, {
        cwd: rootPath,
        ignore: excludePatterns,
        absolute: true,
        nodir: true,
      });
      allFiles.push(...files);
    }

    const uniqueFiles = [...new Set(allFiles)].filter((file) => {
      const language = getLanguageFromExtension(file);
      return language !== null;
    });

    logger.info(`Found ${uniqueFiles.length} files to analyze`);
    return uniqueFiles;
  } catch (error) {
    logger.error(`Failed to find files in: ${rootPath}`, error);
    throw new FileSystemError(`Failed to find files in: ${rootPath}`, rootPath);
  }
}

export function getRelativePath(rootPath: string, filePath: string): string {
  if (filePath.startsWith(rootPath)) {
    return filePath.slice(rootPath.length + 1);
  }
  return filePath;
}

export function countLines(content: string): {
  total: number;
  code: number;
  comments: number;
} {
  const lines = content.split('\n');
  let codeLines = 0;
  let commentLines = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('"""') ||
      trimmed.startsWith("'''")
    ) {
      commentLines++;
    } else {
      codeLines++;
    }
  }

  return {
    total: lines.length,
    code: codeLines,
    comments: commentLines,
  };
}
