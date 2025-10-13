import { DocumentationItem } from '../types/index.js';

export function generateMarkdown(items: DocumentationItem[], projectName: string): string {
  const md: string[] = [];

  md.push(`# ${projectName} Documentation\n`);
  md.push(`Generated on ${new Date().toLocaleDateString()}\n`);
  md.push('---\n');

  const classes = items.filter(item => item.type === 'class');
  const interfaces = items.filter(item => item.type === 'interface');
  const functions = items.filter(item => item.type === 'function');
  const methods = items.filter(item => item.type === 'method');

  if (classes.length > 0) {
    md.push('## Classes\n');
    for (const cls of classes) {
      md.push(`### ${cls.name}\n`);
      md.push(`**File:** \`${cls.file}\` (line ${cls.line})\n`);
      if (cls.documentation) {
        md.push(`**Description:** ${cls.documentation}\n`);
      }
      md.push('');
    }
  }

  if (interfaces.length > 0) {
    md.push('## Interfaces\n');
    for (const iface of interfaces) {
      md.push(`### ${iface.name}\n`);
      md.push(`**File:** \`${iface.file}\` (line ${iface.line})\n`);
      if (iface.documentation) {
        md.push(`**Description:** ${iface.documentation}\n`);
      }
      md.push('');
    }
  }

  if (functions.length > 0) {
    md.push('## Functions\n');
    for (const func of functions) {
      md.push(`### ${func.name}\n`);
      md.push(`**File:** \`${func.file}\` (line ${func.line})\n`);
      
      if (func.parameters && func.parameters.length > 0) {
        md.push('**Parameters:**\n');
        for (const param of func.parameters) {
          md.push(`- \`${param.name}\`${param.type ? `: ${param.type}` : ''}`);
        }
        md.push('');
      }
      
      if (func.returnType) {
        md.push(`**Returns:** \`${func.returnType}\`\n`);
      }
      
      if (func.documentation) {
        md.push(`**Description:** ${func.documentation}\n`);
      }
      md.push('');
    }
  }

  return md.join('\n');
}
