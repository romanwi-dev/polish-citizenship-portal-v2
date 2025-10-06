-- Create enum for case status
CREATE TYPE public.case_status AS ENUM (
  'lead',
  'active',
  'on_hold',
  'finished',
  'failed',
  'suspended',
  'bad',
  'name_change',
  'other'
);

-- Create enum for case classification (generation)
CREATE TYPE public.case_generation AS ENUM (
  'third',
  'fourth',
  'fifth',
  'ten',
  'global',
  'vip',
  'work',
  'other'
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Client information
  client_name TEXT NOT NULL,
  client_code TEXT, -- e.g., "v-...-D-3-3'500"
  
  -- Case classification
  status case_status NOT NULL DEFAULT 'lead',
  generation case_generation,
  is_vip BOOLEAN DEFAULT false,
  
  -- Dropbox integration
  dropbox_path TEXT UNIQUE NOT NULL,
  dropbox_folder_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Case details
  country TEXT,
  start_date DATE,
  notes TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Ancestry tracking
  ancestry JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  
  -- Document details
  name TEXT NOT NULL,
  type TEXT, -- e.g., 'passport', 'poa', 'birth_certificate'
  category TEXT, -- e.g., 'AP', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM'
  file_extension TEXT,
  file_size BIGINT,
  
  -- Dropbox integration
  dropbox_path TEXT UNIQUE NOT NULL,
  dropbox_file_id TEXT,
  
  -- Document status
  is_translated BOOLEAN DEFAULT false,
  translation_required BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Create sync_logs table to track synchronization
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'case', 'document'
  status TEXT NOT NULL, -- 'started', 'in_progress', 'completed', 'failed'
  
  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_client_name ON public.cases(client_name);
CREATE INDEX idx_cases_dropbox_path ON public.cases(dropbox_path);
CREATE INDEX idx_cases_last_synced ON public.cases(last_synced_at);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_dropbox_path ON public.documents(dropbox_path);
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, admin access only - will refine based on user roles)
CREATE POLICY "Authenticated users can view all cases"
  ON public.cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create cases"
  ON public.cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cases"
  ON public.cases FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete cases"
  ON public.cases FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view sync logs"
  ON public.sync_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sync logs"
  ON public.sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();