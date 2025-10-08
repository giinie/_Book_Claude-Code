/**
 * Custom error classes for smart-docs-mcp
 */

export class SmartDocsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmartDocsError';
  }
}

export class ParserError extends SmartDocsError {
  constructor(message: string, public readonly filePath?: string) {
    super(message);
    this.name = 'ParserError';
  }
}

export class FileSystemError extends SmartDocsError {
  constructor(message: string, public readonly path?: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class ValidationError extends SmartDocsError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends SmartDocsError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function handleError(error: unknown): { error: string; details?: string } {
  if (error instanceof SmartDocsError) {
    return {
      error: error.message,
      details: error instanceof ParserError
        ? error.filePath
        : error instanceof FileSystemError
        ? error.path
        : error instanceof ValidationError
        ? error.field
        : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      details: error.stack,
    };
  }

  return {
    error: 'Unknown error occurred',
    details: String(error),
  };
}
