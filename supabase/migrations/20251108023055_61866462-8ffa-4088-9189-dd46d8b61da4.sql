-- Add missing created_by column to phase_a_analyses
ALTER TABLE public.phase_a_analyses 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add missing columns to phase_b_verifications
ALTER TABLE public.phase_b_verifications
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add missing columns to phase_ex_executions  
ALTER TABLE public.phase_ex_executions
ADD COLUMN IF NOT EXISTS rollback_completed BOOLEAN DEFAULT false;