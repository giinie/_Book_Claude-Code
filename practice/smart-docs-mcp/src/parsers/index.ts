/**
 * Parser factory and exports
 */

import { TypeScriptParser } from './typescriptParser.js';
import { PythonParser } from './pythonParser.js';
import type { Language } from '../types/index.js';
import { BaseParser } from './baseParser.js';
import { ConfigurationError } from '../utils/errors.js';

export { BaseParser } from './baseParser.js';
export { TypeScriptParser } from './typescriptParser.js';
export { PythonParser } from './pythonParser.js';

const parserCache = new Map<Language, BaseParser>();

export function getParser(language: Language): BaseParser {
  if (parserCache.has(language)) {
    return parserCache.get(language)!;
  }

  let parser: BaseParser;

  switch (language) {
    case 'typescript':
    case 'javascript':
      parser = new TypeScriptParser();
      break;
    case 'python':
      parser = new PythonParser();
      break;
    default:
      throw new ConfigurationError(`Unsupported language: ${language}`);
  }

  parserCache.set(language, parser);
  return parser;
}
