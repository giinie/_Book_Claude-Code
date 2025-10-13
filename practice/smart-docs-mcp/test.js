import { analyzeCodebase } from './dist/tools/analyzeCodebase.js';
import { generateDocumentation } from './dist/tools/generateDocumentation.js';
import { detectMissingDocs } from './dist/tools/detectMissingDocs.js';
import { suggestImprovements } from './dist/tools/suggestImprovements.js';

const testDir = '/Users/giinie/JWS/ClaudeCode/_Book_Claude-Code/practice/smart-docs-mcp/src';

console.log('=== Testing Smart Docs MCP ===\n');

console.log('1. Analyzing codebase...');
try {
  const analysis = await analyzeCodebase(testDir);
  console.log(JSON.stringify(analysis, null, 2));
  console.log('✓ analyze_codebase works!\n');
} catch (error) {
  console.error('✗ analyze_codebase failed:', error.message);
}

console.log('2. Detecting missing docs...');
try {
  const missing = await detectMissingDocs(testDir);
  console.log(`Found ${missing.length} items missing documentation`);
  if (missing.length > 0) {
    console.log('First 3 items:', missing.slice(0, 3));
  }
  console.log('✓ detect_missing_docs works!\n');
} catch (error) {
  console.error('✗ detect_missing_docs failed:', error.message);
}

console.log('3. Suggesting improvements...');
try {
  const improvements = await suggestImprovements(testDir);
  console.log(`Found ${improvements.length} improvement suggestions`);
  if (improvements.length > 0) {
    console.log('First 3 suggestions:', improvements.slice(0, 3));
  }
  console.log('✓ suggest_improvements works!\n');
} catch (error) {
  console.error('✗ suggest_improvements failed:', error.message);
}

console.log('4. Generating documentation...');
try {
  const docs = await generateDocumentation(testDir);
  console.log(`Generated documentation (${docs.length} characters)`);
  console.log('First 500 chars:', docs.substring(0, 500));
  console.log('✓ generate_documentation works!\n');
} catch (error) {
  console.error('✗ generate_documentation failed:', error.message);
}

console.log('=== All tests completed ===');
