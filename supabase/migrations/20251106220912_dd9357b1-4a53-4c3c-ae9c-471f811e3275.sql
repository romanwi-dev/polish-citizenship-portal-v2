-- Create table for storing custom card descriptions
CREATE TABLE IF NOT EXISTS public.workflow_card_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  card_id TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workflow_name, card_id)
);

-- Enable Row Level Security
ALTER TABLE public.workflow_card_descriptions ENABLE ROW LEVEL SECURITY;

-- Create policies - allow everyone to read
CREATE POLICY "Anyone can view card descriptions" 
ON public.workflow_card_descriptions 
FOR SELECT 
USING (true);

-- Only authenticated users can insert/update/delete (for admin functionality)
CREATE POLICY "Authenticated users can manage card descriptions" 
ON public.workflow_card_descriptions 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workflow_card_descriptions_updated_at
BEFORE UPDATE ON public.workflow_card_descriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();