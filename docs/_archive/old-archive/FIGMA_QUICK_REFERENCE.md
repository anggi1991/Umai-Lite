# Figma Components Quick Reference

## 🚀 Quick Start

All new Figma components are exported from `src/components/ui`:

```typescript
import { 
  AppBar, 
  QuickActions, 
  TodaysSummary, 
  BottomNavigation 
} from '@/components/ui';

import { BabyBuddy } from '@/components/mascot';
```

---

## 📋 Component Reference

### 1. BabyBuddy (Enhanced)

**Import:**
```typescript
import { BabyBuddy } from '@/components/mascot';
```

**Props:**
```typescript
interface BabyBuddyProps {
  expression?: 'happy' | 'sad' | 'excited' | 'sleeping' | 'waving';
  size?: number;
  animated?: boolean;
  showHalo?: boolean;      // NEW: Glowing halo effect
  showSparkle?: boolean;   // NEW: AI sparkle badge
}
```

**Usage:**
```tsx
// Full featured
<BabyBuddy 
  expression="waving" 
  size={80} 
  animated={true}
  showHalo={true}
  showSparkle={true}
/>

// Minimal (chat avatar)
<BabyBuddy 
  expression="happy" 
  size={32}
  showHalo={false}
  showSparkle={false}
/>
```

---

### 2. AppBar

**Import:**
```typescript
import { AppBar } from '@/components/ui';
```

**Props:**
```typescript
interface AppBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: ('search' | 'bell' | 'menu')[];
  transparent?: boolean;
}
```

**Usage:**
```tsx
// Dashboard header
<AppBar 
  title="Good morning, Sarah 👋" 
  actions={['bell', 'menu']} 
/>

// Chat header with back button
<AppBar 
  title="AI Chat" 
  subtitle="Baby Buddy"
  showBack
  onBack={() => router.back()}
  actions={['menu']}
/>

// Transparent mode
<AppBar 
  title="Profile" 
  transparent
  showBack
/>
```

---

### 3. QuickActions

**Import:**
```typescript
import { QuickActions } from '@/components/ui';
```

**Props:**
```typescript
interface QuickActionsProps {
  onTabChange?: (tab: string) => void;
}
```

**Usage:**
```tsx
// Auto-routing (default)
<QuickActions />

// Custom handler
<QuickActions 
  onTabChange={(tab) => {
    console.log('Tab pressed:', tab);
    // Custom logic
  }}
/>
```

**Actions:**
- `growth` → `/child`
- `chat` → `/chat`
- `journal` → `/activities/history`
- `tips` → (To be implemented)

---

### 4. TodaysSummary

**Import:**
```typescript
import { TodaysSummary } from '@/components/ui';
```

**Props:**
```typescript
interface TodaysSummaryProps {
  feedingCount?: number;
  sleepHours?: number;
  diaperCount?: number;
}
```

**Usage:**
```tsx
// With actual data
<TodaysSummary 
  feedingCount={6}
  sleepHours={14.5}
  diaperCount={8}
/>

// With default values
<TodaysSummary />

// Convert minutes to hours
<TodaysSummary 
  feedingCount={activitySummary.feeding}
  sleepHours={activitySummary.sleep / 60}
  diaperCount={activitySummary.diaper}
/>
```

---

### 5. BottomNavigation

**Import:**
```typescript
import { BottomNavigation } from '@/components/ui';
```

**Props:**
```typescript
interface BottomNavigationProps {
  onTabChange?: (tab: string) => void;
}
```

**Usage:**
```tsx
// In _layout.tsx
<View style={{ flex: 1 }}>
  <Stack screenOptions={{ headerShown: false }} />
  <BottomNavigation />
</View>

// With custom handler
<BottomNavigation 
  onTabChange={(tab) => {
    console.log('Tab changed:', tab);
  }}
/>
```

**Tabs:**
- `home` → `/dashboard`
- `journal` → `/activities/history`
- `chat` → `/chat`
- `stats` → `/child` (Child Profile dengan Growth Stats preview)
  - Klik "Lihat Pertumbuhan Lengkap" → `/growth-tracker?childId=xxx`
- `profile` → `/settings`

---

## 🎨 Theme Tokens

### Colors
```typescript
theme.colors.babyBlue    // #AEE1F9 - Primary
theme.colors.softPink    // #FADADD - Secondary
theme.colors.primary     // #2196F3 - Accent
theme.colors.background  // #FFFFFF - Background
theme.colors.textPrimary // #2C3E50 - Main text
theme.colors.textSecondary // #7F8C8D - Secondary text
theme.colors.divider     // #E0E0E0 - Borders
```

### Gradients
```typescript
// BabyBuddy Halo
colors: [theme.colors.babyBlue, theme.colors.softPink]

// User Message Bubble
colors: [theme.colors.softPink, '#FFB6C1']

// Quick Actions
Growth: ['#AEE1F9', '#87CEEB']
Chat: ['#FADADD', '#FFB6C1']
Journal: ['#E0BBE4', '#D8A7D8']
Tips: ['#FFE5B4', '#FFD699']
```

### Spacing
```typescript
theme.spacing.xs  // 4px
theme.spacing.sm  // 8px
theme.spacing.md  // 16px
theme.spacing.lg  // 24px
theme.spacing.xl  // 32px
```

### Border Radius
```typescript
theme.borders.radius.small  // 8px
theme.borders.radius.medium // 16px
theme.borders.radius.large  // 24px
```

---

## 💡 Common Patterns

### Dashboard Layout
```tsx
function Dashboard() {
  return (
    <ScrollView>
      <AppBar 
        title={`Good ${getGreeting()}, ${userName} 👋`}
        actions={['bell', 'menu']}
      />
      
      <View style={styles.mascotContainer}>
        <BabyBuddy 
          expression="waving" 
          size={80} 
          showHalo={true}
          showSparkle={true}
        />
      </View>
      
      <QuickActions />
      
      <TodaysSummary 
        feedingCount={summary.feeding}
        sleepHours={summary.sleep / 60}
        diaperCount={summary.diaper}
      />
      
      {/* Other content */}
    </ScrollView>
  );
}

// Helper function
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
```

### Chat Screen Layout
```tsx
function ChatScreen() {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <AppBar 
        title="AI Chat" 
        subtitle="Baby Buddy"
        showBack
        actions={['menu']}
      />
      
      <View style={styles.mascotHeader}>
        <BabyBuddy 
          size={48} 
          showHalo={true}
          showSparkle={true}
        />
        <Text>Ask me anything about parenting! 💬</Text>
      </View>
      
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble message={item} />
        )}
      />
      
      {/* Input bar */}
    </KeyboardAvoidingView>
  );
}
```

### Message Bubble
```tsx
// User message (gradient)
<LinearGradient
  colors={[theme.colors.softPink, '#FFB6C1']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.userBubble}
>
  <Text>{message.content}</Text>
  <Text style={styles.timestamp}>{formatTime(message.created_at)}</Text>
</LinearGradient>

// AI message (white card)
<View style={styles.assistantBubble}>
  <BabyBuddy size={32} showHalo={false} />
  <View style={styles.messageContent}>
    <Markdown>{message.content}</Markdown>
    <Text style={styles.timestamp}>{formatTime(message.created_at)}</Text>
  </View>
</View>
```

---

## 🔧 Customization

### Override Styles
```tsx
// AppBar with custom height
<AppBar 
  title="Custom" 
  style={{ height: 64 }}
/>

// QuickActions with custom layout
<QuickActions 
  style={{ padding: 24 }}
  onTabChange={(tab) => {
    // Custom logic
  }}
/>

// TodaysSummary with custom colors
<TodaysSummary 
  feedingCount={6}
  style={{ backgroundColor: '#F0F0F0' }}
/>
```

### Custom Gradients
```tsx
import { LinearGradient } from 'expo-linear-gradient';

// Custom gradient button
<LinearGradient
  colors={['#FF6B6B', '#FFD93D']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.customButton}
>
  <Text>Custom Action</Text>
</LinearGradient>
```

### Custom BabyBuddy Expressions
```tsx
// Add new expression in BabyBuddy.tsx
const EXPRESSIONS = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  sleeping: '😴',
  waving: '👋',
  thinking: '🤔',  // NEW
  celebrating: '🎉', // NEW
};

// Use in component
<BabyBuddy expression="thinking" />
```

---

## 🐛 Troubleshooting

### BabyBuddy not showing halo
```tsx
// Make sure LinearGradient is imported
import { LinearGradient } from 'expo-linear-gradient';

// Check showHalo prop
<BabyBuddy showHalo={true} />

// Verify opacity in styles
halo: {
  opacity: 0.3, // Increase if not visible
}
```

### AppBar not responsive
```tsx
// Ensure proper flex layout
<View style={{ flex: 1 }}>
  <AppBar title="..." />
  <ScrollView style={{ flex: 1 }}>
    {/* Content */}
  </ScrollView>
</View>
```

### QuickActions not navigating
```tsx
// Check router import
import { router } from 'expo-router';

// Verify routes exist
// app/child/index.tsx
// app/chat/index.tsx
// app/activities/history.tsx
```

### TodaysSummary not updating
```tsx
// Ensure data is passed correctly
<TodaysSummary 
  feedingCount={summary.feeding || 0}
  sleepHours={summary.sleep ? summary.sleep / 60 : 0}
  diaperCount={summary.diaper || 0}
/>

// Force re-render with key
<TodaysSummary 
  key={Date.now()}
  feedingCount={summary.feeding}
/>
```

---

## 📚 Related Documentation

- [Complete Implementation Summary](./FIGMA_COMPLETE_SUMMARY.md)
- [Dashboard Integration Guide](./FIGMA_DASHBOARD_INTEGRATION.md)
- [Testing Guide](../testing/FIGMA_TESTING_GUIDE.md)
- [Design System](../references/DESIGN_SYSTEM.md)
- [Component Guidelines](../references/COMPONENT_GUIDELINES.md)

---

## 🎯 Best Practices

### Performance
```tsx
// Use React.memo for pure components
export const QuickActions = React.memo(({ onTabChange }) => {
  // ...
});

// Use useCallback for handlers
const handlePress = useCallback((tab: string) => {
  onTabChange?.(tab);
}, [onTabChange]);

// Use FlatList for long lists
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
/>
```

### Accessibility
```tsx
// Add accessibility labels
<AppBar 
  title="Dashboard"
  accessibilityLabel="Dashboard header with notifications"
/>

// Use accessible colors (WCAG AA)
// Ensure contrast ratio ≥ 4.5:1

// Add touch targets (min 48x48)
<TouchableOpacity 
  style={{ minWidth: 48, minHeight: 48 }}
  accessibilityRole="button"
>
  <Icon />
</TouchableOpacity>
```

### Type Safety
```tsx
// Always define prop types
interface MyComponentProps {
  title: string;
  count?: number;
  onPress: () => void;
}

export function MyComponent({ 
  title, 
  count = 0, 
  onPress 
}: MyComponentProps) {
  // ...
}

// Use discriminated unions for variants
type MessageSender = 'user' | 'assistant';

interface Message {
  id: string;
  sender: MessageSender;
  content: string;
}
```

---

**Last Updated:** November 10, 2025  
**Version:** 1.0.0  
**Maintained By:** Development Team
