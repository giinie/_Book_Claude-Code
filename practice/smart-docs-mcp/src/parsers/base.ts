import Parser from 'tree-sitter';
import { DocumentationItem, SupportedLanguage, ParseResult } from '../types/index.js';

export abstract class BaseParser {
  protected parser: Parser;
  protected language: SupportedLanguage;

  constructor(language: SupportedLanguage) {
    this.parser = new Parser();
    this.language = language;
  }

  abstract setLanguage(): void;
  abstract extractDocumentation(filePath: string, content: string): ParseResult;

  protected hasDocumentation(node: Parser.SyntaxNode): boolean {
    const previousSibling = node.previousNamedSibling;
    if (previousSibling?.type === 'comment') {
      return true;
    }

    const parent = node.parent;
    if (parent) {
      const commentIndex = parent.children.indexOf(node) - 1;
      if (commentIndex >= 0) {
        const possibleComment = parent.children[commentIndex];
        if (possibleComment.type === 'comment') {
          return true;
        }
      }
    }

    return false;
  }

  protected extractDocComment(node: Parser.SyntaxNode): string | undefined {
    const previousSibling = node.previousNamedSibling;
    if (previousSibling?.type === 'comment') {
      return previousSibling.text;
    }

    const parent = node.parent;
    if (parent) {
      const commentIndex = parent.children.indexOf(node) - 1;
      if (commentIndex >= 0) {
        const possibleComment = parent.children[commentIndex];
        if (possibleComment.type === 'comment') {
          return possibleComment.text;
        }
      }
    }

    return undefined;
  }
}
