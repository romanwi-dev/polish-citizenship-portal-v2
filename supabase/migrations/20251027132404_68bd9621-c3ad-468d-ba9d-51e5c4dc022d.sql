-- Migration: Add SLOW strategy and enforce valid values
ALTER TABLE wsc_letters
ADD CONSTRAINT wsc_letters_strategy_check
CHECK (strategy IN ('PUSH', 'NUDGE', 'SITDOWN', 'SLOW') OR strategy IS NULL);

-- Add helpful comment
COMMENT ON COLUMN wsc_letters.strategy IS 'WSC response strategy: PUSH (aggressive), NUDGE (regular), SITDOWN (formal meeting), SLOW (standard pace - no paid scheme), or NULL (not set)';