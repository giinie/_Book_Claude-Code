# Codebase Documentation

**Root Path:** ./src/tools
**Analyzed At:** 10/8/2025, 6:35:27 PM

## Summary

- **Total Files:** 5
- **Total Functions:** 11
- **Total Classes:** 0
- **Total Lines:** 704

### Languages

- **typescript:** 5 files

## File Index

- [`suggestImprovements.ts`](#suggestimprovements-ts) - 5 functions, 0 classes
- [`index.ts`](#index-ts) - 0 functions, 0 classes
- [`generateDocumentation.ts`](#generatedocumentation-ts) - 1 functions, 0 classes
- [`detectMissingDocs.ts`](#detectmissingdocs-ts) - 4 functions, 0 classes
- [`analyzeCodebase.ts`](#analyzecodebase-ts) - 1 functions, 0 classes

## Files

---

# suggestImprovements.ts

**Language:** typescript

**Lines of Code:** 215 / 257

## Imports

- `zod`
- `../types/index.js`
- `./analyzeCodebase.js`
- `../utils/logger.js`

## Functions

### `analyzeDocstring`

/**
 * Suggest Improvements Tool
 * Suggests improvements for existing documentation
 */

**Signature:**

```typescript
analyzeDocstring(docstring, name, filePath, line, params): Improvement[]
```

**Parameters:**

- `docstring`
- `name`
- `filePath`
- `line`
- `params`

**Complexity:** 21

**Location:** Lines 23-105

### `generateStructuredDoc`

/**
 * Suggest Improvements Tool
 * Suggests improvements for existing documentation
 */

**Signature:**

```typescript
generateStructuredDoc(_name, params, original): string
```

**Parameters:**

- `_name`
- `params`
- `original`

**Complexity:** 4

**Location:** Lines 107-124

### `addMissingParams`

/**
 * Suggest Improvements Tool
 * Suggests improvements for existing documentation
 */

**Signature:**

```typescript
addMissingParams(original, missingParams): string
```

**Parameters:**

- `original`
- `missingParams`

**Complexity:** 3

**Location:** Lines 126-138

### `addExample`

/**
 * Suggest Improvements Tool
 * Suggests improvements for existing documentation
 */

**Signature:**

```typescript
addExample(original, funcName, params): string
```

**Parameters:**

- `original`
- `funcName`
- `params`

**Complexity:** 3

**Location:** Lines 140-152

### `suggestImprovements`

**Signature:**

```typescript
suggestImprovements(args): Promise<ImprovementSuggestions>
```

**Parameters:**

- `args`

**Complexity:** 3

**Location:** Lines 154-249

---

# index.ts

**Language:** typescript

**Lines of Code:** 7 / 9

---

# generateDocumentation.ts

**Language:** typescript

**Lines of Code:** 82 / 95

## Imports

- `zod`
- `../types/index.js`
- `./analyzeCodebase.js`
- `../generators/index.js`
- `../utils/fileSystem.js`
- `../utils/logger.js`
- `path`

## Functions

### `generateDocumentation`

**Signature:**

```typescript
generateDocumentation(args): Promise<DocumentationOutput>
```

**Parameters:**

- `args`

**Complexity:** 9

**Location:** Lines 36-87

---

# detectMissingDocs.ts

**Language:** typescript

**Lines of Code:** 204 / 238

## Imports

- `zod`
- `../types/index.js`
- `./analyzeCodebase.js`
- `../utils/logger.js`

## Functions

### `determineSeverity`

/**
 * Detect Missing Documentation Tool
 * Identifies functions and classes lacking documentation with severity levels
 */

**Signature:**

```typescript
determineSeverity(type, item, _context): Severity
```

**Parameters:**

- `type`
- `item`
- `_context`

**Complexity:** 26

**Location:** Lines 31-80

### `checkFunctionDoc`

/**
 * Detect Missing Documentation Tool
 * Identifies functions and classes lacking documentation with severity levels
 */

**Signature:**

```typescript
checkFunctionDoc(func, filePath): MissingDoc[]
```

**Parameters:**

- `func`
- `filePath`

**Complexity:** 8

**Location:** Lines 82-118

### `checkClassDoc`

/**
 * Detect Missing Documentation Tool
 * Identifies functions and classes lacking documentation with severity levels
 */

**Signature:**

```typescript
checkClassDoc(cls, filePath): MissingDoc[]
```

**Parameters:**

- `cls`
- `filePath`

**Complexity:** 7

**Location:** Lines 120-152

### `detectMissingDocs`

**Signature:**

```typescript
detectMissingDocs(args): Promise<MissingDocsReport>
```

**Parameters:**

- `args`

**Complexity:** 5

**Location:** Lines 154-230

---

# analyzeCodebase.ts

**Language:** typescript

**Lines of Code:** 89 / 105

## Imports

- `zod`
- `../types/index.js`
- `../parsers/index.js`
- `../utils/fileSystem.js`
- `../utils/logger.js`

## Functions

### `analyzeCodebase`

**Signature:**

```typescript
analyzeCodebase(args): Promise<CodebaseAnalysis>
```

**Parameters:**

- `args`

**Complexity:** 9

**Location:** Lines 32-97
