-- Fix master_table RLS policies for proper data persistence

-- Drop the ambiguous "ALL" policy and create explicit policies
DROP POLICY IF EXISTS "Admins have full access to master table" ON master_table;

-- Create explicit admin policies for each operation
CREATE POLICY "Admins can select master table"
  ON master_table FOR SELECT
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert master table"
  ON master_table FOR INSERT
  TO public
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update master table"
  ON master_table FOR UPDATE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete master table"
  ON master_table FOR DELETE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));