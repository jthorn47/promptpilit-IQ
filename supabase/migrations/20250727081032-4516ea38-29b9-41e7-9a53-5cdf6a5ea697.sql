-- Phase 1: Add Mailchimp integration fields to existing tables

-- Add Mailchimp fields to email_campaigns table
ALTER TABLE public.email_campaigns 
ADD COLUMN mailchimp_campaign_id TEXT,
ADD COLUMN mailchimp_list_id TEXT,
ADD COLUMN mailchimp_status TEXT DEFAULT 'draft',
ADD COLUMN sync_analytics BOOLEAN DEFAULT true;

-- Add Mailchimp fields to email_templates table  
ALTER TABLE public.email_templates
ADD COLUMN mailchimp_template_id TEXT,
ADD COLUMN sync_to_mailchimp BOOLEAN DEFAULT false;

-- Add Mailchimp fields to leads table
ALTER TABLE public.leads
ADD COLUMN mailchimp_member_id TEXT,
ADD COLUMN mailchimp_tags TEXT[] DEFAULT '{}',
ADD COLUMN mailchimp_status TEXT;

-- Create mailchimp_analytics table for campaign performance data
CREATE TABLE public.mailchimp_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
    mailchimp_campaign_id TEXT NOT NULL,
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    forwards INTEGER DEFAULT 0,
    opens_rate NUMERIC(5,4) DEFAULT 0.0,
    clicks_rate NUMERIC(5,4) DEFAULT 0.0,
    bounce_rate NUMERIC(5,4) DEFAULT 0.0,
    unsubscribe_rate NUMERIC(5,4) DEFAULT 0.0,
    list_stats JSONB DEFAULT '{}',
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on mailchimp_analytics table
ALTER TABLE public.mailchimp_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for mailchimp_analytics
CREATE POLICY "Company users can manage their mailchimp analytics" ON public.mailchimp_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.email_campaigns ec
            WHERE ec.id = mailchimp_analytics.campaign_id
            AND (
                has_role(auth.uid(), 'company_admin'::app_role) OR 
                has_role(auth.uid(), 'super_admin'::app_role)
            )
        )
    );

-- Add updated_at trigger for mailchimp_analytics
CREATE TRIGGER update_mailchimp_analytics_updated_at
    BEFORE UPDATE ON public.mailchimp_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_mailchimp_analytics_campaign_id ON public.mailchimp_analytics(campaign_id);
CREATE INDEX idx_mailchimp_analytics_mailchimp_campaign_id ON public.mailchimp_analytics(mailchimp_campaign_id);
CREATE INDEX idx_email_campaigns_mailchimp_campaign_id ON public.email_campaigns(mailchimp_campaign_id);
CREATE INDEX idx_email_templates_mailchimp_template_id ON public.email_templates(mailchimp_template_id);
CREATE INDEX idx_leads_mailchimp_member_id ON public.leads(mailchimp_member_id);