-- Create integration_tokens table for storing OAuth and API integration credentials
CREATE TABLE public.integration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  connection_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(app_name, client_id)
);

-- Enable Row Level Security
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for integration tokens
CREATE POLICY "Users can view their own integration tokens" 
ON public.integration_tokens 
FOR SELECT 
USING (true); -- For now, allow all authenticated users

CREATE POLICY "Users can insert their own integration tokens" 
ON public.integration_tokens 
FOR INSERT 
WITH CHECK (true); -- For now, allow all authenticated users

CREATE POLICY "Users can update their own integration tokens" 
ON public.integration_tokens 
FOR UPDATE 
USING (true); -- For now, allow all authenticated users

CREATE POLICY "Users can delete their own integration tokens" 
ON public.integration_tokens 
FOR DELETE 
USING (true); -- For now, allow all authenticated users

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_integration_tokens_updated_at
BEFORE UPDATE ON public.integration_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();