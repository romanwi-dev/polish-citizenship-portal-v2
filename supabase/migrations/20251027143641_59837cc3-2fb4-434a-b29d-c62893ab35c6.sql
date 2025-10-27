-- Update push_scheme constraint to include ALL SCHEMES
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_push_scheme_check;

ALTER TABLE cases ADD CONSTRAINT cases_push_scheme_check 
CHECK (push_scheme IN ('PUSH', 'NUDGE', 'SITDOWN', 'SLOW', 'ALL SCHEMES') OR push_scheme IS NULL);