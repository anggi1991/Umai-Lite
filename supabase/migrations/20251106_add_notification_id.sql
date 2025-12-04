-- Add local_notification_id column to reminders table
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS local_notification_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reminders_notification_id 
ON reminders(local_notification_id);

-- Update existing rows with NULL
UPDATE reminders 
SET local_notification_id = NULL 
WHERE local_notification_id IS NULL;