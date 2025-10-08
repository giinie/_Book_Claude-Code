/**
 * Base parser interface and common functionality
 */

import type Parser from 'tree-sitter';
import type {
  Language,
  FileAnalysis,
  FunctionInfo,
  ClassInfo,
} from '../types/index.js';
import { ParserError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export abstract class BaseParser {
  protected parser: Parser;
  protected language: Language;

  constructor(parser: Parser, language: Language) {
    this.parser = parser;
    this.language = language;
  }

  abstract parseFunctions(tree: Parser.Tree, content: string): FunctionInfo[];
  abstract parseClasses(tree: Parser.Tree, content: string): ClassInfo[];
  abstract parseImports(tree: Parser.Tree, content: string): string[];
  abstract parseExports(tree: Parser.Tree, content: string): string[];

  async analyze(filePath: string, content: string): Promise<FileAnalysis> {
    try {
      logger.debug(`Parsing file: ${filePath}`);

      const tree = this.parser.parse(content);

      const functions = this.parseFunctions(tree, content);
      const classes = this.parseClasses(tree, content);
      const imports = this.parseImports(tree, content);
      const exports = this.parseExports(tree, content);

      const lines = content.split('\n');
      const totalLines = lines.length;
      const codeLines = lines.filter(
        (line) => line.trim().length > 0
      ).length;
      const commentLines = this.countCommentLines(content);

      return {
        filePath,
        language: this.language,
        functions,
        classes,
        imports,
        exports,
        totalLines,
        codeLines,
        commentLines,
      };
    } catch (error) {
      logger.error(`Failed to parse file: ${filePath}`, error);
      throw new ParserError(`Failed to parse file: ${filePath}`, filePath);
    }
  }

  protected getNodeText(node: Parser.SyntaxNode, content: string): string {
    return content.slice(node.startIndex, node.endIndex);
  }

  protected findNodesByType(
    node: Parser.SyntaxNode,
    type: string
  ): Parser.SyntaxNode[] {
    const results: Parser.SyntaxNode[] = [];

    if (node.type === type) {
      results.push(node);
    }

    for (const child of node.children) {
      results.push(...this.findNodesByType(child, type));
    }

    return results;
  }

  protected findChildByType(
    node: Parser.SyntaxNode,
    type: string
  ): Parser.SyntaxNode | null {
    return node.children.find((child) => child.type === type) || null;
  }

  protected findChildrenByType(
    node: Parser.SyntaxNode,
    type: string
  ): Parser.SyntaxNode[] {
    return node.children.filter((child) => child.type === type);
  }

  protected extractDocstring(
    node: Parser.SyntaxNode,
    content: string
  ): string | undefined {
    // Look for comment nodes before the target node
    const siblings = node.parent?.children || [];
    const nodeIndex = siblings.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      const sibling = siblings[i];
      if (
        sibling.type === 'comment' ||
        sibling.type === 'block_comment' ||
        sibling.type === 'line_comment'
      ) {
        return this.getNodeText(sibling, content);
      }
    }

    return undefined;
  }

  protected countCommentLines(content: string): number {
    const lines = content.split('\n');
    let count = 0;

    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // JavaScript/TypeScript block comments
      if (trimmed.includes('/*')) inBlockComment = true;
      if (inBlockComment) {
        count++;
        if (trimmed.includes('*/')) inBlockComment = false;
        continue;
      }

      // Single line comments
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('"""') ||
        trimmed.startsWith("'''")
      ) {
        count++;
      }
    }

    return count;
  }

  protected calculateComplexity(node: Parser.SyntaxNode): number {
    let complexity = 1; // Base complexity

    const complexityNodes = [
      'if_statement',
      'while_statement',
      'for_statement',
      'switch_statement',
      'case',
      'catch_clause',
      'conditional_expression',
      'binary_expression', // for && and ||
    ];

    for (const child of node.children) {
      if (complexityNodes.includes(child.type)) {
        complexity++;
      }
      complexity += this.calculateComplexity(child) - 1;
    }

    return complexity;
  }
}
