#!/usr/bin/env node

/**
 * Translation Validation Script
 * Validates that all translation files have consistent keys and structure
 * Run with: node scripts/validate-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...extractKeys(obj[key], fullKey));
    } else if (typeof obj[key] === 'string') {
      keys.push(fullKey);
    }
  }
  return keys;
}

function extractParameters(text) {
  const regex = /\{\{(\w+)\}\}/g;
  const params = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    params.push(match[1]);
  }
  return params;
}

function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

async function validateTranslations() {
  log('\n🔍 Starting Translation Validation...\n', 'blue');

  const translationsDir = path.join(__dirname, '..', 'src', 'i18n', 'translations');
  const languages = ['id', 'en', 'jp', 'zh'];
  const translations = {};
  let hasErrors = false;

  // Load all translation files
  log('📂 Loading translation files...', 'blue');
  for (const lang of languages) {
    try {
      const filePath = path.join(translationsDir, `${lang}.ts`);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract the exported object (simple regex approach)
      const match = content.match(/export const \w+ = ({[\s\S]+});/);
      if (match) {
        // Use eval safely in controlled environment
        translations[lang] = eval(`(${match[1]})`);
        log(`  ✓ ${lang}.ts loaded`, 'green');
      } else {
        log(`  ✗ Failed to parse ${lang}.ts`, 'red');
        hasErrors = true;
      }
    } catch (error) {
      log(`  ✗ Error loading ${lang}.ts: ${error.message}`, 'red');
      hasErrors = true;
    }
  }

  if (Object.keys(translations).length === 0) {
    log('\n❌ No translations loaded. Exiting.', 'red');
    process.exit(1);
  }

  // Extract all keys from each language
  log('\n📋 Extracting translation keys...', 'blue');
  const allKeys = {};
  for (const lang of languages) {
    if (translations[lang]) {
      allKeys[lang] = extractKeys(translations[lang]);
      log(`  ${lang}: ${allKeys[lang].length} keys`, 'green');
    }
  }

  // Check for missing keys
  log('\n🔎 Checking for missing keys...', 'blue');
  const baseKeys = allKeys[languages[0]];
  let missingKeysFound = false;

  for (const lang of languages.slice(1)) {
    const missingKeys = baseKeys.filter(key => !allKeys[lang].includes(key));
    const extraKeys = allKeys[lang].filter(key => !baseKeys.includes(key));

    if (missingKeys.length > 0) {
      log(`  ✗ ${lang} is missing ${missingKeys.length} keys:`, 'red');
      missingKeys.slice(0, 10).forEach(key => log(`    - ${key}`, 'red'));
      if (missingKeys.length > 10) {
        log(`    ... and ${missingKeys.length - 10} more`, 'yellow');
      }
      missingKeysFound = true;
      hasErrors = true;
    }

    if (extraKeys.length > 0) {
      log(`  ✗ ${lang} has ${extraKeys.length} extra keys:`, 'yellow');
      extraKeys.slice(0, 10).forEach(key => log(`    - ${key}`, 'yellow'));
      if (extraKeys.length > 10) {
        log(`    ... and ${extraKeys.length - 10} more`, 'yellow');
      }
    }
  }

  if (!missingKeysFound) {
    log('  ✓ All languages have the same keys', 'green');
  }

  // Check parameter consistency
  log('\n🔧 Checking parameter consistency...', 'blue');
  let paramInconsistencies = false;

  for (const key of baseKeys) {
    const params = {};
    let inconsistent = false;

    for (const lang of languages) {
      if (translations[lang]) {
        const value = getValueByPath(translations[lang], key);
        if (typeof value === 'string') {
          params[lang] = extractParameters(value).sort();
        }
      }
    }

    // Compare parameters across languages
    const baseParams = params[languages[0]] || [];
    for (const lang of languages.slice(1)) {
      const langParams = params[lang] || [];
      if (JSON.stringify(baseParams) !== JSON.stringify(langParams)) {
        if (!inconsistent) {
          log(`  ✗ Parameter mismatch for key: ${key}`, 'yellow');
          inconsistent = true;
          paramInconsistencies = true;
        }
        log(`    ${lang}: [${langParams.join(', ')}] vs base: [${baseParams.join(', ')}]`, 'yellow');
      }
    }
  }

  if (!paramInconsistencies) {
    log('  ✓ All parameters are consistent', 'green');
  }

  // Summary
  log('\n📊 Validation Summary:', 'blue');
  log(`  Total languages: ${languages.length}`, 'blue');
  log(`  Total keys per language: ${baseKeys.length}`, 'blue');
  log(`  Total translations: ${baseKeys.length * languages.length}`, 'blue');

  if (hasErrors) {
    log('\n❌ Validation completed with errors', 'red');
    process.exit(1);
  } else {
    log('\n✅ Validation completed successfully!', 'green');
    log('All translation files are consistent and complete.', 'green');
    process.exit(0);
  }
}

// Run validation
validateTranslations().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
