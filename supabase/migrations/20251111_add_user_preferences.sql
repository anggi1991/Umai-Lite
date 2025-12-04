-- Migration: Add user preferences columns
-- Created: 2025-11-11
-- Purpose: Store mascot expression and AI persona preferences

-- Add columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mascot_expression TEXT DEFAULT 'happy',
ADD COLUMN IF NOT EXISTS ai_persona TEXT DEFAULT 'friendly';

-- Add check constraints
ALTER TABLE profiles 
ADD CONSTRAINT mascot_expression_check 
CHECK (mascot_expression IN ('happy', 'waving', 'thumbs-up', 'sleeping'));

ALTER TABLE profiles 
ADD CONSTRAINT ai_persona_check 
CHECK (ai_persona IN ('friendly', 'professional', 'encouraging', 'concise'));

-- Create index for faster lookups (profiles.id is already the primary key)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Update existing rows to have default values
UPDATE profiles 
SET mascot_expression = 'happy', 
    ai_persona = 'friendly' 
WHERE mascot_expression IS NULL OR ai_persona IS NULL;
