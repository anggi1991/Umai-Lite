#!/bin/bash
# Final fix for all remaining unused variables

cd /workspaces/parentingAI

echo "🔧 Fixing final unused variables and imports..."

# Remove unused imports with sed
find app/ src/ -name "*.tsx" -o -name "*.ts" | while read file; do
  # Remove LinearGradient if not used
  if grep -q "import.*LinearGradient" "$file" && ! grep -q "LinearGradient" "$file" | grep -v "import"; then
    sed -i '/LinearGradient/d' "$file" 2>/dev/null || true
  fi
  
  # Remove BabyBuddy if not used  
  if grep -q "import.*BabyBuddy" "$file" && ! grep -q "<BabyBuddy" "$file"; then
    sed -i '/BabyBuddy/d' "$file" 2>/dev/null || true
  fi
  
  # Remove Image if not used
  if grep -q "import.*Image.*from 'react-native'" "$file" && ! grep -q "<Image" "$file"; then
    sed -i 's/, Image//' "$file" 2>/dev/null || true
    sed -i 's/Image, //' "$file" 2>/dev/null || true
  fi
  
  # Remove TouchableOpacity if not used
  if grep -q "import.*TouchableOpacity" "$file" && ! grep -q "<TouchableOpacity" "$file" && ! grep -q "TouchableOpacity>" "$file"; then
    sed -i 's/, TouchableOpacity//' "$file" 2>/dev/null || true
    sed -i 's/TouchableOpacity, //' "$file" 2>/dev/null || true
  fi
done

echo "✅ Removed unused imports!"

# Fix specific unused variables
echo "Fixing unused vars in specific files..."

# app/auth-callback.tsx
if [ -f "app/auth-callback.tsx" ]; then
  sed -i 's/const { loading }/const { loading: _loading }/' app/auth-callback.tsx
  sed -i 's/!loading/!_loading/' app/auth-callback.tsx
  sed -i 's/\[loading\]/[_loading]/' app/auth-callback.tsx
  sed -i 's/const { data }/const { data: _data }/' app/auth-callback.tsx
fi

# BadgeShowcase.tsx
if [ -f "src/components/badges/BadgeShowcase.tsx" ]; then
  sed -i 's/(badgeId)/(_{badgeId)/' src/components/badges/BadgeShowcase.tsx
  sed -i 's/const getCategoryIcon/const _getCategoryIcon/' src/components/badges/BadgeShowcase.tsx
fi

# AddActivityModal.tsx - fix case block declaration
if [ -f "src/components/activities/AddActivityModal.tsx" ]; then
  # This needs manual fix - wrap case block content in braces
  echo "⚠️  Please manually fix AddActivityModal.tsx line 96 - wrap case block in braces"
fi

echo "✅ Fixed specific files!"

# Run eslint one more time
echo "Running final ESLint check..."
npx eslint src/ app/ --ext .ts,.tsx 2>&1 | grep -E "problems|✖" | tail -2
