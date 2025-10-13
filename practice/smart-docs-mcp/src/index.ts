#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { analyzeCodebase } from './tools/analyzeCodebase.js';
import { generateDocumentation } from './tools/generateDocumentation.js';
import { detectMissingDocs } from './tools/detectMissingDocs.js';
import { suggestImprovements } from './tools/suggestImprovements.js';

const server = new Server(
  {
    name: 'smart-docs-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: 'analyze_codebase',
    description: 'Analyzes a codebase and returns statistics about documentation coverage, including total files, functions, classes, and documentation percentage. Supports TypeScript, JavaScript, and Python.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Absolute path to the directory to analyze',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'generate_documentation',
    description: 'Generates comprehensive markdown documentation for a codebase, including all classes, interfaces, functions, and methods with their parameters and return types.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Absolute path to the directory to document',
        },
        outputPath: {
          type: 'string',
          description: 'Optional absolute path where to save the documentation file',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'detect_missing_docs',
    description: 'Detects all functions, classes, methods, and interfaces that are missing documentation. Returns items sorted by severity (critical, medium, low).',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Absolute path to the directory to check',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'suggest_improvements',
    description: 'Analyzes existing documentation and suggests improvements such as missing parameter descriptions, missing return value documentation, or incomplete descriptions. Returns suggestions sorted by severity.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Absolute path to the directory to analyze',
        },
      },
      required: ['directory'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'analyze_codebase': {
        const { directory } = args as { directory: string };
        const analysis = await analyzeCodebase(directory);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'generate_documentation': {
        const { directory, outputPath } = args as {
          directory: string;
          outputPath?: string;
        };
        const markdown = await generateDocumentation(directory, outputPath);
        
        return {
          content: [
            {
              type: 'text',
              text: markdown,
            },
          ],
        };
      }

      case 'detect_missing_docs': {
        const { directory } = args as { directory: string };
        const missingDocs = await detectMissingDocs(directory);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(missingDocs, null, 2),
            },
          ],
        };
      }

      case 'suggest_improvements': {
        const { directory } = args as { directory: string };
        const improvements = await suggestImprovements(directory);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(improvements, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Smart Docs MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
