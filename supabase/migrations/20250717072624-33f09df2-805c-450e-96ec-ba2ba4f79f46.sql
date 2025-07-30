-- HALOvision Strategic Intelligence Module
-- Core enums for forecasting and analytics

CREATE TYPE forecast_type AS ENUM ('labor_cost', 'overtime', 'tax_burden', 'department_cost', 'project_cost', 'role_cost');
CREATE TYPE simulation_status AS ENUM ('draft', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE anomaly_type AS ENUM ('overtime_spike', 'cost_variance', 'misclassification', 'tax_anomaly', 'pattern_deviation');
CREATE TYPE visualization_type AS ENUM ('line_chart', 'bar_chart', 'heat_map', 'scatter_plot', 'distribution', 'trend_analysis');
CREATE TYPE insight_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Forecasting models and configurations
CREATE TABLE public.halovision_forecast_models (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    model_type forecast_type NOT NULL,
    algorithm_config JSONB NOT NULL DEFAULT '{}',
    training_data_period INTERVAL NOT NULL DEFAULT '90 days',
    accuracy_metrics JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_trained_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Strategic forecasts and predictions
CREATE TABLE public.halovision_forecasts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES halovision_forecast_models(id) ON DELETE CASCADE,
    forecast_type forecast_type NOT NULL,
    forecast_name TEXT NOT NULL,
    forecast_period_start DATE NOT NULL,
    forecast_period_end DATE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    forecast_data JSONB NOT NULL, -- Contains the actual forecast values
    confidence_intervals JSONB NOT NULL DEFAULT '{}',
    scenario_parameters JSONB NOT NULL DEFAULT '{}',
    accuracy_score DECIMAL(5,4),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interactive simulations and what-if scenarios
CREATE TABLE public.halovision_simulations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    simulation_name TEXT NOT NULL,
    description TEXT,
    base_forecast_id UUID REFERENCES halovision_forecasts(id),
    simulation_parameters JSONB NOT NULL, -- wage changes, headcount changes, etc.
    simulation_results JSONB, -- output data
    status simulation_status NOT NULL DEFAULT 'draft',
    execution_time_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Anomaly detection and alerting
CREATE TABLE public.halovision_anomalies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    anomaly_type anomaly_type NOT NULL,
    severity anomaly_severity NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    detection_context JSONB NOT NULL DEFAULT '{}', -- department, employee, period, etc.
    anomaly_score DECIMAL(5,4) NOT NULL,
    threshold_breached DECIMAL(10,2),
    expected_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    root_cause_analysis JSONB,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dashboard configurations and layouts
CREATE TABLE public.halovision_dashboards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    dashboard_name TEXT NOT NULL,
    description TEXT,
    layout_config JSONB NOT NULL, -- widget positions, sizes, types
    filters_config JSONB NOT NULL DEFAULT '{}',
    refresh_frequency INTEGER NOT NULL DEFAULT 300, -- seconds
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_default BOOLEAN NOT NULL DEFAULT false,
    access_permissions JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Visualization components and charts
CREATE TABLE public.halovision_visualizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    dashboard_id UUID REFERENCES halovision_dashboards(id) ON DELETE CASCADE,
    visualization_name TEXT NOT NULL,
    visualization_type visualization_type NOT NULL,
    data_source_config JSONB NOT NULL, -- SQL queries, API endpoints, etc.
    chart_config JSONB NOT NULL, -- axes, colors, styling
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 6,
    height INTEGER NOT NULL DEFAULT 4,
    refresh_interval INTEGER NOT NULL DEFAULT 300,
    is_interactive BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-generated insights and recommendations
CREATE TABLE public.halovision_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    insight_title TEXT NOT NULL,
    insight_content TEXT NOT NULL,
    insight_type TEXT NOT NULL, -- 'cost_optimization', 'risk_alert', 'trend_analysis', etc.
    priority insight_priority NOT NULL DEFAULT 'medium',
    data_sources JSONB NOT NULL, -- references to forecasts, anomalies, etc.
    supporting_evidence JSONB NOT NULL DEFAULT '{}',
    recommended_actions JSONB NOT NULL DEFAULT '[]',
    confidence_score DECIMAL(5,4),
    generated_by_ai BOOLEAN NOT NULL DEFAULT true,
    is_actionable BOOLEAN NOT NULL DEFAULT true,
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance metrics and system monitoring
CREATE TABLE public.halovision_performance_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_category TEXT NOT NULL, -- 'forecast_accuracy', 'query_performance', 'anomaly_detection'
    metric_value DECIMAL(12,4) NOT NULL,
    metric_unit TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    time_period INTERVAL,
    context_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integration logs with other HALO modules
CREATE TABLE public.halovision_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    source_module TEXT NOT NULL, -- 'HALOcalc', 'HALOfiling', 'HALOassist'
    integration_type TEXT NOT NULL, -- 'data_sync', 'trigger_forecast', 'anomaly_check'
    payload JSONB NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    processing_result JSONB,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_halovision_forecasts_company_type ON halovision_forecasts(company_id, forecast_type);
CREATE INDEX idx_halovision_forecasts_period ON halovision_forecasts(forecast_period_start, forecast_period_end);
CREATE INDEX idx_halovision_simulations_company_status ON halovision_simulations(company_id, status);
CREATE INDEX idx_halovision_anomalies_company_severity ON halovision_anomalies(company_id, severity, is_resolved);
CREATE INDEX idx_halovision_anomalies_detected_at ON halovision_anomalies(detected_at);
CREATE INDEX idx_halovision_performance_metrics_company_name ON halovision_performance_metrics(company_id, metric_name);
CREATE INDEX idx_halovision_insights_company_priority ON halovision_insights(company_id, priority, is_acknowledged);

-- Enable Row Level Security
ALTER TABLE halovision_forecast_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovision_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for HALOvision

-- Forecast models (company-scoped with admin permissions)
CREATE POLICY "Company admins can manage forecast models" ON halovision_forecast_models
FOR ALL USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'admin'::permission_action, company_id));

CREATE POLICY "Company users can view forecast models" ON halovision_forecast_models
FOR SELECT USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'read'::permission_action, company_id));

-- Forecasts (company-scoped)
CREATE POLICY "Company users can manage forecasts" ON halovision_forecasts
FOR ALL USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'write'::permission_action, company_id));

-- Simulations (company-scoped)
CREATE POLICY "Company users can manage simulations" ON halovision_simulations
FOR ALL USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'write'::permission_action, company_id));

-- Anomalies (company-scoped)
CREATE POLICY "Company users can view anomalies" ON halovision_anomalies
FOR SELECT USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'read'::permission_action, company_id));

CREATE POLICY "Company users can update anomalies" ON halovision_anomalies
FOR UPDATE USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'write'::permission_action, company_id));

-- Dashboards (company-scoped with sharing)
CREATE POLICY "Company users can manage dashboards" ON halovision_dashboards
FOR ALL USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'write'::permission_action, company_id));

-- Visualizations (follow dashboard permissions)
CREATE POLICY "Company users can manage visualizations" ON halovision_visualizations
FOR ALL USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'write'::permission_action, company_id));

-- Insights (company-scoped)
CREATE POLICY "Company users can view insights" ON halovision_insights
FOR SELECT USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'read'::permission_action, company_id));

CREATE POLICY "Company users can acknowledge insights" ON halovision_insights
FOR UPDATE USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'write'::permission_action, company_id));

-- Performance metrics (company-scoped)
CREATE POLICY "Company users can view performance metrics" ON halovision_performance_metrics
FOR SELECT USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'read'::permission_action, company_id));

-- Integrations (company-scoped)
CREATE POLICY "Company users can view integrations" ON halovision_integrations
FOR SELECT USING (has_halo_permission(auth.uid(), 'halovision'::halo_module, 'read'::permission_action, company_id));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_halovision_forecast_models_updated_at 
    BEFORE UPDATE ON halovision_forecast_models 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovision_forecasts_updated_at 
    BEFORE UPDATE ON halovision_forecasts 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovision_simulations_updated_at 
    BEFORE UPDATE ON halovision_simulations 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovision_anomalies_updated_at 
    BEFORE UPDATE ON halovision_anomalies 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovision_dashboards_updated_at 
    BEFORE UPDATE ON halovision_dashboards 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovision_visualizations_updated_at 
    BEFORE UPDATE ON halovision_visualizations 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovision_insights_updated_at 
    BEFORE UPDATE ON halovision_insights 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();