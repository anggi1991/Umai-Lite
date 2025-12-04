# 📚 Reference Documentation

**Purpose:** Business requirements, product specifications, design systems, and historical project documentation.

---

## 📑 Documentation Index

### **Project Overview**
- **[PROJECT_STATUS_FINAL.md](./PROJECT_STATUS_FINAL.md)** - Current project status and features
  - Completed features
  - Tech stack
  - Database schema
  - File structure

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview and milestones
  - MVP features
  - Development timeline
  - Team structure

### **Requirements & Planning**
- **[BRD_BUSINESS_REQUIREMENTS.md](./BRD_BUSINESS_REQUIREMENTS.md)** - Business Requirements Document
  - Target users
  - Market analysis
  - Success metrics
  - Business goals

- **[PRD_AI_FEATURES.md](./PRD_AI_FEATURES.md)** - Product Requirements Document
  - AI feature specifications
  - User stories
  - Acceptance criteria
  - Technical requirements

- **[depelopment-plan.md](./depelopment-plan.md)** - Development roadmap
  - Phase breakdown
  - Sprint planning
  - Resource allocation

### **Design System**
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Design system guide
  - Color palette
    - Primary: Baby Blue (#CDE9F9)
    - Secondary: Soft Pink (#F9DDEB)
  - Typography (Poppins/Nunito)
  - Component library
  - Spacing system
  - Icon guidelines

- **[USER_FLOW_DOCUMENTATION.md](./USER_FLOW_DOCUMENTATION.md)** - User journey flows
  - Onboarding flow
  - Activity logging flow
  - Chat conversation flow
  - Subscription purchase flow

### **Content Guidelines**
- **[content.md](./content.md)** - Content strategy and guidelines
  - Tone of voice (friendly, empathetic, educational)
  - Microcopy examples
  - Error messages
  - Success messages
  - AI prompt templates

### **Technical References**
- **[TYPESCRIPT_LINTING.md](./TYPESCRIPT_LINTING.md)** - TypeScript configuration
  - ESLint rules
  - Prettier config
  - Type definitions
  - Code style guide

---

## 🎨 Design Tokens

### **Colors**
```typescript
export const colors = {
  // Primary
  babyBlue: '#CDE9F9',
  softPink: '#F9DDEB',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#F5F5F5',
  divider: '#E0E0E0',
  
  // Text
  textPrimary: '#333333',
  textSecondary: '#757575',
  
  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};
```

### **Typography**
```typescript
export const typography = {
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    bold: 'Poppins-Bold',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};
```

### **Spacing**
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 👥 User Personas

### **Persona 1: First-Time Parent**
- **Name:** Sarah, 28
- **Background:** New mother with 3-month-old baby
- **Goals:** 
  - Track baby's feeding and sleep patterns
  - Get reassurance from AI assistant
  - Connect with other parents
- **Pain Points:**
  - Overwhelmed with information
  - Unsure about baby's development
  - Sleep deprived

### **Persona 2: Experienced Parent**
- **Name:** Michael, 35
- **Background:** Father of two (3 years, 6 months)
- **Goals:**
  - Manage schedules for multiple children
  - Get specific advice for different age groups
  - Track growth milestones
- **Pain Points:**
  - Hard to remember details for each child
  - Need quick answers while multitasking
  - Want to compare development

---

## 📊 Success Metrics

### **Product Metrics**
- **DAU/MAU Ratio:** Target 40%+ (sticky engagement)
- **Retention Rate:** 
  - Day 1: 50%
  - Day 7: 30%
  - Day 30: 20%
- **Conversion Rate:** Free → Premium: 5%
- **Churn Rate:** <5% monthly

### **Business Metrics**
- **MRR:** Monthly Recurring Revenue
- **LTV:** Lifetime Value per user
- **CAC:** Customer Acquisition Cost
- **LTV/CAC Ratio:** Target 3:1

### **Engagement Metrics**
- **Activities Logged/User/Week:** Target 10+
- **Chat Messages/User/Day:** Target 3+
- **Tips Generated/User/Week:** Target 5+
- **Photos Uploaded/User/Month:** Target 10+

---

## 🔗 Related Documentation

- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture
- **[../SYSTEM_INTEGRATION_SUMMARY.md](../SYSTEM_INTEGRATION_SUMMARY.md)** - Integration guide
- **[../implementation/](../implementation/)** - Implementation guides
- **[../testing/](../testing/)** - Testing documentation

---

## 🗃️ Archived References

Historical documentation moved to **[../archive/old-references/](../archive/old-references/)**:
- Progress reports
- Bug fix summaries
- Session summaries
- Visual progress reports
- Complete implementation summaries

---

*Last updated: November 11, 2025*
