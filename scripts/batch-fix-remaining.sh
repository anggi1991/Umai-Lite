#!/bin/bash
# Batch fix for remaining 6 screens with LinearGradient issues

cd /workspaces/parentingAI

echo "🔧 Fixing remaining 6 screens..."

# Array of files to fix
declare -A files=(
  ["src/screens/Chat/ChatList.tsx"]="theme.colors.babyBlue, theme.colors.softPink"
  ["src/screens/Dashboard/Dashboard.tsx"]="theme.colors.babyBlue, theme.colors.white"
  ["src/screens/Media/MediaGallery.tsx"]="theme.colors.babyBlue, theme.colors.softPink"
  ["src/screens/Reminders/AddReminder.tsx"]="theme.colors.babyBlue, theme.colors.softPink"
  ["src/screens/Reminders/ReminderList.tsx"]="theme.colors.babyBlue, theme.colors.softPink"
  ["src/screens/ChildProfile/ChildList.tsx"]="theme.colors.babyBlue, theme.colors.softPink"
)

for file in "${!files[@]}"; do
  if [ -f "$file" ]; then
    echo "Checking $file..."
    
    # Check if file has colors={[ without LinearGradient import
    if grep -q "colors={\[" "$file" && ! grep -q "import.*LinearGradient" "$file"; then
      echo "  ⚠️  $file needs LinearGradient import"
    fi
  fi
done

echo ""
echo "✅ Check complete. Manual fixes needed for JSX structure."
