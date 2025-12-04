-- Migration: Add tier column to badges table
-- Description: Adds 'tier' column to badges table to support bronze/silver/gold/platinum tiers
-- Date: 2025-11-28

-- Add tier column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'tier') THEN
        ALTER TABLE badges ADD COLUMN tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'));
        
        -- Update existing badges with appropriate tiers based on their names/descriptions
        -- This is a best-effort mapping
        UPDATE badges SET tier = 'bronze' WHERE tier IS NULL;
        
        -- Example updates (adjust as needed based on actual badge data)
        UPDATE badges SET tier = 'silver' WHERE name ILIKE '%silver%' OR reward_value >= 5;
        UPDATE badges SET tier = 'gold' WHERE name ILIKE '%gold%' OR reward_value >= 10;
        UPDATE badges SET tier = 'platinum' WHERE name ILIKE '%platinum%' OR reward_value >= 20;
    END IF;
END $$;
