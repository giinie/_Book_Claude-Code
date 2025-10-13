import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import { BaseParser } from './base.js';
import { DocumentationItem, ParseResult } from '../types/index.js';

export class TypeScriptParser extends BaseParser {
  constructor(isTypeScript: boolean = true) {
    super(isTypeScript ? 'typescript' : 'javascript');
    this.setLanguage();
  }

  setLanguage(): void {
    this.parser.setLanguage(this.language === 'typescript' ? TypeScript.typescript : TypeScript.tsx);
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
    if (node.type === 'function_declaration' || node.type === 'method_definition') {
      const nameNode = node.childForFieldName('name');
      if (nameNode) {
        items.push({
          type: node.type === 'function_declaration' ? 'function' : 'method',
          name: nameNode.text,
          file: filePath,
          line: node.startPosition.row + 1,
          documentation: this.extractDocComment(node),
          parameters: this.extractParameters(node),
          returnType: this.extractReturnType(node)
        });
      }
    } else if (node.type === 'class_declaration') {
      const nameNode = node.childForFieldName('name');
      if (nameNode) {
        items.push({
          type: 'class',
          name: nameNode.text,
          file: filePath,
          line: node.startPosition.row + 1,
          documentation: this.extractDocComment(node)
        });
      }
    } else if (node.type === 'interface_declaration') {
      const nameNode = node.childForFieldName('name');
      if (nameNode) {
        items.push({
          type: 'interface',
          name: nameNode.text,
          file: filePath,
          line: node.startPosition.row + 1,
          documentation: this.extractDocComment(node)
        });
      }
    }

    for (const child of node.children) {
      this.traverse(child, filePath, content, items);
    }
  }

  private extractParameters(node: Parser.SyntaxNode): Array<{ name: string; type?: string }> {
    const params: Array<{ name: string; type?: string }> = [];
    const paramsNode = node.childForFieldName('parameters');
    
    if (paramsNode) {
      for (const child of paramsNode.children) {
        if (child.type === 'required_parameter' || child.type === 'optional_parameter') {
          const paramName = child.childForFieldName('pattern')?.text;
          const paramType = child.childForFieldName('type')?.text;
          if (paramName) {
            params.push({ name: paramName, type: paramType });
          }
        }
      }
    }

    return params;
  }

  private extractReturnType(node: Parser.SyntaxNode): string | undefined {
    const returnTypeNode = node.childForFieldName('return_type');
    return returnTypeNode?.text;
  }
}
