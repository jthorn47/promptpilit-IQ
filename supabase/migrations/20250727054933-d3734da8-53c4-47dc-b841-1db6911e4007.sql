-- Fix the crm_metrics view by removing SECURITY DEFINER
DROP VIEW IF EXISTS public.crm_metrics;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW public.crm_metrics AS
SELECT 
    COUNT(DISTINCT cc.id) as total_companies,
    COUNT(DISTINCT co.id) as total_contacts, 
    COUNT(DISTINCT opp.id) as total_opportunities,
    COUNT(DISTINCT CASE WHEN opp.stage = 'won' THEN opp.id END) as won_opportunities,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COALESCE(SUM(CASE WHEN opp.stage = 'won' THEN opp.value END), 0) as total_revenue,
    COALESCE(SUM(opp.value), 0) as pipeline_value,
    CASE 
        WHEN COUNT(DISTINCT opp.id) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN opp.stage = 'won' THEN opp.id END)::DECIMAL / COUNT(DISTINCT opp.id)) * 100, 2)
        ELSE 0 
    END as win_rate_percentage
FROM public.crm_companies cc
LEFT JOIN public.crm_contacts co ON cc.id = co.company_id
LEFT JOIN public.crm_opportunities opp ON cc.id = opp.company_id
LEFT JOIN public.crm_tasks t ON (t.company_id = cc.id OR t.opportunity_id = opp.id);