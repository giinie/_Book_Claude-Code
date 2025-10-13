import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import Python from 'tree-sitter-python';
import TypeScriptModule from 'tree-sitter-typescript';

import { SupportedLanguage } from '../types.js';

type ParserLanguage = unknown;
type SyntaxNode = Parser.SyntaxNode;

const typescriptLanguages = TypeScriptModule as unknown as {
  typescript: ParserLanguage;
  tsx: ParserLanguage;
};

export class TreeSitterManager {
  private static instance: TreeSitterManager;

  private readonly languageMap: Map<SupportedLanguage, ParserLanguage> =
    new Map([
      ['javascript', JavaScript as ParserLanguage],
      ['typescript', typescriptLanguages.typescript],
      ['python', Python as ParserLanguage],
    ]);

  private constructor() {}

  static getInstance(): TreeSitterManager {
    if (!TreeSitterManager.instance) {
      TreeSitterManager.instance = new TreeSitterManager();
    }
    return TreeSitterManager.instance;
  }

  createParser(language: SupportedLanguage): Parser {
    const parser = new Parser();
    const languageInstance = this.languageMap.get(language);
    if (!languageInstance) {
      throw new Error(`지원하지 않는 언어입니다: ${language}`);
    }
    parser.setLanguage(languageInstance as any);
    return parser;
  }

  parse(content: string, language: SupportedLanguage): Parser.Tree {
    const parser = this.createParser(language);
    return parser.parse(content);
  }

  createQuery(language: SupportedLanguage, source: string): Parser.Query {
    const languageInstance = this.languageMap.get(language);
    if (!languageInstance) {
      throw new Error(`지원하지 않는 언어입니다: ${language}`);
    }
    return new Parser.Query(languageInstance as any, source);
  }
}

export interface NodeMatcher {
  type: string;
  predicate?: (node: SyntaxNode) => boolean;
}
