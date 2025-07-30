-- Phase 4: Reports & Analytics Dashboard

-- Sales metrics tracking table
CREATE TABLE public.sales_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL, -- lead_conversion, email_performance, revenue, activity_volume
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'daily', -- daily, weekly, monthly, quarterly, yearly
  additional_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Revenue tracking table
CREATE TABLE public.revenue_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id),
  lead_id UUID REFERENCES public.leads(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  revenue_type TEXT NOT NULL, -- closed_deal, recurring, upsell, renewal
  recorded_date DATE NOT NULL,
  sales_rep_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance targets table
CREATE TABLE public.performance_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL, -- revenue, leads, conversions, activities
  target_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  assigned_to UUID, -- sales rep or team
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics reports table
CREATE TABLE public.analytics_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- sales_summary, lead_analysis, email_performance, revenue_forecast
  report_data JSONB NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  generated_by UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_scheduled BOOLEAN NOT NULL DEFAULT false,
  schedule_frequency TEXT, -- daily, weekly, monthly
  next_generation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to calculate conversion rates
CREATE OR REPLACE FUNCTION public.calculate_conversion_rate(
  start_date DATE,
  end_date DATE
) RETURNS NUMERIC AS $$
DECLARE
  total_leads INTEGER;
  converted_leads INTEGER;
  conversion_rate NUMERIC;
BEGIN
  -- Count total leads in period
  SELECT COUNT(*) INTO total_leads
  FROM public.leads
  WHERE created_at::DATE BETWEEN start_date AND end_date;
  
  -- Count converted leads (deals created from leads)
  SELECT COUNT(DISTINCT l.id) INTO converted_leads
  FROM public.leads l
  INNER JOIN public.deals d ON l.id = d.lead_id
  WHERE l.created_at::DATE BETWEEN start_date AND end_date;
  
  -- Calculate conversion rate
  IF total_leads > 0 THEN
    conversion_rate := (converted_leads::NUMERIC / total_leads::NUMERIC) * 100;
  ELSE
    conversion_rate := 0;
  END IF;
  
  RETURN ROUND(conversion_rate, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get email performance metrics
CREATE OR REPLACE FUNCTION public.get_email_performance(
  start_date DATE,
  end_date DATE
) RETURNS TABLE (
  total_campaigns INTEGER,
  total_emails_sent INTEGER,
  total_opened INTEGER,
  total_clicked INTEGER,
  total_bounced INTEGER,
  open_rate NUMERIC,
  click_rate NUMERIC,
  bounce_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::INTEGER as total_campaigns,
    COALESCE(SUM(c.sent_count), 0)::INTEGER as total_emails_sent,
    COALESCE(SUM(c.opened_count), 0)::INTEGER as total_opened,
    COALESCE(SUM(c.clicked_count), 0)::INTEGER as total_clicked,
    COALESCE(SUM(c.bounced_count), 0)::INTEGER as total_bounced,
    CASE 
      WHEN SUM(c.sent_count) > 0 THEN 
        ROUND((SUM(c.opened_count)::NUMERIC / SUM(c.sent_count)::NUMERIC) * 100, 2)
      ELSE 0
    END as open_rate,
    CASE 
      WHEN SUM(c.sent_count) > 0 THEN 
        ROUND((SUM(c.clicked_count)::NUMERIC / SUM(c.sent_count)::NUMERIC) * 100, 2)
      ELSE 0
    END as click_rate,
    CASE 
      WHEN SUM(c.sent_count) > 0 THEN 
        ROUND((SUM(c.bounced_count)::NUMERIC / SUM(c.sent_count)::NUMERIC) * 100, 2)
      ELSE 0
    END as bounce_rate
  FROM public.email_campaigns c
  WHERE c.created_at::DATE BETWEEN start_date AND end_date
    AND c.status = 'sent';
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get sales pipeline metrics
CREATE OR REPLACE FUNCTION public.get_pipeline_metrics(
  start_date DATE,
  end_date DATE
) RETURNS TABLE (
  stage_name TEXT,
  deal_count INTEGER,
  total_value NUMERIC,
  avg_deal_size NUMERIC,
  win_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.name as stage_name,
    COUNT(d.id)::INTEGER as deal_count,
    COALESCE(SUM(d.value), 0) as total_value,
    CASE 
      WHEN COUNT(d.id) > 0 THEN ROUND(AVG(d.value), 2)
      ELSE 0
    END as avg_deal_size,
    CASE 
      WHEN COUNT(d.id) > 0 THEN 
        ROUND((COUNT(CASE WHEN d.status = 'won' THEN 1 END)::NUMERIC / COUNT(d.id)::NUMERIC) * 100, 2)
      ELSE 0
    END as win_rate
  FROM public.deal_stages ds
  LEFT JOIN public.deals d ON ds.id = d.stage_id 
    AND d.created_at::DATE BETWEEN start_date AND end_date
  WHERE ds.is_active = true
  GROUP BY ds.id, ds.name, ds.stage_order
  ORDER BY ds.stage_order;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable Row Level Security
ALTER TABLE public.sales_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_metrics
CREATE POLICY "Sales reps can view all sales metrics" 
ON public.sales_metrics FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage sales metrics" 
ON public.sales_metrics FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for revenue_records
CREATE POLICY "Sales reps can view all revenue records" 
ON public.revenue_records FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage revenue records" 
ON public.revenue_records FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for performance_targets
CREATE POLICY "Sales reps can view performance targets" 
ON public.performance_targets FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage performance targets" 
ON public.performance_targets FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for analytics_reports
CREATE POLICY "Sales reps can view analytics reports" 
ON public.analytics_reports FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage analytics reports" 
ON public.analytics_reports FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_sales_metrics_updated_at
  BEFORE UPDATE ON public.sales_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_records_updated_at
  BEFORE UPDATE ON public.revenue_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_targets_updated_at
  BEFORE UPDATE ON public.performance_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at
  BEFORE UPDATE ON public.analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_sales_metrics_date ON public.sales_metrics(metric_date);
CREATE INDEX idx_sales_metrics_type ON public.sales_metrics(metric_type);
CREATE INDEX idx_revenue_records_date ON public.revenue_records(recorded_date);
CREATE INDEX idx_revenue_records_sales_rep ON public.revenue_records(sales_rep_id);
CREATE INDEX idx_performance_targets_period ON public.performance_targets(period_start, period_end);
CREATE INDEX idx_analytics_reports_type ON public.analytics_reports(report_type);
CREATE INDEX idx_analytics_reports_date_range ON public.analytics_reports(date_range_start, date_range_end);