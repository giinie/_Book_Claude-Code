/**
 * Simple test script for MCP tools
 */

import { analyzeCodebase } from './dist/tools/analyzeCodebase.js';
import { generateDocumentation } from './dist/tools/generateDocumentation.js';
import { detectMissingDocs } from './dist/tools/detectMissingDocs.js';
import { suggestImprovements } from './dist/tools/suggestImprovements.js';

const TEST_PATH = './src/tools';

async function runTests() {
  console.log('🧪 Starting Smart Docs MCP Server Tests\n');

  // Test 1: Analyze Codebase
  console.log('📊 Test 1: Analyzing codebase...');
  try {
    const analysis = await analyzeCodebase({
      path: TEST_PATH,
      excludePatterns: ['**/node_modules/**', '**/dist/**'],
    });

    console.log('✅ Analysis completed');
    console.log(`   - Files analyzed: ${analysis.summary.totalFiles}`);
    console.log(`   - Total functions: ${analysis.summary.totalFunctions}`);
    console.log(`   - Total classes: ${analysis.summary.totalClasses}`);
    console.log(`   - Total lines: ${analysis.summary.totalLines}`);
    console.log('');
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }

  // Test 2: Detect Missing Docs
  console.log('🔍 Test 2: Detecting missing documentation...');
  try {
    const missing = await detectMissingDocs({
      path: TEST_PATH,
      severity: ['critical', 'medium'],
    });

    console.log('✅ Detection completed');
    console.log(`   - Total missing: ${missing.summary.total}`);
    console.log(`   - Critical: ${missing.summary.bySeverity.critical}`);
    console.log(`   - Medium: ${missing.summary.bySeverity.medium}`);
    console.log(`   - Low: ${missing.summary.bySeverity.low}`);

    if (missing.missing.length > 0) {
      console.log('\n   Top 3 missing docs:');
      missing.missing.slice(0, 3).forEach((doc, i) => {
        console.log(`   ${i + 1}. [${doc.severity}] ${doc.name} (${doc.filePath}:${doc.line})`);
        console.log(`      ${doc.reason}`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('❌ Detection failed:', error.message);
  }

  // Test 3: Suggest Improvements
  console.log('💡 Test 3: Suggesting improvements...');
  try {
    const suggestions = await suggestImprovements({
      path: TEST_PATH,
      types: ['structure', 'clarity'],
    });

    console.log('✅ Suggestions generated');
    console.log(`   - Total suggestions: ${suggestions.summary.total}`);
    console.log(`   - Structure: ${suggestions.summary.byType.structure || 0}`);
    console.log(`   - Clarity: ${suggestions.summary.byType.clarity || 0}`);
    console.log(`   - Completeness: ${suggestions.summary.byType.completeness || 0}`);
    console.log(`   - Examples: ${suggestions.summary.byType.examples || 0}`);

    if (suggestions.improvements.length > 0) {
      console.log('\n   Sample improvement:');
      const sample = suggestions.improvements[0];
      console.log(`   - File: ${sample.filePath}:${sample.line}`);
      console.log(`   - Type: ${sample.type}`);
      console.log(`   - Reason: ${sample.reason}`);
    }
    console.log('');
  } catch (error) {
    console.error('❌ Suggestions failed:', error.message);
  }

  // Test 4: Generate Documentation
  console.log('📝 Test 4: Generating documentation...');
  try {
    const docs = await generateDocumentation({
      path: TEST_PATH,
      outputPath: './test-docs.md',
    });

    console.log('✅ Documentation generated');
    console.log(`   - Output: ${docs.filePath}`);
    console.log(`   - Format: ${docs.format}`);
    console.log(`   - Generated at: ${new Date(docs.generatedAt).toLocaleString()}`);
    console.log(`   - Size: ${docs.content.length} characters`);
    console.log('');
  } catch (error) {
    console.error('❌ Documentation generation failed:', error.message);
  }

  console.log('🎉 All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
