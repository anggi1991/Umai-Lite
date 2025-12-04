# 📈 Growth Tracker Implementation

**Last Updated:** November 12, 2025  
**Status:** ✅ Complete & Merged with Statistics  
**Priority:** HIGH (Core Feature)  
**Location:** `app/growth-tracker.tsx`, `/statistics`, `src/services/growthService.ts`  
**Implementation:** 704+ lines UI + 279 lines service

**Related Documentation:**
- Feature Spec: `/docs/04-features/` (❌ needs documentation)
- Testing: `/docs/06-testing/manual-testing.md` (Growth Tracker section)
- Service API: `/docs/07-reference/api-reference.md`
- Troubleshooting: `/docs/08-maintenance/troubleshooting.md`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Service API](#service-api)
6. [UI Components](#ui-components)
7. [Integration](#integration)
8. [Usage Guide](#usage-guide)

---

## 📊 Overview

Growth Tracker is a comprehensive baby growth monitoring feature that allows parents to:
- **Log growth metrics:** Weight (kg), Height (cm), Sleep hours
- **View growth charts:** 6-month trend visualization with Line Charts
- **Track changes:** Monthly growth comparison with percentage change
- **Manage records:** Add, view, and delete growth entries
- **Multi-child support:** Track growth for multiple children

### Key Benefits

- 📈 **Visual Trends:** Line charts showing 6-month growth patterns
- 📊 **Change Tracking:** Compare last 30 days vs previous 30 days
- 🎯 **Latest Stats:** Quick view of current weight, height, sleep
- 📱 **Easy Logging:** Simple modal for adding new measurements
- 🗑️ **Data Management:** Delete records with confirmation
- 👶 **Child Switching:** Seamless navigation between children

---

## ✨ Features

### 1. Growth Metrics Tracking

**Supported Metrics:**
- **Weight (kg):** Track baby's weight with decimal precision (e.g., 8.5 kg)
- **Height (cm):** Monitor length/height growth (e.g., 75 cm)
- **Sleep Hours:** Log daily sleep duration (e.g., 12.5 hours)

### 2. Growth Charts

**Chart Features:**
- 6-month historical data visualization
- Line chart with smooth curves
- Data points with labels (e.g., "Nov 12", "Aug 24")
- Auto-scaling Y-axis based on min/max values
- Empty state when no data available

**Implementation:** `react-native-chart-kit` LineChart

### 3. Current Stats Display

**Stats Shown:**
- **Current Value:** Latest measurement (e.g., "8.5 kg")
- **Change Indicator:** Up/down arrow with percentage
  - Green ↑ for increase
  - Red ↓ for decrease
  - Gray — for no change
- **Change Percentage:** e.g., "+5.2%" or "-2.1%"
- **Measured Date:** "Measured: 2 days ago"

### 4. Recent Records List

**Features:**
- Last 10 records displayed
- Each record shows:
  - Date (e.g., "Nov 12, 2025")
  - Value (e.g., "8.5 kg")
  - Notes (if any)
  - Delete button (swipe or tap)
- Sorted by most recent first
- Empty state: "Belum ada data pertumbuhan"

### 5. Add Growth Record Modal

**Modal Features:**
- Input field with numeric keyboard
- Unit display (kg/cm/hours)
- Optional notes field
- Date/time picker (defaults to now)
- Validation (required value)
- Loading state during save
- Success/error alerts

---

## 🏗️ Architecture

### File Structure

```
src/
├── services/
│   └── growthService.ts              # Growth data service (279 lines)
├── screens/
│   ├── GrowthTracker/
│   │   └── GrowthTrackerScreen.tsx   # Main growth tracker UI (704 lines)
│   └── Statistics/
│       └── StatisticsScreen.tsx      # Unified statistics screen
├── components/
│   └── ui/
│       └── CustomInputModal.tsx      # Modal for adding records
└── types/
    └── database.ts                   # GrowthRecord interface
```

### Data Flow

```
User Action
    ↓
GrowthTrackerScreen (UI)
    ↓
growthService (Business Logic)
    ↓
Supabase RPC Functions
    ↓
growth_records table
    ↓
Real-time updates via useFocusEffect
```

### Integration Points

1. **Child Selection:**
   - Pre-select child via route params: `/growth-tracker?childId=xxx`
   - Or select from dropdown

2. **Statistics Merge:**
   - `/statistics` screen uses same `growthService`
   - Shared `ChartDataPoint` interface
   - Unified data source: `growth_records` table

3. **Navigation:**
   - From Dashboard: "Lihat Pertumbuhan" button
   - From Child List: "Lihat Pertumbuhan Lengkap" button
   - From Statistics: Tab navigation

---

## 🗄️ Database Schema

### Table: `growth_records`

```sql
CREATE TABLE growth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('weight', 'height', 'sleep')),
  weight_kg NUMERIC(5,2),          -- e.g., 8.50 kg
  height_cm NUMERIC(5,2),          -- e.g., 75.00 cm
  sleep_hours NUMERIC(4,2),        -- e.g., 12.50 hours
  note TEXT,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_growth_records_child_id ON growth_records(child_id);
CREATE INDEX idx_growth_records_measured_at ON growth_records(measured_at);
CREATE INDEX idx_growth_records_type ON growth_records(record_type);

-- RLS Policies
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own growth records" ON growth_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own growth records" ON growth_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own growth records" ON growth_records
  FOR DELETE USING (auth.uid() = user_id);
```

### Database Functions

#### 1. `get_latest_growth_record`

```sql
CREATE OR REPLACE FUNCTION get_latest_growth_record(
  p_child_id UUID,
  p_record_type TEXT
) RETURNS TABLE (
  id UUID,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  sleep_hours NUMERIC,
  note TEXT,
  measured_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gr.id,
    gr.weight_kg,
    gr.height_cm,
    gr.sleep_hours,
    gr.note,
    gr.measured_at
  FROM growth_records gr
  WHERE gr.child_id = p_child_id
    AND gr.record_type = p_record_type
  ORDER BY gr.measured_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

#### 2. `get_monthly_growth_trend`

```sql
CREATE OR REPLACE FUNCTION get_monthly_growth_trend(
  p_child_id UUID,
  p_record_type TEXT
) RETURNS TABLE (
  current_value NUMERIC,
  previous_value NUMERIC,
  change_value NUMERIC,
  change_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT AVG(
      CASE p_record_type
        WHEN 'weight' THEN weight_kg
        WHEN 'height' THEN height_cm
        WHEN 'sleep' THEN sleep_hours
      END
    ) as avg_value
    FROM growth_records
    WHERE child_id = p_child_id
      AND record_type = p_record_type
      AND measured_at >= NOW() - INTERVAL '30 days'
  ),
  previous_period AS (
    SELECT AVG(
      CASE p_record_type
        WHEN 'weight' THEN weight_kg
        WHEN 'height' THEN height_cm
        WHEN 'sleep' THEN sleep_hours
      END
    ) as avg_value
    FROM growth_records
    WHERE child_id = p_child_id
      AND record_type = p_record_type
      AND measured_at >= NOW() - INTERVAL '60 days'
      AND measured_at < NOW() - INTERVAL '30 days'
  )
  SELECT
    current_period.avg_value,
    previous_period.avg_value,
    (current_period.avg_value - previous_period.avg_value),
    CASE
      WHEN previous_period.avg_value > 0 THEN
        ((current_period.avg_value - previous_period.avg_value) / previous_period.avg_value * 100)
      ELSE 0
    END
  FROM current_period, previous_period;
END;
$$ LANGUAGE plpgsql;
```

#### 3. `get_growth_chart_data`

```sql
CREATE OR REPLACE FUNCTION get_growth_chart_data(
  p_child_id UUID,
  p_record_type TEXT,
  p_months INT DEFAULT 6
) RETURNS TABLE (
  measured_date DATE,
  value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(gr.measured_at) as measured_date,
    AVG(
      CASE p_record_type
        WHEN 'weight' THEN gr.weight_kg
        WHEN 'height' THEN gr.height_cm
        WHEN 'sleep' THEN gr.sleep_hours
      END
    ) as value
  FROM growth_records gr
  WHERE gr.child_id = p_child_id
    AND gr.record_type = p_record_type
    AND gr.measured_at >= NOW() - (p_months || ' months')::INTERVAL
  GROUP BY DATE(gr.measured_at)
  ORDER BY measured_date ASC;
END;
$$ LANGUAGE plpgsql;
```

---

## 📚 Service API (`growthService.ts`)

### Interfaces

```typescript
export interface GrowthRecord {
  id: string;
  user_id: string;
  child_id: string;
  record_type: 'weight' | 'height' | 'sleep';
  weight_kg?: number;
  height_cm?: number;
  sleep_hours?: number;
  note?: string;
  measured_at: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthTrend {
  current_value: number;
  previous_value: number;
  change_value: number;
  change_percentage: number;
}

export interface ChartDataPoint {
  measured_date: string; // Original field from RPC
  date: string;          // Alias for consistency
  value: number;
  label?: string;        // Display label (e.g., "Nov 12")
}
```

### Core Functions

#### 1. Add Growth Record

```typescript
async function addGrowthRecord(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep',
  value: number,
  note?: string,
  measuredAt?: Date
): Promise<GrowthRecord>
```

**Usage:**
```typescript
const record = await addGrowthRecord(
  'child-uuid',
  'weight',
  8.5,
  'After checkup',
  new Date()
);
```

#### 2. Get Growth Records

```typescript
async function getGrowthRecords(
  childId: string,
  recordType?: 'weight' | 'height' | 'sleep'
): Promise<GrowthRecord[]>
```

**Usage:**
```typescript
// Get all records
const allRecords = await getGrowthRecords('child-uuid');

// Get only weight records
const weightRecords = await getGrowthRecords('child-uuid', 'weight');
```

#### 3. Get Latest Growth Record

```typescript
async function getLatestGrowthRecord(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep'
): Promise<GrowthRecord | null>
```

#### 4. Get Monthly Growth Trend

```typescript
async function getMonthlyGrowthTrend(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep'
): Promise<GrowthTrend | null>
```

**Returns:**
```typescript
{
  current_value: 8.5,      // Last 30 days average
  previous_value: 8.0,     // Previous 30 days average
  change_value: 0.5,       // Absolute change
  change_percentage: 6.25  // Percentage change
}
```

#### 5. Get Chart Data

```typescript
async function getGrowthChartData(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep',
  months: number = 6
): Promise<ChartDataPoint[]>
```

**Returns:**
```typescript
[
  { measured_date: '2025-05-12', date: '2025-05-12', value: 7.5, label: 'May 12' },
  { measured_date: '2025-06-15', date: '2025-06-15', value: 8.0, label: 'Jun 15' },
  { measured_date: '2025-11-12', date: '2025-11-12', value: 8.5, label: 'Nov 12' }
]
```

#### 6. Delete Growth Record

```typescript
async function deleteGrowthRecord(recordId: string): Promise<void>
```

#### 7. Get Current Growth Stats

```typescript
async function getCurrentGrowthStats(
  childId: string
): Promise<{
  weight: { current: number | null; change: number; measuredAt: string | null };
  height: { current: number | null; change: number; measuredAt: string | null };
}>
```

---

## 🎨 UI Components

### Main Screen: `GrowthTrackerScreen.tsx` (704 lines)

**Key Features:**
- Segmented button tabs (Weight / Height / Sleep)
- Child selection dropdown
- Current stats card with trend indicators
- Line chart visualization
- Recent records list with delete
- FAB (Floating Action Button) for adding new record
- Loading states and empty states
- Error handling with alerts

**State Management:**
```typescript
const [children, setChildren] = useState<Child[]>([]);
const [selectedChild, setSelectedChild] = useState<Child | null>(null);
const [selectedTab, setSelectedTab] = useState<TabValue>('weight');
const [growthStats, setGrowthStats] = useState<GrowthStats | null>(null);
const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
const [recentRecords, setRecentRecords] = useState<GrowthRecord[]>([]);
const [loading, setLoading] = useState(true);
const [loadingData, setLoadingData] = useState(false);
const [addRecordModal, setAddRecordModal] = useState(false);
```

**Data Loading:**
```typescript
// Refresh on screen focus
useFocusEffect(
  useCallback(() => {
    if (selectedChild) {
      loadGrowthData();
    }
  }, [selectedChild, selectedTab])
);
```

### Add Record Modal

**Component:** `CustomInputModal`

**Props:**
```typescript
<CustomInputModal
  visible={addRecordModal}
  title={`Tambah Data ${getTabLabel(selectedTab)}`}
  placeholder={`Masukkan nilai ${unit}`}
  keyboardType="decimal-pad"
  onSubmit={handleAddRecord}
  onDismiss={() => setAddRecordModal(false)}
/>
```

---

## 🔗 Integration

### 1. Navigation Flow

**From Dashboard:**
```typescript
<TouchableOpacity onPress={() => router.push('/growth-tracker')}>
  <Text>Lihat Pertumbuhan</Text>
</TouchableOpacity>
```

**With Child Pre-Selection:**
```typescript
router.push(`/growth-tracker?childId=${childId}`);
```

### 2. Merged with Statistics

**Phase 3.7 (Nov 12, 2025):** Growth Tracker was merged into Statistics screen.

**Changes:**
- ChildList.tsx: Button routes changed from `/growth-tracker` → `/statistics`
- `/growth-tracker` route still exists for backward compatibility
- Both screens use shared `growthService`

---

## 📖 Usage Guide

### For Parents

**Adding Growth Record:**
1. Open Growth Tracker screen
2. Select child (if multiple children)
3. Choose tab: Weight / Height / Sleep
4. Tap FAB (+) button
5. Enter value (e.g., 8.5 for kg)
6. Add optional note
7. Tap "Simpan"

**Viewing Charts:**
1. Switch tabs to see different metrics
2. Chart shows 6-month trend
3. Swipe horizontally to view data points

**Deleting Records:**
1. Scroll to "Riwayat Pengukuran"
2. Tap delete icon (🗑️) on record
3. Confirm deletion

### For Developers

**Example: Load Weight Chart**

```typescript
import { getGrowthChartData } from '../services/growthService';

const loadWeightChart = async (childId: string) => {
  const data = await getGrowthChartData(childId, 'weight', 6);
  
  // Format for LineChart
  const chartConfig = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value)
    }]
  };
  
  return chartConfig;
};
```

**Example: Display Current Stats**

```typescript
import { getCurrentGrowthStats } from '../services/growthService';

const stats = await getCurrentGrowthStats(childId);

console.log('Current weight:', stats.weight.current, 'kg');
console.log('Change:', stats.weight.change, '%');
console.log('Measured:', stats.weight.measuredAt);
```

---

## ✅ Implementation Checklist

### Database (100% Complete)
- [x] `growth_records` table created
- [x] Indexes for performance
- [x] RLS policies configured
- [x] `get_latest_growth_record` function
- [x] `get_monthly_growth_trend` function
- [x] `get_growth_chart_data` function

### Service Layer (100% Complete)
- [x] `growthService.ts` (279 lines)
- [x] Add/get/delete records
- [x] Get latest record
- [x] Get monthly trend
- [x] Get chart data
- [x] TypeScript interfaces

### UI Components (100% Complete)
- [x] `GrowthTrackerScreen.tsx` (704 lines)
- [x] Segmented tabs (Weight/Height/Sleep)
- [x] Current stats card
- [x] Line chart visualization
- [x] Recent records list
- [x] Add record modal
- [x] Delete functionality
- [x] Loading states
- [x] Empty states

### Integration (100% Complete)
- [x] Route `/growth-tracker` created
- [x] Child pre-selection from params
- [x] Merged with Statistics screen
- [x] Shared `growthService` usage
- [x] Navigation from Dashboard and ChildList
- [x] i18n translations

---

## 📈 Future Enhancements

### Potential Features
- [ ] Percentile curves (WHO growth standards)
- [ ] Head circumference tracking
- [ ] BMI calculation
- [ ] Growth predictions
- [ ] Export to PDF
- [ ] Milestone reminders
- [ ] Comparison with siblings
- [ ] Doctor appointment integration

---

## 📊 Statistics

- **Total Code:** 983 lines (704 UI + 279 service)
- **Database Functions:** 3 RPC functions
- **Supported Metrics:** 3 (weight, height, sleep)
- **Chart Range:** 6 months (configurable)
- **Real-time Updates:** ✅ via `useFocusEffect`
- **Multi-child Support:** ✅
- **Production Status:** ✅ Deployed

---

**Status:** ✅ Production-Ready | 🎯 Merged with Statistics | 📈 Fully Functional

**Last Updated:** November 12, 2025  
**Maintained by:** Development Team

