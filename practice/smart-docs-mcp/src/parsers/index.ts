import { TypeScriptParser } from './typescript.js';
import { PythonParser } from './python.js';
import { SupportedLanguage } from '../types/index.js';
import { BaseParser } from './base.js';

export function getParser(language: SupportedLanguage): BaseParser {
  switch (language) {
    case 'typescript':
      return new TypeScriptParser(true);
    case 'javascript':
      return new TypeScriptParser(false);
    case 'python':
      return new PythonParser();
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

export { TypeScriptParser, PythonParser, BaseParser };
