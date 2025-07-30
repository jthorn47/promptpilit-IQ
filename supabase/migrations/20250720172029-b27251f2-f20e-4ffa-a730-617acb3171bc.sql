-- Create table to track report generation status
CREATE TABLE public.ai_report_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  report_content TEXT,
  error_message TEXT,
  session_id TEXT,
  conversation_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.ai_report_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own report jobs" 
ON public.ai_report_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own report jobs" 
ON public.ai_report_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update report jobs" 
ON public.ai_report_jobs 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ai_report_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_report_jobs_updated_at
BEFORE UPDATE ON public.ai_report_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_report_jobs_updated_at();

-- Enable realtime for the table
ALTER TABLE public.ai_report_jobs REPLICA IDENTITY FULL;

-- Add table to realtime publication
SELECT pg_catalog.pg_get_publication_tables('supabase_realtime');
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_report_jobs;