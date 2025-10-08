/**
 * TypeScript/JavaScript parser implementation
 */

import Parser from 'tree-sitter';
// @ts-ignore
import TypeScriptLanguage from 'tree-sitter-typescript/bindings/node/typescript.js';
import { BaseParser } from './baseParser.js';
import type { FunctionInfo, ClassInfo } from '../types/index.js';

export class TypeScriptParser extends BaseParser {
  constructor() {
    const parser = new Parser();
    parser.setLanguage(TypeScriptLanguage as any);
    super(parser, 'typescript');
  }

  parseFunctions(tree: Parser.Tree, content: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    const functionNodes = [
      ...this.findNodesByType(tree.rootNode, 'function_declaration'),
      ...this.findNodesByType(tree.rootNode, 'method_definition'),
      ...this.findNodesByType(tree.rootNode, 'arrow_function'),
    ];

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

    const classNodes = this.findNodesByType(tree.rootNode, 'class_declaration');

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

    const importNodes = this.findNodesByType(tree.rootNode, 'import_statement');

    for (const node of importNodes) {
      const sourceNode = this.findChildByType(node, 'string');
      if (sourceNode) {
        const importPath = this.getNodeText(sourceNode, content).replace(
          /['"]/g,
          ''
        );
        imports.push(importPath);
      }
    }

    return imports;
  }

  parseExports(tree: Parser.Tree, content: string): string[] {
    const exports: string[] = [];

    const exportNodes = [
      ...this.findNodesByType(tree.rootNode, 'export_statement'),
      ...this.findNodesByType(tree.rootNode, 'export_specifier'),
    ];

    for (const node of exportNodes) {
      const nameNode =
        this.findChildByType(node, 'identifier') ||
        this.findChildByType(node, 'property_identifier');

      if (nameNode) {
        exports.push(this.getNodeText(nameNode, content));
      }
    }

    return [...new Set(exports)];
  }

  private extractFunctionInfo(
    node: Parser.SyntaxNode,
    content: string
  ): FunctionInfo | null {
    const nameNode = this.findChildByType(node, 'identifier') ||
      this.findChildByType(node, 'property_identifier');

    if (!nameNode) return null;

    const name = this.getNodeText(nameNode, content);
    const parameters = this.extractParameters(node, content);
    const returnType = this.extractReturnType(node, content);
    const docstring = this.extractDocstring(node, content);
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
    const nameNode = this.findChildByType(node, 'type_identifier') ||
      this.findChildByType(node, 'identifier');

    if (!nameNode) return null;

    const name = this.getNodeText(nameNode, content);
    const classBody = this.findChildByType(node, 'class_body');

    const methods: FunctionInfo[] = [];
    const properties: string[] = [];

    if (classBody) {
      const methodNodes = this.findChildrenByType(
        classBody,
        'method_definition'
      );
      for (const methodNode of methodNodes) {
        const methodInfo = this.extractFunctionInfo(methodNode, content);
        if (methodInfo) {
          methods.push(methodInfo);
        }
      }

      const propertyNodes = [
        ...this.findChildrenByType(classBody, 'public_field_definition'),
        ...this.findChildrenByType(classBody, 'property_declaration'),
      ];

      for (const propNode of propertyNodes) {
        const propNameNode = this.findChildByType(propNode, 'property_identifier');
        if (propNameNode) {
          properties.push(this.getNodeText(propNameNode, content));
        }
      }
    }

    const docstring = this.extractDocstring(node, content);

    return {
      name,
      methods,
      properties,
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
    const formalParams = this.findChildByType(node, 'formal_parameters');

    if (formalParams) {
      for (const param of formalParams.children) {
        if (param.type === 'required_parameter' || param.type === 'optional_parameter') {
          const paramName = this.findChildByType(param, 'identifier');
          if (paramName) {
            parameters.push(this.getNodeText(paramName, content));
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
    const typeAnnotation = this.findChildByType(node, 'type_annotation');
    if (typeAnnotation) {
      const typeNode = typeAnnotation.children[1]; // Skip ':'
      if (typeNode) {
        return this.getNodeText(typeNode, content);
      }
    }
    return undefined;
  }
}
