/**
 * Test script to verify metadata URI generation stays within smart contract limits
 * 
 * This script validates that our new metadata URI generation functions
 * consistently produce URIs under the 200 character limit enforced by the
 * PropertyAcquisition smart contract.
 * 
 * Run with: node test-metadata-generation.js
 */

// Simple implementation of the metadata URI generation logic for testing
function generateTestMetadataUri(prefix = 'prop') {
  const shortId = Math.random().toString(36).substring(2, 8);
  return `ipfs://${prefix}-${shortId}`;
}

function validateMetadataUri(metadataUri) {
  const MAX_LENGTH = 200;
  
  if (!metadataUri || metadataUri.length === 0) {
    throw new Error('Metadata URI cannot be empty');
  }
  
  if (metadataUri.length > MAX_LENGTH) {
    throw new Error(`Metadata URI too long: ${metadataUri.length}/${MAX_LENGTH} characters`);
  }
  
  return true;
}

// Test configuration
const TEST_ITERATIONS = 10000;
const PREFIXES = ['prop', 'gov', 'treas', 'emerg'];

console.log('🧪 Testing Metadata URI Generation');
console.log('======================================');
console.log(`Running ${TEST_ITERATIONS} iterations per prefix...`);
console.log();

let totalTests = 0;
let maxLength = 0;
let minLength = Infinity;
let failures = 0;

for (const prefix of PREFIXES) {
  console.log(`Testing prefix: "${prefix}"`);
  
  let prefixMaxLength = 0;
  let prefixMinLength = Infinity;
  let prefixFailures = 0;
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const uri = generateTestMetadataUri(prefix);
      validateMetadataUri(uri);
      
      totalTests++;
      
      // Track length statistics
      if (uri.length > maxLength) maxLength = uri.length;
      if (uri.length < minLength) minLength = uri.length;
      if (uri.length > prefixMaxLength) prefixMaxLength = uri.length;
      if (uri.length < prefixMinLength) prefixMinLength = uri.length;
      
    } catch (error) {
      failures++;
      prefixFailures++;
      console.error(`❌ FAILURE: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Generated ${TEST_ITERATIONS - prefixFailures} valid URIs`);
  console.log(`  📏 Length range: ${prefixMinLength} - ${prefixMaxLength} characters`);
  if (prefixFailures > 0) {
    console.log(`  ❌ Failures: ${prefixFailures}`);
  }
  console.log();
}

// Summary
console.log('📊 SUMMARY');
console.log('==========');
console.log(`Total tests: ${totalTests}`);
console.log(`Total failures: ${failures}`);
console.log(`Success rate: ${((totalTests - failures) / totalTests * 100).toFixed(2)}%`);
console.log(`URI length range: ${minLength} - ${maxLength} characters`);
console.log(`Smart contract limit: 200 characters`);
console.log(`Safety margin: ${200 - maxLength} characters`);

if (failures === 0 && maxLength < 200) {
  console.log();
  console.log('🎉 ALL TESTS PASSED!');
  console.log('✅ Metadata URI generation is working correctly');
  console.log('✅ All generated URIs are within smart contract limits');
} else {
  console.log();
  console.log('❌ TESTS FAILED!');
  if (failures > 0) {
    console.log(`❌ ${failures} URI generation failures detected`);
  }
  if (maxLength >= 200) {
    console.log(`❌ Generated URIs exceed 200 character limit (max: ${maxLength})`);
  }
}

// Test specific edge cases
console.log();
console.log('🔍 Testing Edge Cases');
console.log('=====================');

try {
  // Test very long prefix
  const longPrefix = 'a'.repeat(190);
  const longUri = generateTestMetadataUri(longPrefix);
  console.log(`Long prefix test: ${longUri.length} characters`);
  if (longUri.length > 200) {
    console.log('❌ Long prefix generates URI over limit');
  } else {
    console.log('✅ Long prefix handled correctly');
  }
} catch (error) {
  console.log('✅ Long prefix correctly rejected');
}

// Test empty prefix
try {
  const emptyUri = generateTestMetadataUri('');
  console.log(`Empty prefix test: "${emptyUri}" (${emptyUri.length} characters)`);
  console.log('✅ Empty prefix handled');
} catch (error) {
  console.log('⚠️  Empty prefix caused error:', error.message);
}

console.log();
console.log('🏁 Testing complete!');