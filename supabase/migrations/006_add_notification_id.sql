-- Migration: Add notification_id to reminders
-- 6 November 2025

-- Add local_notification_id column
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS local_notification_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reminders_notification_id 
ON reminders(local_notification_id);

-- Add notification title & message columns
ALTER TABLE reminders
ADD COLUMN IF NOT EXISTS notification_title text,
ADD COLUMN IF NOT EXISTS notification_message text;

-- Set default notification status
UPDATE reminders
SET local_notification_id = NULL,
    notification_title = CASE 
      WHEN type = 'immunization' THEN 'Jadwal Imunisasi'
      WHEN type = 'feeding' THEN 'Jadwal Makan'
      WHEN type = 'sleep' THEN 'Jadwal Tidur'
      ELSE 'Pengingat'
    END,
    notification_message = CASE
      WHEN type = 'immunization' THEN 'Waktunya imunisasi untuk anak Anda'
      WHEN type = 'feeding' THEN 'Waktunya memberi makan'
      WHEN type = 'sleep' THEN 'Waktunya tidur'
      ELSE 'Ada pengingat untuk anak Anda'
    END
WHERE local_notification_id IS NULL;