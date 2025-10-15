-- Archive Search Dashboard Tables (PART 7 - Polish Documents)

-- Archive search requests tracking
CREATE TABLE IF NOT EXISTS public.archive_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('AP', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM')),
  search_type TEXT NOT NULL CHECK (search_type IN ('polish_archives', 'international_archives', 'family_possessions')),
  archive_name TEXT,
  archive_country TEXT,
  document_types TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'letter_sent', 'response_received', 'documents_received', 'not_found', 'completed')),
  letter_generated_at TIMESTAMPTZ,
  letter_sent_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  documents_received_at TIMESTAMPTZ,
  partner_assigned_to TEXT,
  search_notes TEXT,
  findings_summary TEXT,
  estimated_completion DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track individual document requests within searches
CREATE TABLE IF NOT EXISTS public.archive_document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_search_id UUID REFERENCES public.archive_searches(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('birth', 'marriage', 'death', 'military', 'residence')),
  person_first_name TEXT,
  person_last_name TEXT,
  approximate_year TEXT,
  location TEXT,
  status TEXT DEFAULT 'searching' CHECK (status IN ('searching', 'found', 'not_found', 'alternative_found')),
  document_id UUID REFERENCES public.documents(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents Collection Dashboard Tables (PART 6 - Local Documents)

-- Track local document collection requests
CREATE TABLE IF NOT EXISTS public.local_document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('AP', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM', 'spouse', 'child')),
  document_type TEXT NOT NULL CHECK (document_type IN ('birth_cert', 'marriage_cert', 'passport', 'naturalization', 'military')),
  issuing_country TEXT NOT NULL,
  issuing_authority TEXT,
  authority_website TEXT,
  authority_address TEXT,
  authority_phone TEXT,
  authority_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'client_obtaining', 'received', 'verified', 'filed')),
  requested_date DATE,
  received_date DATE,
  apostille_required BOOLEAN DEFAULT false,
  apostille_obtained BOOLEAN DEFAULT false,
  certified_copy BOOLEAN DEFAULT false,
  document_id UUID REFERENCES public.documents(id),
  partner_helping BOOLEAN DEFAULT false,
  partner_name TEXT,
  client_notes TEXT,
  hac_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Database of local authorities worldwide
CREATE TABLE IF NOT EXISTS public.local_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  state_province TEXT,
  city TEXT,
  authority_name TEXT NOT NULL,
  authority_type TEXT CHECK (authority_type IN ('vital_records', 'passport_office', 'uscis', 'military_archives')),
  website_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  processing_time TEXT,
  fees TEXT,
  online_ordering BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.archive_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_authorities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for archive_searches
CREATE POLICY "Authenticated users can view archive searches"
  ON public.archive_searches FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage archive searches"
  ON public.archive_searches FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- RLS Policies for archive_document_requests
CREATE POLICY "Authenticated users can view archive document requests"
  ON public.archive_document_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage archive document requests"
  ON public.archive_document_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- RLS Policies for local_document_requests
CREATE POLICY "Authenticated users can view local document requests"
  ON public.local_document_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can manage local document requests"
  ON public.local_document_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- RLS Policies for local_authorities
CREATE POLICY "Authenticated users can view local authorities"
  ON public.local_authorities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage local authorities"
  ON public.local_authorities FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_archive_searches_updated_at
  BEFORE UPDATE ON public.archive_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_local_document_requests_updated_at
  BEFORE UPDATE ON public.local_document_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();