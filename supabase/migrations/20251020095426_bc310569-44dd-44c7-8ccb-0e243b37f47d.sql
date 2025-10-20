-- Assign admin role to backup admin
-- IMPORTANT: Replace 'BACKUP_ADMIN_USER_ID_HERE' with the actual UUID of the backup admin user
-- You can find this UUID in the Backend → Authentication → Users table

-- Example (uncomment and replace UUID when ready):
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('BACKUP_ADMIN_USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- This migration is ready to run once you create the backup admin user
-- and replace the placeholder UUID above with the real user ID