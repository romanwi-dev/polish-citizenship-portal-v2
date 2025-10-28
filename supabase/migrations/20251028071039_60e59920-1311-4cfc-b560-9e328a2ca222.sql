-- Add admin_notes field to cases table (visible only to staff)
ALTER TABLE cases ADD COLUMN admin_notes text;

COMMENT ON COLUMN cases.admin_notes IS 'Private notes visible only to admin and assistant staff members';