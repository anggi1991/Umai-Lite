-- Migration 004: add local_notification_id column to reminders for storing scheduled notification identifier
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS local_notification_id text;