-- Quick fix: notification_logs FK constraint
BEGIN;

ALTER TABLE notification_logs
DROP CONSTRAINT IF EXISTS notification_logs_child_id_fkey;

ALTER TABLE notification_logs
ADD CONSTRAINT notification_logs_child_id_fkey
FOREIGN KEY (child_id)
REFERENCES children(id)
ON DELETE SET NULL;

COMMIT;
