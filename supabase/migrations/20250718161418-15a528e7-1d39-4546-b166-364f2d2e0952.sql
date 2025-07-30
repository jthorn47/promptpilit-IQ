-- Create tables for email-generated tasks and calendar events

-- Email tasks table (fallback when Pulse API not available)
CREATE TABLE public.email_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  sender_name TEXT,
  email_timestamp TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email calendar events table (fallback when Google Calendar not available)
CREATE TABLE public.email_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  sender_name TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.email_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_tasks
CREATE POLICY "Users can view their own email tasks" 
ON public.email_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email tasks" 
ON public.email_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email tasks" 
ON public.email_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email tasks" 
ON public.email_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for email_calendar_events
CREATE POLICY "Users can view their own email calendar events" 
ON public.email_calendar_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email calendar events" 
ON public.email_calendar_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email calendar events" 
ON public.email_calendar_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email calendar events" 
ON public.email_calendar_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_email_tasks_user_id ON public.email_tasks(user_id);
CREATE INDEX idx_email_tasks_status ON public.email_tasks(status);
CREATE INDEX idx_email_tasks_due_date ON public.email_tasks(due_date);

CREATE INDEX idx_email_calendar_events_user_id ON public.email_calendar_events(user_id);
CREATE INDEX idx_email_calendar_events_start_date ON public.email_calendar_events(start_date);
CREATE INDEX idx_email_calendar_events_status ON public.email_calendar_events(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_email_calendar_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_email_tasks_updated_at
BEFORE UPDATE ON public.email_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_email_task_updated_at();

CREATE TRIGGER update_email_calendar_events_updated_at
BEFORE UPDATE ON public.email_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_email_calendar_event_updated_at();