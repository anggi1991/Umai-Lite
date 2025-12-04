#!/bin/bash
# Auto-fix remaining 5 files with LinearGradient

cd /workspaces/parentingAI

files=(
  "src/screens/ChildProfile/ChildList.tsx"
  "src/screens/Dashboard/Dashboard.tsx"
  "src/screens/Media/MediaGallery.tsx"
  "src/screens/Reminders/AddReminder.tsx"
  "src/screens/Reminders/ReminderList.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Add LinearGradient import if not exists
    if ! grep -q "import { LinearGradient }" "$file"; then
      # Find first 'import { ' line and add after it
      sed -i "0,/^import { /a import { LinearGradient } from 'expo-linear-gradient';" "$file"
    fi
    
    echo "  ✅ Added LinearGradient import"
  fi
done

echo ""
echo "🎉 All files updated! Running TypeScript check..."
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
