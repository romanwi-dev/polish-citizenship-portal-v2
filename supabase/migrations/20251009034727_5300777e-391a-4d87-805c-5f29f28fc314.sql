-- Add minor_children_count column to master_table
ALTER TABLE public.master_table 
ADD COLUMN IF NOT EXISTS minor_children_count integer DEFAULT 0;