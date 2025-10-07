-- Create comprehensive master_table for complete family and document tracking

CREATE TABLE IF NOT EXISTS public.master_table (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- ============================================
  -- APPLICANT FIELDS
  -- ============================================
  applicant_first_name text,
  applicant_last_name text,
  applicant_maiden_name text,
  applicant_sex text,
  applicant_dob date,
  applicant_pob text,
  applicant_current_citizenship text[],
  applicant_date_of_emigration date,
  applicant_date_of_naturalization date,
  applicant_is_alive boolean DEFAULT true,
  applicant_passport_number text,
  applicant_passport_issuing_country text,
  applicant_passport_issuing_authority text,
  applicant_passport_issue_date date,
  applicant_passport_expiry_date date,
  applicant_email text,
  applicant_phone text,
  applicant_address jsonb DEFAULT '{}'::jsonb,
  applicant_previous_names jsonb DEFAULT '[]'::jsonb,
  applicant_other_citizenships jsonb DEFAULT '[]'::jsonb,
  applicant_notes text,
  applicant_has_birth_cert boolean DEFAULT false,
  applicant_has_marriage_cert boolean DEFAULT false,
  applicant_has_passport boolean DEFAULT false,
  applicant_has_naturalization boolean DEFAULT false,
  
  -- ============================================
  -- SPOUSE FIELDS
  -- ============================================
  spouse_first_name text,
  spouse_last_name text,
  spouse_maiden_name text,
  spouse_sex text,
  spouse_dob date,
  spouse_pob text,
  spouse_current_citizenship text[],
  spouse_date_of_emigration date,
  spouse_date_of_naturalization date,
  spouse_is_alive boolean DEFAULT true,
  spouse_email text,
  spouse_phone text,
  spouse_notes text,
  spouse_has_birth_cert boolean DEFAULT false,
  spouse_has_marriage_cert boolean DEFAULT false,
  spouse_has_passport boolean DEFAULT false,
  date_of_marriage date,
  place_of_marriage text,
  
  -- ============================================
  -- CHILDREN FIELDS (up to 10 children)
  -- ============================================
  children_count integer DEFAULT 0,
  child_1_first_name text,
  child_1_last_name text,
  child_1_sex text,
  child_1_dob date,
  child_1_pob text,
  child_1_is_alive boolean DEFAULT true,
  child_1_notes text,
  
  child_2_first_name text,
  child_2_last_name text,
  child_2_sex text,
  child_2_dob date,
  child_2_pob text,
  child_2_is_alive boolean DEFAULT true,
  child_2_notes text,
  
  child_3_first_name text,
  child_3_last_name text,
  child_3_sex text,
  child_3_dob date,
  child_3_pob text,
  child_3_is_alive boolean DEFAULT true,
  child_3_notes text,
  
  child_4_first_name text,
  child_4_last_name text,
  child_4_sex text,
  child_4_dob date,
  child_4_pob text,
  child_4_is_alive boolean DEFAULT true,
  child_4_notes text,
  
  child_5_first_name text,
  child_5_last_name text,
  child_5_sex text,
  child_5_dob date,
  child_5_pob text,
  child_5_is_alive boolean DEFAULT true,
  child_5_notes text,
  
  child_6_first_name text,
  child_6_last_name text,
  child_6_sex text,
  child_6_dob date,
  child_6_pob text,
  child_6_is_alive boolean DEFAULT true,
  child_6_notes text,
  
  child_7_first_name text,
  child_7_last_name text,
  child_7_sex text,
  child_7_dob date,
  child_7_pob text,
  child_7_is_alive boolean DEFAULT true,
  child_7_notes text,
  
  child_8_first_name text,
  child_8_last_name text,
  child_8_sex text,
  child_8_dob date,
  child_8_pob text,
  child_8_is_alive boolean DEFAULT true,
  child_8_notes text,
  
  child_9_first_name text,
  child_9_last_name text,
  child_9_sex text,
  child_9_dob date,
  child_9_pob text,
  child_9_is_alive boolean DEFAULT true,
  child_9_notes text,
  
  child_10_first_name text,
  child_10_last_name text,
  child_10_sex text,
  child_10_dob date,
  child_10_pob text,
  child_10_is_alive boolean DEFAULT true,
  child_10_notes text,
  
  -- ============================================
  -- FATHER FIELDS
  -- ============================================
  father_first_name text,
  father_last_name text,
  father_maiden_name text,
  father_dob date,
  father_pob text,
  father_date_of_emigration date,
  father_date_of_naturalization date,
  father_is_alive boolean DEFAULT true,
  father_notes text,
  father_has_birth_cert boolean DEFAULT false,
  father_has_marriage_cert boolean DEFAULT false,
  father_has_naturalization boolean DEFAULT false,
  
  -- ============================================
  -- MOTHER FIELDS
  -- ============================================
  mother_first_name text,
  mother_last_name text,
  mother_maiden_name text,
  mother_dob date,
  mother_pob text,
  mother_date_of_emigration date,
  mother_date_of_naturalization date,
  mother_is_alive boolean DEFAULT true,
  mother_notes text,
  mother_has_birth_cert boolean DEFAULT false,
  mother_has_marriage_cert boolean DEFAULT false,
  mother_has_naturalization boolean DEFAULT false,
  
  -- Parents marriage
  father_mother_marriage_date date,
  father_mother_marriage_place text,
  
  -- ============================================
  -- PATERNAL GRANDFATHER FIELDS
  -- ============================================
  pgf_first_name text,
  pgf_last_name text,
  pgf_dob date,
  pgf_pob text,
  pgf_date_of_emigration date,
  pgf_date_of_naturalization date,
  pgf_is_alive boolean DEFAULT false,
  pgf_notes text,
  pgf_has_birth_cert boolean DEFAULT false,
  pgf_has_marriage_cert boolean DEFAULT false,
  pgf_has_naturalization boolean DEFAULT false,
  
  -- ============================================
  -- PATERNAL GRANDMOTHER FIELDS
  -- ============================================
  pgm_first_name text,
  pgm_last_name text,
  pgm_maiden_name text,
  pgm_dob date,
  pgm_pob text,
  pgm_date_of_emigration date,
  pgm_date_of_naturalization date,
  pgm_is_alive boolean DEFAULT false,
  pgm_notes text,
  pgm_has_birth_cert boolean DEFAULT false,
  pgm_has_marriage_cert boolean DEFAULT false,
  pgm_has_naturalization boolean DEFAULT false,
  
  -- Paternal grandparents marriage
  pgf_pgm_marriage_date date,
  pgf_pgm_marriage_place text,
  
  -- ============================================
  -- MATERNAL GRANDFATHER FIELDS
  -- ============================================
  mgf_first_name text,
  mgf_last_name text,
  mgf_dob date,
  mgf_pob text,
  mgf_date_of_emigration date,
  mgf_date_of_naturalization date,
  mgf_is_alive boolean DEFAULT false,
  mgf_notes text,
  mgf_has_birth_cert boolean DEFAULT false,
  mgf_has_marriage_cert boolean DEFAULT false,
  mgf_has_naturalization boolean DEFAULT false,
  
  -- ============================================
  -- MATERNAL GRANDMOTHER FIELDS
  -- ============================================
  mgm_first_name text,
  mgm_last_name text,
  mgm_maiden_name text,
  mgm_dob date,
  mgm_pob text,
  mgm_date_of_emigration date,
  mgm_date_of_naturalization date,
  mgm_is_alive boolean DEFAULT false,
  mgm_notes text,
  mgm_has_birth_cert boolean DEFAULT false,
  mgm_has_marriage_cert boolean DEFAULT false,
  mgm_has_naturalization boolean DEFAULT false,
  
  -- Maternal grandparents marriage
  mgf_mgm_marriage_date date,
  mgf_mgm_marriage_place text,
  
  -- ============================================
  -- PATERNAL GREAT-GRANDFATHER (Father's Father's Father)
  -- ============================================
  pggf_first_name text,
  pggf_last_name text,
  pggf_dob date,
  pggf_pob text,
  pggf_date_of_emigration date,
  pggf_date_of_naturalization date,
  pggf_is_alive boolean DEFAULT false,
  pggf_notes text,
  pggf_has_birth_cert boolean DEFAULT false,
  pggf_has_marriage_cert boolean DEFAULT false,
  pggf_has_naturalization boolean DEFAULT false,
  
  -- ============================================
  -- PATERNAL GREAT-GRANDMOTHER (Father's Father's Mother)
  -- ============================================
  pggm_first_name text,
  pggm_last_name text,
  pggm_maiden_name text,
  pggm_dob date,
  pggm_pob text,
  pggm_date_of_emigration date,
  pggm_date_of_naturalization date,
  pggm_is_alive boolean DEFAULT false,
  pggm_notes text,
  pggm_has_birth_cert boolean DEFAULT false,
  pggm_has_marriage_cert boolean DEFAULT false,
  pggm_has_naturalization boolean DEFAULT false,
  
  -- Paternal great-grandparents marriage
  pggf_pggm_marriage_date date,
  pggf_pggm_marriage_place text,
  
  -- ============================================
  -- MATERNAL GREAT-GRANDFATHER (Mother's Father's Father)
  -- ============================================
  mggf_first_name text,
  mggf_last_name text,
  mggf_dob date,
  mggf_pob text,
  mggf_date_of_emigration date,
  mggf_date_of_naturalization date,
  mggf_is_alive boolean DEFAULT false,
  mggf_notes text,
  mggf_has_birth_cert boolean DEFAULT false,
  mggf_has_marriage_cert boolean DEFAULT false,
  mggf_has_naturalization boolean DEFAULT false,
  
  -- ============================================
  -- MATERNAL GREAT-GRANDMOTHER (Mother's Father's Mother)
  -- ============================================
  mggm_first_name text,
  mggm_last_name text,
  mggm_maiden_name text,
  mggm_dob date,
  mggm_pob text,
  mggm_date_of_emigration date,
  mggm_date_of_naturalization date,
  mggm_is_alive boolean DEFAULT false,
  mggm_notes text,
  mggm_has_birth_cert boolean DEFAULT false,
  mggm_has_marriage_cert boolean DEFAULT false,
  mggm_has_naturalization boolean DEFAULT false,
  
  -- Maternal great-grandparents marriage
  mggf_mggm_marriage_date date,
  mggf_mggm_marriage_place text,
  
  -- ============================================
  -- METADATA
  -- ============================================
  ancestry_line text,
  language_preference text DEFAULT 'EN',
  family_notes text,
  completion_percentage integer DEFAULT 0,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.master_table ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view master table"
  ON public.master_table
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage master table"
  ON public.master_table
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_master_table_case_id ON public.master_table(case_id);

-- Trigger for updated_at
CREATE TRIGGER update_master_table_updated_at
  BEFORE UPDATE ON public.master_table
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.master_table IS 'Comprehensive family tree and document tracking - supports 4 generations, spouse, up to 10 children';
COMMENT ON COLUMN public.master_table.children_count IS 'Total number of children (max 10 tracked)';
COMMENT ON COLUMN public.master_table.applicant_previous_names IS 'Array of previous legal names [{name: string, from: date, to: date}]';
COMMENT ON COLUMN public.master_table.applicant_other_citizenships IS 'Array of other citizenship countries';
COMMENT ON COLUMN public.master_table.family_notes IS 'General notes about the family situation, special circumstances, etc.';