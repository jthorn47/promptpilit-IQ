-- Create table for chat sessions and logs
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_ip VARCHAR(45),
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER DEFAULT 0,
  requires_review BOOLEAN DEFAULT false,
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  message_id VARCHAR(255) NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT,
  response_time_ms INTEGER,
  requires_review BOOLEAN DEFAULT false,
  review_reason TEXT,
  is_escalation BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat notifications
CREATE TABLE public.chat_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type VARCHAR(50) NOT NULL, -- 'new_chat', 'needs_review', 'escalation'
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT false,
  notified_users UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can manage chat sessions" 
ON public.chat_sessions 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage chat messages" 
ON public.chat_messages 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage chat notifications" 
ON public.chat_notifications 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create indexes for better performance
CREATE INDEX idx_chat_sessions_requires_review ON public.chat_sessions(requires_review) WHERE requires_review = true;
CREATE INDEX idx_chat_messages_requires_review ON public.chat_messages(requires_review) WHERE requires_review = true;
CREATE INDEX idx_chat_notifications_unread ON public.chat_notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_chat_sessions_started_at ON public.chat_sessions(started_at);

-- Create trigger for updated_at
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_notifications_updated_at
BEFORE UPDATE ON public.chat_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();