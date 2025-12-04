#!/bin/bash
# Script untuk fix unused variables dengan menambahkan underscore prefix

echo "🔧 Fixing unused variables..."

# Fix: const { variable } = ... yang tidak digunakan jadi const { _variable } = ...
# Fix: function params yang tidak digunakan

cd /workspaces/parentingAI

# Array file yang perlu di-fix
files=(
  "app/index.tsx:10:loading:_loading"
  "app/statistics.tsx:46:data:_data"
  "app/badges.tsx:22:setDisplayedBadge:_setDisplayedBadge"
  "app/badges.tsx:25:getNextBadgeToUnlock:_getNextBadgeToUnlock"
  "app/badges.tsx:90:badgeId:_badgeId"
  "app/badges.tsx:130:getCategoryIcon:_getCategoryIcon"
  "app/badges.tsx:7:Image:_Image"
  "src/screens/Chat/ChatSession.tsx:45:setUsageLimitInfo:_setUsageLimitInfo"
  "src/screens/Chat/ChatSession.tsx:46:menuVisible:_menuVisible"
  "src/screens/Chat/ChatSession.tsx:325:messageId:_messageId"
  "src/screens/Chat/ChatSession.tsx:484:error:_error"
  "src/screens/Chat/ChatSession.tsx:503:tier:_tier"
  "src/screens/ChildProfile/ChildList.tsx:23:setSelectedChild:_setSelectedChild"
  "src/screens/ChildProfile/ChildList.tsx:55:err:_err"
  "src/screens/Dashboard/Dashboard.tsx:30:signOut:_signOut"
  "src/screens/Dashboard/Dashboard.tsx:61:notificationCount:_notificationCount"
  "src/screens/Dashboard/Dashboard.tsx:410:tier:_tier"
  "src/screens/Media/MediaGallery.tsx:54:hasChildren:_hasChildren"
  "src/screens/Media/PhotoUpload.tsx:52:newMedia:_newMedia"
  "src/screens/Reminders/ReminderList.tsx:51:err:_err"
  "src/services/activityService.ts:213:data:_data"
  "src/services/chatService.ts:128:chunk:_chunk"
  "src/services/chatService.ts:129:sessionId:_sessionId"
  "src/services/chatService.ts:129:messageId:_messageId"
  "src/services/chatService.ts:130:error:_error"
  "src/services/notificationService.ts:25:e:_e"
  "src/services/revenueCatService.ts:88:error:_error"
  "src/services/revenueCatService.ts:451:customerInfo:_customerInfo"
  "src/services/revenueCatService.ts:453:listener:_listener"
  "src/tests/usageLimitIntegrationTest.ts:81:checkError:_checkError"
  "src/tests/usageLimitIntegrationTest.ts:279:deleteError:_deleteError"
  "src/tests/usageLimitsTest.ts:11:FeatureType:_FeatureType"
  "src/theme/index.ts:6:ColorKeys:_ColorKeys"
)

echo "✅ Ready to fix ${#files[@]} unused variables"
echo "Please manually fix these files or run eslint --fix again"
