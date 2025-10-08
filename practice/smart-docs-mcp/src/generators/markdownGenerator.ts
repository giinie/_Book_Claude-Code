/**
 * Markdown documentation generator
 */

import type {
  FileAnalysis,
  CodebaseAnalysis,
  FunctionInfo,
  ClassInfo,
  DocumentationOutput,
} from '../types/index.js';

export class MarkdownGenerator {
  generateFileDocumentation(analysis: FileAnalysis): string {
    const sections: string[] = [];

    // Header
    sections.push(`# ${this.getFileName(analysis.filePath)}\n`);
    sections.push(`**Language:** ${analysis.language}\n`);
    sections.push(`**Lines of Code:** ${analysis.codeLines} / ${analysis.totalLines}\n`);

    // Imports
    if (analysis.imports.length > 0) {
      sections.push('## Imports\n');
      for (const imp of analysis.imports) {
        sections.push(`- \`${imp}\``);
      }
      sections.push('');
    }

    // Classes
    if (analysis.classes.length > 0) {
      sections.push('## Classes\n');
      for (const cls of analysis.classes) {
        sections.push(this.generateClassDoc(cls));
      }
    }

    // Functions
    if (analysis.functions.length > 0) {
      sections.push('## Functions\n');
      for (const func of analysis.functions) {
        sections.push(this.generateFunctionDoc(func));
      }
    }

    // Exports
    if (analysis.exports.length > 0) {
      sections.push('## Exports\n');
      for (const exp of analysis.exports) {
        sections.push(`- \`${exp}\``);
      }
      sections.push('');
    }

    return sections.join('\n');
  }

  generateCodebaseDocumentation(analysis: CodebaseAnalysis): string {
    const sections: string[] = [];

    // Title
    sections.push(`# Codebase Documentation\n`);
    sections.push(`**Root Path:** ${analysis.rootPath}`);
    sections.push(`**Analyzed At:** ${new Date(analysis.analyzedAt).toLocaleString()}\n`);

    // Summary
    sections.push('## Summary\n');
    sections.push(`- **Total Files:** ${analysis.summary.totalFiles}`);
    sections.push(`- **Total Functions:** ${analysis.summary.totalFunctions}`);
    sections.push(`- **Total Classes:** ${analysis.summary.totalClasses}`);
    sections.push(`- **Total Lines:** ${analysis.summary.totalLines}\n`);

    // Languages
    sections.push('### Languages\n');
    for (const [lang, count] of Object.entries(analysis.summary.languages)) {
      sections.push(`- **${lang}:** ${count} files`);
    }
    sections.push('');

    // File Index
    sections.push('## File Index\n');
    for (const file of analysis.files) {
      const fileName = this.getFileName(file.filePath);
      const funcCount = file.functions.length;
      const classCount = file.classes.length;

      sections.push(
        `- [\`${fileName}\`](#${this.anchorize(fileName)}) - ${funcCount} functions, ${classCount} classes`
      );
    }
    sections.push('');

    // File Details
    sections.push('## Files\n');
    for (const file of analysis.files) {
      sections.push('---\n');
      sections.push(this.generateFileDocumentation(file));
    }

    return sections.join('\n');
  }

  generateFunctionDoc(func: FunctionInfo): string {
    const lines: string[] = [];

    lines.push(`### \`${func.name}\`\n`);

    if (func.docstring) {
      lines.push(func.docstring);
      lines.push('');
    }

    lines.push('**Signature:**\n');
    const params = func.parameters.join(', ');
    const returnType = func.returnType ? `: ${func.returnType}` : '';
    lines.push(`\`\`\`typescript\n${func.name}(${params})${returnType}\n\`\`\`\n`);

    if (func.parameters.length > 0) {
      lines.push('**Parameters:**\n');
      for (const param of func.parameters) {
        lines.push(`- \`${param}\``);
      }
      lines.push('');
    }

    if (func.complexity !== undefined) {
      lines.push(`**Complexity:** ${func.complexity}`);
      lines.push('');
    }

    lines.push(`**Location:** Lines ${func.startLine}-${func.endLine}\n`);

    return lines.join('\n');
  }

  generateClassDoc(cls: ClassInfo): string {
    const lines: string[] = [];

    lines.push(`### \`${cls.name}\`\n`);

    if (cls.docstring) {
      lines.push(cls.docstring);
      lines.push('');
    }

    // Properties
    if (cls.properties.length > 0) {
      lines.push('**Properties:**\n');
      for (const prop of cls.properties) {
        lines.push(`- \`${prop}\``);
      }
      lines.push('');
    }

    // Methods
    if (cls.methods.length > 0) {
      lines.push('**Methods:**\n');
      for (const method of cls.methods) {
        const params = method.parameters.join(', ');
        lines.push(`- \`${method.name}(${params})\``);
      }
      lines.push('');
    }

    lines.push(`**Location:** Lines ${cls.startLine}-${cls.endLine}\n`);

    return lines.join('\n');
  }

  createDocumentationOutput(
    filePath: string,
    content: string
  ): DocumentationOutput {
    return {
      filePath,
      content,
      format: 'markdown',
      generatedAt: new Date().toISOString(),
    };
  }

  private getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  private anchorize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
}
