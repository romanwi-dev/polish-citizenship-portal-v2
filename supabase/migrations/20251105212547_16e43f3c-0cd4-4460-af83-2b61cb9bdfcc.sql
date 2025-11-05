-- Add 'locked_for_print' and 'downloaded' states to pdf_status enum
-- This supports the new lock-pdf workflow state machine

-- Add new enum values
ALTER TYPE pdf_status ADD VALUE IF NOT EXISTS 'locked_for_print';
ALTER TYPE pdf_status ADD VALUE IF NOT EXISTS 'downloaded';

-- Add comment for documentation
COMMENT ON TYPE pdf_status IS 'PDF document lifecycle states: generated → locked_for_print → downloaded → printed → signed → sent → received → archived';