import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface WalkOptions {
  extensions: Set<string>;
  maxFiles?: number;
  exclude?: (filePath: string) => boolean;
}

export interface FileInfo {
  path: string;
  relativePath: string;
  content: string;
}

async function collectFiles(
  directory: string,
  options: WalkOptions,
  root: string,
  results: FileInfo[],
): Promise<void> {
  const dirents = await fs.readdir(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    const absolute = path.join(directory, dirent.name);

    if (options.exclude?.(absolute)) {
      continue;
    }

    if (dirent.isDirectory()) {
      if (['.git', 'node_modules', 'dist', 'build', '.next', '.cache'].includes(dirent.name)) {
        continue;
      }
      await collectFiles(absolute, options, root, results);
      if (options.maxFiles && results.length >= options.maxFiles) {
        return;
      }
      continue;
    }

    const ext = path.extname(dirent.name).toLowerCase();
    if (!options.extensions.has(ext)) {
      continue;
    }

    const content = await fs.readFile(absolute, 'utf8');
    results.push({
      path: absolute,
      relativePath: path.relative(root, absolute),
      content,
    });

    if (options.maxFiles && results.length >= options.maxFiles) {
      return;
    }
  }
}

export async function walkCodeFiles(
  rootPath: string,
  options: WalkOptions,
): Promise<FileInfo[]> {
  const stats = await fs.stat(rootPath);
  if (!stats.isDirectory()) {
    throw new Error(`지정한 경로가 디렉터리가 아닙니다: ${rootPath}`);
  }

  const files: FileInfo[] = [];
  await collectFiles(rootPath, options, rootPath, files);
  return files;
}
