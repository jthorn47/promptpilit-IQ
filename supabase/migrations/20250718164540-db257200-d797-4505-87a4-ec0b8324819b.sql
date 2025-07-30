-- Create proposal tracking tables

-- Main proposal tracking table
CREATE TABLE public.proposal_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL,
  proposal_type TEXT NOT NULL DEFAULT 'pdf', -- 'propgen' or 'pdf'
  proposal_id UUID NULL, -- link to PropGEN proposal if applicable
  proposal_url TEXT NULL, -- URL to PDF or PropGEN proposal
  company_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'opened', 'no_response', 'closed_won', 'closed_lost'
  tracking_data JSONB DEFAULT '{}', -- store open rates, view counts, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NULL
);

-- Enable RLS
ALTER TABLE public.proposal_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view proposal tracking for their company" 
ON public.proposal_tracking 
FOR SELECT 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  created_by = auth.uid()
);

CREATE POLICY "Authenticated users can create proposal tracking" 
ON public.proposal_tracking 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their proposal tracking" 
ON public.proposal_tracking 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  created_by = auth.uid()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_proposal_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposal_tracking_updated_at
BEFORE UPDATE ON public.proposal_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_proposal_tracking_updated_at();

-- Create proposal events table for detailed tracking
CREATE TABLE public.proposal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposal_tracking(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'opened', 'viewed', 'downloaded', 'shared'
  event_data JSONB DEFAULT '{}', -- additional event metadata
  user_agent TEXT NULL,
  ip_address INET NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.proposal_events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view proposal events for their proposals" 
ON public.proposal_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.proposal_tracking pt 
    WHERE pt.id = proposal_events.proposal_id 
    AND (
      has_role(auth.uid(), 'company_admin'::app_role) OR 
      has_role(auth.uid(), 'super_admin'::app_role) OR
      pt.created_by = auth.uid()
    )
  )
);

CREATE POLICY "System can insert proposal events" 
ON public.proposal_events 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_proposal_tracking_email_id ON public.proposal_tracking(email_id);
CREATE INDEX idx_proposal_tracking_status ON public.proposal_tracking(status);
CREATE INDEX idx_proposal_tracking_sent_at ON public.proposal_tracking(sent_at);
CREATE INDEX idx_proposal_events_proposal_id ON public.proposal_events(proposal_id);
CREATE INDEX idx_proposal_events_timestamp ON public.proposal_events(timestamp);