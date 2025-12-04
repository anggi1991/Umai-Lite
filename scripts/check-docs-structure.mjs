#!/usr/bin/env node
/**
 * Documentation Structure Guard
 * Prevents new top-level markdown sprawl outside /docs except allowed root files.
 */
import { readdirSync, statSync } from 'fs';
import path from 'path';

const root = process.cwd();
const allowedRootFiles = new Set([
  'README.md',
  'CHANGELOG.md',
  'NEXT_STEPS.md',
  'DOCS.md' // pointer file
]);

function findTopLevelMarkdown() {
  const entries = readdirSync(root);
  return entries.filter((e) => e.endsWith('.md'));
}

function main() {
  const topLevel = findTopLevelMarkdown();
  const violations = topLevel.filter(f => !allowedRootFiles.has(f));

  if (violations.length) {
    console.error('\n❌ Documentation guard failed. Move these files into /docs subfolders:');
    violations.forEach(v => console.error(' - ' + v));
    console.error('\nAllowed root markdown files:', Array.from(allowedRootFiles).join(', '));
    process.exit(1);
  }

  console.log('✅ Docs structure OK. No stray top-level markdown files.');
}

main();
