-- Add payment_status column to cases table
ALTER TABLE public.cases 
ADD COLUMN payment_status TEXT DEFAULT 'pay' CHECK (payment_status IN ('pay', 'clear'));