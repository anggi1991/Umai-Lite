#!/bin/bash
# Fix all files with missing LinearGradient and BabyBuddy imports

cd /workspaces/parentingAI

echo "🔧 Restoring removed components..."

# List of files that need LinearGradient restored
FILES_NEEDING_LINEAR_GRADIENT=(
  "src/components/ui/AppHeader.tsx"
  "src/components/ui/QuickActions.tsx"
  "src/screens/Auth/SignIn.tsx"
  "src/screens/Auth/SignUp.tsx"
  "src/screens/Chat/ChatList.tsx"
  "src/screens/Dashboard/Dashboard.tsx"
  "src/screens/Media/MediaGallery.tsx"
  "src/screens/Reminders/AddReminder.tsx"
  "src/screens/Reminders/ReminderList.tsx"
)

# Files needing BabyBuddy restored
FILES_NEEDING_BABY_BUDDY=(
  "src/components/mascot/BabyBuddy.tsx"
  "src/components/chat/MessageBubble.tsx"
)

# Fix LinearGradient imports
for file in "${FILES_NEEDING_LINEAR_GRADIENT[@]}"; do
  if [ -f "$file" ]; then
    # Check if file has colors={[ but no LinearGradient import
    if grep -q "colors={\[" "$file" && ! grep -q "LinearGradient" "$file"; then
      echo "Fixing $file - adding LinearGradient import"
      
      # Add import after first import line
      sed -i "1 a import { LinearGradient } from 'expo-linear-gradient';" "$file"
      
      # Fix opening tag - find lines with just "colors={[" and add <LinearGradient before it
      # This is complex, better to do manually for each file
    fi
  fi
done

echo "⚠️  Manual fixes required for complex JSX restructuring"
echo "Please check these files:"
for file in "${FILES_NEEDING_LINEAR_GRADIENT[@]}"; do
  if [ -f "$file" ]; then
    echo "  - $file"
  fi
done

echo ""
echo "Run: npx tsc --noEmit | head -30"
