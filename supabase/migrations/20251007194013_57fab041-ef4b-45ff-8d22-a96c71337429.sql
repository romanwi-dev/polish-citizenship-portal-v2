-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view intake data" ON public.intake_data;
DROP POLICY IF EXISTS "Admins and assistants can manage intake data" ON public.intake_data;

-- Recreate the RLS policies
CREATE POLICY "Authenticated users can view intake data"
ON public.intake_data
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage intake data"
ON public.intake_data
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));