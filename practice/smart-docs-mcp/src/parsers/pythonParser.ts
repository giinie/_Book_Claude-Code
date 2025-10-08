/**
 * Python parser implementation
 */

import Parser from 'tree-sitter';
import PythonLanguage from 'tree-sitter-python';
import { BaseParser } from './baseParser.js';
import type { FunctionInfo, ClassInfo } from '../types/index.js';

export class PythonParser extends BaseParser {
  constructor() {
    const parser = new Parser();
    parser.setLanguage(PythonLanguage as any);
    super(parser, 'python');
  }

  parseFunctions(tree: Parser.Tree, content: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    const functionNodes = this.findNodesByType(
      tree.rootNode,
      'function_definition'
    );

    for (const node of functionNodes) {
      const functionInfo = this.extractFunctionInfo(node, content);
      if (functionInfo) {
        functions.push(functionInfo);
      }
    }

    return functions;
  }

  parseClasses(tree: Parser.Tree, content: string): ClassInfo[] {
    const classes: ClassInfo[] = [];

    const classNodes = this.findNodesByType(tree.rootNode, 'class_definition');

    for (const node of classNodes) {
      const classInfo = this.extractClassInfo(node, content);
      if (classInfo) {
        classes.push(classInfo);
      }
    }

    return classes;
  }

  parseImports(tree: Parser.Tree, content: string): string[] {
    const imports: string[] = [];

    const importNodes = [
      ...this.findNodesByType(tree.rootNode, 'import_statement'),
      ...this.findNodesByType(tree.rootNode, 'import_from_statement'),
    ];

    for (const node of importNodes) {
      const dottedName = this.findChildByType(node, 'dotted_name');
      if (dottedName) {
        imports.push(this.getNodeText(dottedName, content));
      }
    }

    return imports;
  }

  parseExports(tree: Parser.Tree, content: string): string[] {
    const exports: string[] = [];

    // Python doesn't have explicit exports, but we can look for __all__
    const assignmentNodes = this.findNodesByType(
      tree.rootNode,
      'assignment'
    );

    for (const node of assignmentNodes) {
      const leftNode = node.children[0];
      if (leftNode && this.getNodeText(leftNode, content) === '__all__') {
        const rightNode = node.children[2]; // Skip '='
        if (rightNode && rightNode.type === 'list') {
          for (const item of rightNode.children) {
            if (item.type === 'string') {
              const exportName = this.getNodeText(item, content).replace(
                /['"]/g,
                ''
              );
              exports.push(exportName);
            }
          }
        }
      }
    }

    // If no __all__, consider top-level functions and classes as exports
    if (exports.length === 0) {
      const topLevelNodes = tree.rootNode.children.filter(
        (child) =>
          child.type === 'function_definition' ||
          child.type === 'class_definition'
      );

      for (const node of topLevelNodes) {
        const nameNode = this.findChildByType(node, 'identifier');
        if (nameNode) {
          const name = this.getNodeText(nameNode, content);
          if (!name.startsWith('_')) {
            // Only public functions/classes
            exports.push(name);
          }
        }
      }
    }

    return [...new Set(exports)];
  }

  private extractFunctionInfo(
    node: Parser.SyntaxNode,
    content: string
  ): FunctionInfo | null {
    const nameNode = this.findChildByType(node, 'identifier');
    if (!nameNode) return null;

    const name = this.getNodeText(nameNode, content);
    const parameters = this.extractParameters(node, content);
    const returnType = this.extractReturnType(node, content);
    const docstring = this.extractPythonDocstring(node, content);
    const complexity = this.calculateComplexity(node);

    return {
      name,
      parameters,
      returnType,
      docstring,
      startLine: node.startPosition.row + 1,
      endLine: node.endPosition.row + 1,
      complexity,
    };
  }

  private extractClassInfo(
    node: Parser.SyntaxNode,
    content: string
  ): ClassInfo | null {
    const nameNode = this.findChildByType(node, 'identifier');
    if (!nameNode) return null;

    const name = this.getNodeText(nameNode, content);
    const classBody = this.findChildByType(node, 'block');

    const methods: FunctionInfo[] = [];
    const properties: string[] = [];

    if (classBody) {
      const methodNodes = this.findChildrenByType(
        classBody,
        'function_definition'
      );
      for (const methodNode of methodNodes) {
        const methodInfo = this.extractFunctionInfo(methodNode, content);
        if (methodInfo) {
          methods.push(methodInfo);
        }
      }

      // Extract properties from __init__ method
      const initMethod = methodNodes.find((m) => {
        const n = this.findChildByType(m, 'identifier');
        return n && this.getNodeText(n, content) === '__init__';
      });

      if (initMethod) {
        const assignments = this.findNodesByType(initMethod, 'assignment');
        for (const assignment of assignments) {
          const leftNode = assignment.children[0];
          if (leftNode && leftNode.type === 'attribute') {
            const attrNode = this.findChildByType(leftNode, 'identifier');
            if (attrNode) {
              properties.push(this.getNodeText(attrNode, content));
            }
          }
        }
      }
    }

    const docstring = this.extractPythonDocstring(node, content);

    return {
      name,
      methods,
      properties: [...new Set(properties)],
      docstring,
      startLine: node.startPosition.row + 1,
      endLine: node.endPosition.row + 1,
    };
  }

  private extractParameters(
    node: Parser.SyntaxNode,
    content: string
  ): string[] {
    const parameters: string[] = [];
    const paramNode = this.findChildByType(node, 'parameters');

    if (paramNode) {
      for (const param of paramNode.children) {
        if (param.type === 'identifier') {
          const paramName = this.getNodeText(param, content);
          if (paramName !== 'self' && paramName !== 'cls') {
            parameters.push(paramName);
          }
        } else if (param.type === 'typed_parameter') {
          const nameNode = this.findChildByType(param, 'identifier');
          if (nameNode) {
            const paramName = this.getNodeText(nameNode, content);
            if (paramName !== 'self' && paramName !== 'cls') {
              parameters.push(paramName);
            }
          }
        } else if (param.type === 'default_parameter') {
          const nameNode = param.children[0];
          if (nameNode && nameNode.type === 'identifier') {
            const paramName = this.getNodeText(nameNode, content);
            if (paramName !== 'self' && paramName !== 'cls') {
              parameters.push(paramName);
            }
          }
        }
      }
    }

    return parameters;
  }

  private extractReturnType(
    node: Parser.SyntaxNode,
    content: string
  ): string | undefined {
    const typeNode = this.findChildByType(node, 'type');
    if (typeNode) {
      return this.getNodeText(typeNode, content);
    }
    return undefined;
  }

  private extractPythonDocstring(
    node: Parser.SyntaxNode,
    content: string
  ): string | undefined {
    const block = this.findChildByType(node, 'block');
    if (block && block.children.length > 0) {
      const firstChild = block.children[0];
      if (
        firstChild.type === 'expression_statement' &&
        firstChild.children.length > 0
      ) {
        const stringNode = firstChild.children[0];
        if (stringNode.type === 'string') {
          return this.getNodeText(stringNode, content)
            .replace(/^["']{3}|["']{3}$/g, '')
            .trim();
        }
      }
    }
    return undefined;
  }
}
