import Parser from 'tree-sitter';
import Python from 'tree-sitter-python';
import { BaseParser } from './base.js';
import { DocumentationItem, ParseResult } from '../types/index.js';

export class PythonParser extends BaseParser {
  constructor() {
    super('python');
    this.setLanguage();
  }

  setLanguage(): void {
    this.parser.setLanguage(Python);
  }

  extractDocumentation(filePath: string, content: string): ParseResult {
    const items: DocumentationItem[] = [];
    const errors: string[] = [];

    try {
      const tree = this.parser.parse(content);
      this.traverse(tree.rootNode, filePath, content, items);
    } catch (error) {
      errors.push(`Failed to parse ${filePath}: ${error}`);
    }

    return { items, errors };
  }

  private traverse(node: Parser.SyntaxNode, filePath: string, content: string, items: DocumentationItem[]): void {
    if (node.type === 'function_definition') {
      const nameNode = node.childForFieldName('name');
      if (nameNode) {
        items.push({
          type: 'function',
          name: nameNode.text,
          file: filePath,
          line: node.startPosition.row + 1,
          documentation: this.extractPythonDocstring(node),
          parameters: this.extractPythonParameters(node)
        });
      }
    } else if (node.type === 'class_definition') {
      const nameNode = node.childForFieldName('name');
      if (nameNode) {
        items.push({
          type: 'class',
          name: nameNode.text,
          file: filePath,
          line: node.startPosition.row + 1,
          documentation: this.extractPythonDocstring(node)
        });
      }
    }

    for (const child of node.children) {
      this.traverse(child, filePath, content, items);
    }
  }

  private extractPythonDocstring(node: Parser.SyntaxNode): string | undefined {
    const body = node.childForFieldName('body');
    if (body && body.type === 'block') {
      const firstChild = body.children[1];
      if (firstChild?.type === 'expression_statement') {
        const stringNode = firstChild.children[0];
        if (stringNode?.type === 'string') {
          return stringNode.text;
        }
      }
    }
    return undefined;
  }

  private extractPythonParameters(node: Parser.SyntaxNode): Array<{ name: string; type?: string }> {
    const params: Array<{ name: string; type?: string }> = [];
    const paramsNode = node.childForFieldName('parameters');
    
    if (paramsNode) {
      for (const child of paramsNode.children) {
        if (child.type === 'identifier') {
          params.push({ name: child.text });
        } else if (child.type === 'typed_parameter') {
          const nameNode = child.childForFieldName('name');
          const typeNode = child.childForFieldName('type');
          if (nameNode) {
            params.push({ 
              name: nameNode.text,
              type: typeNode?.text
            });
          }
        }
      }
    }

    return params;
  }
}
