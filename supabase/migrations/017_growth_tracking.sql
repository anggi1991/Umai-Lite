-- Growth Tracking System
-- This migration adds support for tracking weight, height, and sleep records

CREATE TABLE IF NOT EXISTS growth_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  record_type text NOT NULL CHECK (record_type IN ('weight', 'height', 'sleep')),
  
  -- Weight tracking (in kilograms)
  weight_kg numeric(5, 2),
  
  -- Height tracking (in centimeters)
  height_cm numeric(5, 2),
  
  -- Sleep tracking (in hours)
  sleep_hours numeric(4, 2),
  
  -- Optional note
  note text,
  
  -- When this measurement was taken
  measured_at timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_growth_records_user_child ON growth_records(user_id, child_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_type ON growth_records(record_type);
CREATE INDEX IF NOT EXISTS idx_growth_records_measured_at ON growth_records(measured_at DESC);

-- Enable RLS
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop if exists first to avoid conflicts)
DROP POLICY IF EXISTS "users_can_manage_own_growth_records" ON growth_records;

CREATE POLICY "users_can_manage_own_growth_records"
  ON growth_records
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to get latest record by type
CREATE OR REPLACE FUNCTION get_latest_growth_record(
  p_child_id uuid,
  p_record_type text
)
RETURNS TABLE (
  id uuid,
  weight_kg numeric,
  height_cm numeric,
  sleep_hours numeric,
  measured_at timestamptz,
  note text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.id,
    gr.weight_kg,
    gr.height_cm,
    gr.sleep_hours,
    gr.measured_at,
    gr.note
  FROM growth_records gr
  WHERE gr.child_id = p_child_id 
    AND gr.record_type = p_record_type
    AND gr.user_id = auth.uid()
  ORDER BY gr.measured_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly trend (last 30 days average vs previous 30 days)
CREATE OR REPLACE FUNCTION get_monthly_growth_trend(
  p_child_id uuid,
  p_record_type text
)
RETURNS TABLE (
  current_value numeric,
  previous_value numeric,
  change_value numeric,
  change_percentage numeric
) AS $$
DECLARE
  v_current numeric;
  v_previous numeric;
  v_change numeric;
  v_change_pct numeric;
BEGIN
  -- Get average for last 30 days
  SELECT AVG(
    CASE 
      WHEN p_record_type = 'weight' THEN weight_kg
      WHEN p_record_type = 'height' THEN height_cm
      WHEN p_record_type = 'sleep' THEN sleep_hours
    END
  ) INTO v_current
  FROM growth_records
  WHERE child_id = p_child_id
    AND record_type = p_record_type
    AND user_id = auth.uid()
    AND measured_at >= now() - interval '30 days';
  
  -- Get average for 30-60 days ago
  SELECT AVG(
    CASE 
      WHEN p_record_type = 'weight' THEN weight_kg
      WHEN p_record_type = 'height' THEN height_cm
      WHEN p_record_type = 'sleep' THEN sleep_hours
    END
  ) INTO v_previous
  FROM growth_records
  WHERE child_id = p_child_id
    AND record_type = p_record_type
    AND user_id = auth.uid()
    AND measured_at >= now() - interval '60 days'
    AND measured_at < now() - interval '30 days';
  
  -- Calculate change
  IF v_current IS NOT NULL AND v_previous IS NOT NULL THEN
    v_change := v_current - v_previous;
    IF v_previous > 0 THEN
      v_change_pct := (v_change / v_previous) * 100;
    END IF;
  END IF;
  
  RETURN QUERY SELECT v_current, v_previous, v_change, v_change_pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get growth records for charting (last 6 months)
CREATE OR REPLACE FUNCTION get_growth_chart_data(
  p_child_id uuid,
  p_record_type text,
  p_months int DEFAULT 6
)
RETURNS TABLE (
  measured_date date,
  value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.measured_at::date as measured_date,
    CASE 
      WHEN p_record_type = 'weight' THEN gr.weight_kg
      WHEN p_record_type = 'height' THEN gr.height_cm
      WHEN p_record_type = 'sleep' THEN gr.sleep_hours
    END as value
  FROM growth_records gr
  WHERE gr.child_id = p_child_id 
    AND gr.record_type = p_record_type
    AND gr.user_id = auth.uid()
    AND gr.measured_at >= now() - (p_months || ' months')::interval
  ORDER BY gr.measured_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_growth_record_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists first to avoid conflicts
DROP TRIGGER IF EXISTS growth_records_updated_at ON growth_records;

CREATE TRIGGER growth_records_updated_at
  BEFORE UPDATE ON growth_records
  FOR EACH ROW
  EXECUTE FUNCTION update_growth_record_updated_at();
