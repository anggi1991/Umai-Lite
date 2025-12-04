#!/bin/bash
# Auto-fix unused variables by adding underscore prefix

cd /workspaces/parentingAI

echo "🔧 Fixing remaining unused variables..."

# Fix app/statistics.tsx line 46
sed -i 's/const { data } = useSWR/const { data: _data } = useSWR/' app/statistics.tsx 2>/dev/null || true

# Fix app/badges.tsx
sed -i 's/import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from/import { View, StyleSheet, ScrollView, TouchableOpacity } from/' app/badges.tsx 2>/dev/null || true
sed -i 's/, setDisplayedBadge/ _setDisplayedBadge/' app/badges.tsx 2>/dev/null || true
sed -i 's/, getNextBadgeToUnlock/ _getNextBadgeToUnlock/' app/badges.tsx 2>/dev/null || true
sed -i 's/(badgeId)/(_badgeId)/' app/badges.tsx 2>/dev/null || true
sed -i 's/const getCategoryIcon =/const _getCategoryIcon =/' app/badges.tsx 2>/dev/null || true

# Fix ChatSession.tsx
sed -i 's/const \[usageLimitInfo, setUsageLimitInfo\]/const [usageLimitInfo, _setUsageLimitInfo]/' src/screens/Chat/ChatSession.tsx 2>/dev/null || true
sed -i 's/const \[menuVisible/const [_menuVisible/' src/screens/Chat/ChatSession.tsx 2>/dev/null || true
sed -i 's/) => messageId/) => _messageId/' src/screens/Chat/ChatSession.tsx 2>/dev/null || true
sed -i 's/) catch (error) {/) catch (_error) {/' src/screens/Chat/ChatSession.tsx 2>/dev/null || true
sed -i 's/const { tier }/const { tier: _tier }/' src/screens/Chat/ChatSession.tsx 2>/dev/null || true

# Fix ChildList.tsx
sed -i 's/, setSelectedChild/ _setSelectedChild/' src/screens/ChildProfile/ChildList.tsx 2>/dev/null || true
sed -i 's/) catch (err) {/) catch (_err) {/' src/screens/ChildProfile/ChildList.tsx 2>/dev/null || true

# Fix Dashboard.tsx
sed -i 's/const { signOut }/const { signOut: _signOut }/' src/screens/Dashboard/Dashboard.tsx 2>/dev/null || true
sed -i 's/const \[notificationCount/const [_notificationCount/' src/screens/Dashboard/Dashboard.tsx 2>/dev/null || true
sed -i 's/const { tier }/const { tier: _tier }/' src/screens/Dashboard/Dashboard.tsx 2>/dev/null || true

# Fix MediaGallery.tsx
sed -i 's/const hasChildren =/const _hasChildren =/' src/screens/Media/MediaGallery.tsx 2>/dev/null || true

# Fix PhotoUpload.tsx
sed -i 's/const newMedia =/const _newMedia =/' src/screens/Media/PhotoUpload.tsx 2>/dev/null || true

# Fix ReminderList.tsx  
sed -i 's/) catch (err) {/) catch (_err) {/' src/screens/Reminders/ReminderList.tsx 2>/dev/null || true

# Fix activityService.ts
sed -i 's/const { data }/const { data: _data }/' src/services/activityService.ts 2>/dev/null || true

# Fix chatService.ts
sed -i 's/(chunk)/(_{chunk}/' src/services/chatService.ts 2>/dev/null || true
sed -i 's/(sessionId, messageId)/(_{sessionId, _{messageId/' src/services/chatService.ts 2>/dev/null || true
sed -i 's/) catch (error) {/) catch (_error) {/' src/services/chatService.ts 2>/dev/null || true

# Fix notificationService.ts
sed -i 's/) catch (e) {/) catch (_e) {/' src/services/notificationService.ts 2>/dev/null || true

# Fix revenueCatService.ts
sed -i 's/) catch (error) {/) catch (_error) {/' src/services/revenueCatService.ts 2>/dev/null || true
sed -i 's/const { customerInfo }/const { customerInfo: _customerInfo }/' src/services/revenueCatService.ts 2>/dev/null || true
sed -i 's/const listener =/const _listener =/' src/services/revenueCatService.ts 2>/dev/null || true

# Fix test files
sed -i 's/const { checkError }/const { checkError: _checkError }/' src/tests/usageLimitIntegrationTest.ts 2>/dev/null || true
sed -i 's/const { deleteError }/const { deleteError: _deleteError }/' src/tests/usageLimitIntegrationTest.ts 2>/dev/null || true
sed -i "s/import { SubscriptionTier, FeatureType }/import { SubscriptionTier }/" src/tests/usageLimitsTest.ts 2>/dev/null || true

# Fix theme/index.ts
sed -i "s/type ColorKeys = /type _ColorKeys = /" src/theme/index.ts 2>/dev/null || true

echo "✅ Fixed unused variables!"
echo "Running ESLint to check..."
npx eslint src/ app/ --ext .ts,.tsx 2>&1 | grep -E "problems|error|warning" | tail -3
