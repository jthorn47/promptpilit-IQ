-- Create AI Assistant logs table for analytics and feedback
CREATE TABLE public.ai_assistant_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  training_module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  user_role TEXT,
  current_section TEXT,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for AI assistant logs
CREATE POLICY "Users can view AI assistant logs for their company" 
ON public.ai_assistant_logs 
FOR SELECT 
USING (true); -- For now, allow all reads for analytics

CREATE POLICY "Users can create AI assistant logs" 
ON public.ai_assistant_logs 
FOR INSERT 
WITH CHECK (true); -- Allow all users to log interactions

-- Create index for better performance
CREATE INDEX idx_ai_assistant_logs_module_id ON public.ai_assistant_logs(training_module_id);
CREATE INDEX idx_ai_assistant_logs_conversation_id ON public.ai_assistant_logs(conversation_id);
CREATE INDEX idx_ai_assistant_logs_timestamp ON public.ai_assistant_logs(timestamp);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ai_assistant_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_assistant_logs_timestamp
BEFORE INSERT ON public.ai_assistant_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_assistant_logs_updated_at();