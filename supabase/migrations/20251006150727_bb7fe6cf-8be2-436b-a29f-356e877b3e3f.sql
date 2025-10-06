-- ========================================
-- POLISH CITIZENSHIP PORTAL DATABASE SCHEMA
-- ========================================

-- 1. USER ROLES SYSTEM
-- ========================================

CREATE TYPE public.app_role AS ENUM ('admin', 'assistant', 'client');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. INTAKE DATA (Client Information)
-- ========================================

CREATE TABLE public.intake_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- Personal Info
  first_name TEXT,
  last_name TEXT,
  maiden_name TEXT,
  date_of_birth DATE,
  place_of_birth TEXT,
  sex TEXT,
  current_citizenship TEXT[],
  
  -- Passport Info (OCR from upload)
  passport_number TEXT,
  passport_issue_date DATE,
  passport_expiry_date DATE,
  passport_issuing_country TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  address JSONB,
  
  -- Ancestry Info
  ancestry_line TEXT, -- 'paternal' or 'maternal'
  
  -- Parents
  father_first_name TEXT,
  father_last_name TEXT,
  father_dob DATE,
  father_pob TEXT,
  mother_first_name TEXT,
  mother_last_name TEXT,
  mother_maiden_name TEXT,
  mother_dob DATE,
  mother_pob TEXT,
  
  -- Grandparents
  pgf_first_name TEXT,
  pgf_last_name TEXT,
  pgf_dob DATE,
  pgf_pob TEXT,
  pgm_first_name TEXT,
  pgm_last_name TEXT,
  pgm_maiden_name TEXT,
  pgm_dob DATE,
  pgm_pob TEXT,
  mgf_first_name TEXT,
  mgf_last_name TEXT,
  mgf_dob DATE,
  mgf_pob TEXT,
  mgm_first_name TEXT,
  mgm_last_name TEXT,
  mgm_maiden_name TEXT,
  mgm_dob DATE,
  mgm_pob TEXT,
  
  -- Additional Info
  language_preference TEXT DEFAULT 'EN', -- 'EN' or 'PL'
  autosave_data JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(case_id)
);

ALTER TABLE public.intake_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view intake data"
  ON public.intake_data FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can modify intake"
  ON public.intake_data FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'assistant')
  );

-- 3. POWER OF ATTORNEY (POA)
-- ========================================

CREATE TABLE public.poa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  poa_type TEXT NOT NULL, -- 'adult' or 'minor'
  generated_at TIMESTAMPTZ,
  pdf_url TEXT,
  dropbox_path TEXT,
  
  -- E-signature
  client_signed BOOLEAN DEFAULT FALSE,
  client_signature_date TIMESTAMPTZ,
  client_ip_address TEXT,
  
  -- HAC Approval
  hac_approved BOOLEAN DEFAULT FALSE,
  hac_approved_by UUID REFERENCES auth.users(id),
  hac_approved_at TIMESTAMPTZ,
  hac_notes TEXT,
  
  status TEXT DEFAULT 'draft', -- 'draft', 'sent_for_signature', 'signed', 'approved', 'invalid'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.poa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view POAs"
  ON public.poa FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage POAs"
  ON public.poa FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'assistant')
  );

-- 4. OBY FORM (140-field citizenship application)
-- ========================================

CREATE TABLE public.oby_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- OBY has ~140 fields, storing as JSONB for flexibility
  form_data JSONB DEFAULT '{}',
  
  -- Populated from intake
  auto_populated_fields TEXT[],
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'reviewed', 'filed'
  
  -- HAC Approval
  hac_approved BOOLEAN DEFAULT FALSE,
  hac_approved_by UUID REFERENCES auth.users(id),
  hac_approved_at TIMESTAMPTZ,
  hac_notes TEXT,
  
  filed_date TIMESTAMPTZ,
  filed_to TEXT, -- which authority
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(case_id)
);

ALTER TABLE public.oby_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view OBY forms"
  ON public.oby_forms FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage OBY"
  ON public.oby_forms FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'assistant')
  );

-- 5. WSC LETTERS
-- ========================================

CREATE TABLE public.wsc_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- OCR Data
  letter_date DATE,
  reference_number TEXT,
  deadline DATE,
  
  -- Upload info
  dropbox_path TEXT,
  file_url TEXT,
  ocr_text TEXT,
  
  -- HAC Review
  hac_reviewed BOOLEAN DEFAULT FALSE,
  hac_reviewed_by UUID REFERENCES auth.users(id),
  hac_reviewed_at TIMESTAMPTZ,
  hac_notes TEXT,
  
  -- Strategy
  strategy TEXT, -- 'push', 'nudge', 'sitdown'
  strategy_notes TEXT,
  strategy_set_by UUID REFERENCES auth.users(id),
  strategy_set_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wsc_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view WSC letters"
  ON public.wsc_letters FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage WSC letters"
  ON public.wsc_letters FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'assistant')
  );

-- 6. TASKS (Document requests, translations, USC workflows)
-- ========================================

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  task_type TEXT NOT NULL, -- 'doc_request', 'translation', 'usc_umiejscowienie', 'usc_uzupelnienie', 'archive_request'
  title TEXT NOT NULL,
  description TEXT,
  
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'blocked'
  
  -- Related entity
  related_document_id UUID REFERENCES public.documents(id),
  related_person TEXT, -- 'AP', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM'
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Additional data
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage tasks"
  ON public.tasks FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'assistant')
  );

-- 7. HAC LOGS (Human Approval Checkpoint)
-- ========================================

CREATE TABLE public.hac_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL, -- 'poa_approval', 'oby_approval', 'wsc_review', 'strategy_set', etc.
  action_details TEXT,
  
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Related entities
  related_poa_id UUID REFERENCES public.poa(id),
  related_oby_id UUID REFERENCES public.oby_forms(id),
  related_wsc_id UUID REFERENCES public.wsc_letters(id),
  
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.hac_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view HAC logs"
  ON public.hac_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage HAC logs"
  ON public.hac_logs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. CLIENT PORTAL ACCESS
-- ========================================

CREATE TABLE public.client_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  magic_link_token TEXT UNIQUE,
  magic_link_expires_at TIMESTAMPTZ,
  
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(case_id, user_id)
);

ALTER TABLE public.client_portal_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portal access"
  ON public.client_portal_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage portal access"
  ON public.client_portal_access FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. MESSAGES (Client-HAC communication)
-- ========================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message_text TEXT NOT NULL,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their cases"
  ON public.messages FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and assistants see all
      public.has_role(auth.uid(), 'admin') OR 
      public.has_role(auth.uid(), 'assistant') OR
      -- Clients see their own case messages
      EXISTS (
        SELECT 1 FROM public.client_portal_access 
        WHERE case_id = messages.case_id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 10. UPDATE TRIGGERS
-- ========================================

CREATE TRIGGER update_intake_data_updated_at
  BEFORE UPDATE ON public.intake_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_poa_updated_at
  BEFORE UPDATE ON public.poa
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_oby_forms_updated_at
  BEFORE UPDATE ON public.oby_forms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_wsc_letters_updated_at
  BEFORE UPDATE ON public.wsc_letters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11. EXTEND DOCUMENTS TABLE
-- ========================================

ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS person_type TEXT, -- 'AP', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM'
  ADD COLUMN IF NOT EXISTS needs_translation BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_verified_by_hac BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 12. EXTEND CASES TABLE FOR NEW WORKFLOW
-- ========================================

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'lead', 
  -- 'lead', 'intake', 'poa', 'oby_draft', 'oby_filed', 'wsc_letter', 'authority_review', 'decision', 'consulate'
  ADD COLUMN IF NOT EXISTS kpi_docs_percentage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kpi_tasks_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kpi_tasks_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intake_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS poa_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS oby_filed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS wsc_received BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS decision_received BOOLEAN DEFAULT FALSE;