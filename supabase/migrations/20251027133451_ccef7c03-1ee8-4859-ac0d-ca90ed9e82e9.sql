-- Add push_scheme field to cases table
ALTER TABLE cases
ADD COLUMN push_scheme TEXT CHECK (push_scheme IN ('PUSH', 'NUDGE', 'SITDOWN', 'SLOW') OR push_scheme IS NULL);

-- Add helpful comment
COMMENT ON COLUMN cases.push_scheme IS 'Case-level push scheme: PUSH (aggressive), NUDGE (regular), SITDOWN (formal meeting), SLOW (standard pace), or NULL (not set)';