# 🎨 AppHeader Component - Quick Reference

## 📖 Import
```tsx
import { AppHeader } from '../../components/ui';
```

## 🚀 Basic Usage

### Simple Header
```tsx
<AppHeader title="My Screen" showBackButton />
```

### Header with Menu
```tsx
<AppHeader 
  title="My Screen"
  showBackButton
  menuItems={[
    { title: 'Edit', icon: 'pencil', onPress: handleEdit },
    { title: 'Delete', icon: 'delete', onPress: handleDelete, divider: true },
  ]}
/>
```

### White Variant (Chat/Detail Screens)
```tsx
<AppHeader 
  title="Chat"
  subtitle="AI Assistant"
  variant="white"
  showBackButton
/>
```

### Custom Right Component
```tsx
<AppHeader 
  title="My Screen"
  showBackButton
  customRight={
    <IconButton icon="search" onPress={handleSearch} />
  }
/>
```

## 📋 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Header title text |
| `subtitle` | `string` | - | Optional subtitle below title |
| `showBackButton` | `boolean` | `true` | Show/hide back button |
| `onBack` | `() => void` | `router.back()` | Custom back handler |
| `variant` | `'gradient' \| 'white'` | `'gradient'` | Header style variant |
| `rightIcon` | `string` | - | Single icon button (Material Icons) |
| `onRightPress` | `() => void` | - | Handler for right icon |
| `menuItems` | `MenuItem[]` | - | Menu items for kebab menu |
| `customRight` | `ReactNode` | - | Custom right component |

### MenuItem Interface
```tsx
{
  title: string;        // Menu item text
  icon: string;         // Material icon name
  onPress: () => void;  // Click handler
  divider?: boolean;    // Show divider before this item
}
```

## 🎨 Variants

### Gradient (Default)
- LinearGradient background (babyBlue → softPink)
- White text and icons
- Perfect for main screens

### White
- White background with bottom border
- Dark text and icons
- Perfect for chat and detail screens

## 📐 Standard Styles

```typescript
Spacing:
  - paddingTop: 60px (safe area)
  - paddingBottom: 24px
  - paddingHorizontal: 24px

Typography:
  - title: headlineSmall, bold, centered
  - subtitle: bodySmall, centered

Icons:
  - size: 24px
  - tap target: 48x48px

Colors:
  - gradient: #CDE9F9 → #F9DDEB
  - white: #FFFFFF + 1px border #E0E0E0
```

## ✅ Examples from Codebase

### Statistics Screen
```tsx
<AppHeader
  title={t('statistics.title')} // "Pantau Pertumbuhan"
  showBackButton
  menuItems={[
    { title: 'Pilih Anak', icon: 'account-switch', onPress: () => ... },
    { title: 'Ubah Periode', icon: 'calendar-range', onPress: () => ... },
    { title: 'Refresh Data', icon: 'refresh', onPress: () => ... },
    { title: 'Export Data', icon: 'download', onPress: () => ..., divider: true },
  ]}
/>
```

### Settings Screen
```tsx
<AppHeader 
  title="Pengaturan" 
  showBackButton
  onBack={() => {
    console.log('Custom back logic');
    router.back();
  }}
/>
```

### Chat Session
```tsx
<AppHeader
  title="Baby Buddy"
  subtitle="AI Chat"
  variant="white"
  showBackButton
  customRight={
    <View style={styles.avatarCircle}>
      <Image source={mascotImage} />
    </View>
  }
  menuItems={[
    { title: 'Chat Baru', icon: 'message-plus', onPress: handleNewChat },
    { title: 'Export Chat', icon: 'share-variant', onPress: handleExport },
  ]}
/>
```

### Child List (Dynamic Title)
```tsx
<AppHeader 
  title={selectMode ? '📸 Pilih Anak untuk Upload' : 'Profil Anak'}
  showBackButton
/>
```

### Activity History (Custom Right)
```tsx
<AppHeader
  title="Parenting Journal"
  showBackButton
  customRight={
    <IconButton 
      icon="magnify" 
      onPress={() => setSearchVisible(true)} 
      size={24}
      iconColor={theme.colors.white}
    />
  }
  menuItems={[...]}
/>
```

## 🎯 Best Practices

### DO ✅
- Use AppHeader for all screen headers
- Keep titles short and clear
- Use emoji for visual interest
- Group related menu items
- Use dividers to separate sections

### DON'T ❌
- Don't create custom header components
- Don't hardcode header styles
- Don't use different back button styles
- Don't mix CustomButton with IconButton
- Don't forget showBackButton prop

## 🔧 Troubleshooting

### Issue: Header not showing
**Solution**: Make sure you imported AppHeader correctly
```tsx
import { AppHeader } from '../../components/ui';
```

### Issue: Menu items not working
**Solution**: Check menuItems array structure
```tsx
menuItems={[
  { 
    title: 'Action',  // ✅ Required
    icon: 'icon-name', // ✅ Required
    onPress: () => {}, // ✅ Required
    divider: true,     // ⚠️ Optional
  }
]}
```

### Issue: Custom right component not aligned
**Solution**: Wrap in container with proper styles
```tsx
customRight={
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {/* Your components */}
  </View>
}
```

## 📝 Type Definitions

```typescript
interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  variant?: 'gradient' | 'white';
  rightIcon?: string;
  onRightPress?: () => void;
  menuItems?: MenuItem[];
  customRight?: React.ReactNode;
}

interface MenuItem {
  title: string;
  icon: string;
  onPress: () => void;
  divider?: boolean;
}
```

## 🎓 Remember

1. **Always use AppHeader** for consistency
2. **Title is required**, everything else is optional
3. **showBackButton** defaults to `true`
4. **variant** defaults to `'gradient'`
5. **Use menuItems** for kebab menu (3+ actions)
6. **Use rightIcon** for single action
7. **Use customRight** for complex right side

---

**Need help?** Check `/workspaces/parentingAI/src/components/ui/AppHeader.tsx` for full implementation.
