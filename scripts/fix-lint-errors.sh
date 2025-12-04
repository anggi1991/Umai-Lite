#!/bin/bash
# Script to fix ESLint errors automatically

echo "🔧 Fixing ESLint errors..."

# Fix unused imports and variables using eslint --fix
cd /workspaces/parentingAI
npx eslint . --ext .ts,.tsx --fix --rule 'no-unused-vars:off' --rule 'no-console:off' 2>&1 | head -100

echo "✅ Auto-fix complete. Running eslint again to check remaining issues..."
npx eslint . --ext .ts,.tsx --max-warnings 0 2>&1 | head -100
