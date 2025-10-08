#!/usr/bin/env node

/**
 * Smart Docs MCP Server
 * Production-ready MCP server for codebase analysis and documentation generation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import {
  analyzeCodebase,
  analyzeCodebaseToolDefinition,
} from './tools/analyzeCodebase.js';
import {
  generateDocumentation,
  generateDocumentationToolDefinition,
} from './tools/generateDocumentation.js';
import {
  detectMissingDocs,
  detectMissingDocsToolDefinition,
} from './tools/detectMissingDocs.js';
import {
  suggestImprovements,
  suggestImprovementsToolDefinition,
} from './tools/suggestImprovements.js';

import { handleError } from './utils/errors.js';
import { logger, LogLevel } from './utils/logger.js';

// Configure logger based on environment
const logLevel = process.env.LOG_LEVEL || 'info';
logger.setLevel(
  logLevel === 'debug'
    ? LogLevel.DEBUG
    : logLevel === 'warn'
    ? LogLevel.WARN
    : logLevel === 'error'
    ? LogLevel.ERROR
    : LogLevel.INFO
);

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
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

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Listing available tools');

    return {
      tools: [
        analyzeCodebaseToolDefinition,
        generateDocumentationToolDefinition,
        detectMissingDocsToolDefinition,
        suggestImprovementsToolDefinition,
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info(`Tool called: ${name}`);
    logger.debug(`Arguments: ${JSON.stringify(args)}`);

    try {
      switch (name) {
        case 'analyze_codebase': {
          const result = await analyzeCodebase(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'generate_documentation': {
          const result = await generateDocumentation(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'detect_missing_docs': {
          const result = await detectMissingDocs(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'suggest_improvements': {
          const result = await suggestImprovements(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, error);

      const errorInfo = handleError(error);

      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${errorInfo.error}`,
        errorInfo.details
      );
    }
  });

  // Error handling
  server.onerror = (error) => {
    logger.error('Server error occurred', error);
  };

  return server;
}

/**
 * Main entry point
 */
async function main() {
  logger.info('Starting Smart Docs MCP Server...');

  try {
    const server = createServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);

    logger.info('Smart Docs MCP Server running on stdio');
    logger.info('Available tools: analyze_codebase, generate_documentation, detect_missing_docs, suggest_improvements');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server
main();
