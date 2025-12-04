# Parenting AI Assistant - Design System

## 🎨 Color Palette

```typescript
export const colors = {
  // Primary Colors
  babyBlue: '#AEE1F9',
  softPink: '#FADADD',
  white: '#FFFFFF',
  
  // Gradients
  gradientStart: '#AEE1F9',
  gradientEnd: '#FADADD',
  
  // Semantic Colors
  primary: '#AEE1F9',
  secondary: '#FADADD',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  
  // Text
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
}
```

## 📐 Spacing System

Based on 4px grid system:

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

## 🔤 Typography

**Primary Font**: Poppins (fallback: System)
**Secondary Font**: Nunito

```typescript
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
}
```

## 🎭 Component Styling

### Borders & Corners
```typescript
export const borders = {
  radius: {
    small: 8,
    medium: 16,
    large: 24,
    full: 9999,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
}
```

### Shadows
```typescript
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}
```

## 🎨 UI Components Guidelines

### Buttons
- **Primary Button**: Baby blue background, white text, 24px radius
- **Secondary Button**: Soft pink background, dark text, 24px radius
- **Tertiary Button**: Transparent with border, colored text
- **Minimum Height**: 48px (touch-friendly)
- **Padding**: 16px horizontal, 12px vertical

### Cards
- **Background**: White with soft shadow
- **Border Radius**: 24px
- **Padding**: 16-24px
- **Spacing**: 16px between cards

### Chat Bubbles
- **User Messages**: Soft pink (#FADADD), right-aligned
- **AI Messages**: Baby blue (#AEE1F9), left-aligned
- **Border Radius**: 24px with tail
- **Max Width**: 80% of screen
- **Padding**: 12px horizontal, 8px vertical

### Input Fields
- **Background**: White
- **Border**: 1px light gray, focus: primary color
- **Border Radius**: 24px
- **Height**: 48px minimum
- **Padding**: 16px

### Bottom Navigation
- **Height**: 64px
- **Background**: White with shadow
- **Active Color**: Baby blue
- **Inactive Color**: Gray
- **Icons**: 24x24px

## 🎭 Mascot - Baby Buddy

### Character Design
- Cute baby cartoon with glowing AI halo
- Pastel color scheme matching app
- Expressions: happy, sleeping, waving, thumbs-up
- Used in: onboarding, chat, loading states, empty states

### Animation Guidelines
- Subtle floating animation (2s ease-in-out)
- Blinking every 3-5 seconds
- Wave gesture on interaction
- Smooth transitions between expressions

## 📱 Screen Layouts

### Standard Screen Structure
```
┌─────────────────────────┐
│ Header (64px)           │
│ - Title                 │
│ - Baby Buddy Icon       │
├─────────────────────────┤
│                         │
│ Content Area            │
│ (scrollable)            │
│                         │
│                         │
├─────────────────────────┤
│ Bottom Navigation (64px)│
│ Home│Journal│Chat│Stats │
└─────────────────────────┘
```

### Spacing Rules
- Screen padding: 16px
- Section spacing: 24px
- Element spacing: 8-16px
- Header to content: 16px

## 🎨 Mood & Tone

**Visual Mood**: Warm, empathetic, calm, nurturing
**Color Psychology**:
- Baby Blue: Trust, calm, reliability
- Soft Pink: Care, warmth, comfort
- White: Clean, simple, clarity

**Inspiration**: BabyCenter + Duolingo
- Friendly and approachable
- Gamification elements (streaks, milestones)
- Positive reinforcement
- Educational but fun

## 📐 Responsive Guidelines

**Primary Target**: 390px width (iPhone portrait)
**Min Width**: 360px
**Max Width**: 428px

**Breakpoint Handling**:
- Small phones (< 375px): Reduce padding to 12px
- Large phones (> 414px): Increase padding to 20px
- Content max-width: 600px (for tablets in portrait)

## ♿ Accessibility

- **Touch Targets**: Minimum 44x44px
- **Color Contrast**: WCAG AA compliant
- **Font Sizes**: Minimum 14px for body text
- **Focus States**: Clear visual indicators
- **Screen Reader**: Proper labels for all interactive elements

## 🎬 Animation Guidelines

**Duration**:
- Micro-interactions: 200ms
- Page transitions: 300ms
- Loading states: 400ms

**Easing**:
- Default: ease-in-out
- Enter: ease-out
- Exit: ease-in

**Types**:
- Fade transitions between screens
- Slide up for modals
- Scale for buttons (0.95 on press)
- Floating animation for mascot

## 📝 Content Guidelines

**Tone of Voice**:
- Warm and empathetic
- Non-judgmental
- Supportive and encouraging
- Clear and concise
- Avoid medical jargon

**Copy Rules**:
- Use "you" and "your baby"
- Positive framing
- Action-oriented buttons
- Short sentences
- Emoji usage: occasional, contextual

## 🎯 Implementation Priority

### Phase 1 (Current - MVP)
- ✅ Core functionality
- ✅ Basic styling with React Native Paper
- ✅ Supabase integration

### Phase 2 (Enhancement)
- 🎨 Apply full design system
- 🎭 Add Baby Buddy mascot
- 🎬 Add animations
- 📱 Refine layouts

### Phase 3 (Polish)
- ✨ Advanced animations
- 🎨 Gradient backgrounds
- 🎭 Multiple mascot expressions
- 📊 Enhanced visualizations
