-- Create enums for HALOassist module
CREATE TYPE public.haloassist_conversation_type AS ENUM (
    'client_chat',
    'employee_chat', 
    'internal_ops',
    'onboarding_assist',
    'form_filling',
    'troubleshooting'
);

CREATE TYPE public.haloassist_message_type AS ENUM (
    'user_message',
    'ai_response',
    'system_message',
    'action_trigger',
    'form_suggestion',
    'error_message'
);

CREATE TYPE public.haloassist_action_type AS ENUM (
    'run_payroll',
    'file_form',
    'simulate_change',
    'fill_form',
    'generate_report',
    'schedule_task',
    'send_notification',
    'update_records'
);

CREATE TYPE public.haloassist_user_type AS ENUM (
    'client',
    'employee',
    'internal_ops',
    'admin',
    'guest'
);

CREATE TYPE public.haloassist_feedback_type AS ENUM (
    'helpful',
    'not_helpful',
    'incorrect',
    'needs_improvement',
    'perfect'
);

CREATE TYPE public.haloassist_integration_type AS ENUM (
    'halocalc',
    'halofiling', 
    'halonet',
    'halovision',
    'halocommand',
    'external_api'
);

CREATE TYPE public.haloassist_input_mode AS ENUM (
    'text_chat',
    'voice_input',
    'form_driven',
    'multimodal'
);

-- HALOassist Conversations Table
CREATE TABLE public.haloassist_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id),
    user_id UUID NOT NULL,
    conversation_type public.haloassist_conversation_type NOT NULL,
    user_type public.haloassist_user_type NOT NULL,
    input_mode public.haloassist_input_mode NOT NULL DEFAULT 'text_chat',
    title TEXT,
    context_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    total_messages INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- HALOassist Messages Table  
CREATE TABLE public.haloassist_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.haloassist_conversations(id) ON DELETE CASCADE,
    message_type public.haloassist_message_type NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    user_id UUID,
    ai_model TEXT,
    input_mode public.haloassist_input_mode DEFAULT 'text_chat',
    audio_url TEXT, -- For voice inputs
    attachments JSONB DEFAULT '[]',
    context_used JSONB DEFAULT '{}',
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- HALOassist Actions Table
CREATE TABLE public.haloassist_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.haloassist_conversations(id),
    message_id UUID REFERENCES public.haloassist_messages(id),
    action_type public.haloassist_action_type NOT NULL,
    action_name TEXT NOT NULL,
    description TEXT,
    parameters JSONB DEFAULT '{}',
    execution_status TEXT DEFAULT 'pending', -- pending, executing, completed, failed
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    triggered_by UUID NOT NULL,
    executed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- HALOassist Knowledge Base Table
CREATE TABLE public.haloassist_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    source_type TEXT, -- manual, imported, generated
    source_url TEXT,
    embedding_vector VECTOR(1536), -- For semantic search
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- HALOassist Feedback Table
CREATE TABLE public.haloassist_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.haloassist_conversations(id),
    message_id UUID REFERENCES public.haloassist_messages(id),
    feedback_type public.haloassist_feedback_type NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    suggestions TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- HALOassist User Preferences Table
CREATE TABLE public.haloassist_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    company_id UUID REFERENCES public.company_settings(id),
    preferred_input_mode public.haloassist_input_mode DEFAULT 'text_chat',
    language_code TEXT DEFAULT 'en',
    personality_settings JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    custom_shortcuts JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- HALOassist Integrations Table
CREATE TABLE public.haloassist_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id),
    integration_type public.haloassist_integration_type NOT NULL,
    integration_name TEXT NOT NULL,
    configuration JSONB DEFAULT '{}',
    api_endpoints JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'healthy',
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- HALOassist Analytics Table
CREATE TABLE public.haloassist_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id),
    date_recorded DATE DEFAULT CURRENT_DATE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL NOT NULL,
    metric_type TEXT NOT NULL, -- counter, gauge, histogram
    dimensions JSONB DEFAULT '{}',
    user_type public.haloassist_user_type,
    conversation_type public.haloassist_conversation_type,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- HALOassist Training Data Table
CREATE TABLE public.haloassist_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id),
    conversation_id UUID REFERENCES public.haloassist_conversations(id),
    input_text TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    actual_output TEXT,
    feedback_score DECIMAL(3,2),
    training_status TEXT DEFAULT 'pending', -- pending, processed, used
    data_source TEXT, -- conversation, manual, imported
    quality_score DECIMAL(3,2),
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX idx_haloassist_conversations_company_user ON public.haloassist_conversations(company_id, user_id);
CREATE INDEX idx_haloassist_conversations_type ON public.haloassist_conversations(conversation_type);
CREATE INDEX idx_haloassist_conversations_active ON public.haloassist_conversations(is_active, last_activity_at);

CREATE INDEX idx_haloassist_messages_conversation ON public.haloassist_messages(conversation_id, created_at);
CREATE INDEX idx_haloassist_messages_type ON public.haloassist_messages(message_type);
CREATE INDEX idx_haloassist_messages_user ON public.haloassist_messages(user_id);

CREATE INDEX idx_haloassist_actions_conversation ON public.haloassist_actions(conversation_id);
CREATE INDEX idx_haloassist_actions_status ON public.haloassist_actions(execution_status);
CREATE INDEX idx_haloassist_actions_type ON public.haloassist_actions(action_type);

CREATE INDEX idx_haloassist_knowledge_company ON public.haloassist_knowledge_base(company_id);
CREATE INDEX idx_haloassist_knowledge_category ON public.haloassist_knowledge_base(category);
CREATE INDEX idx_haloassist_knowledge_active ON public.haloassist_knowledge_base(is_active);

CREATE INDEX idx_haloassist_feedback_conversation ON public.haloassist_feedback(conversation_id);
CREATE INDEX idx_haloassist_feedback_type ON public.haloassist_feedback(feedback_type);

CREATE INDEX idx_haloassist_analytics_company_date ON public.haloassist_analytics(company_id, date_recorded);
CREATE INDEX idx_haloassist_analytics_metric ON public.haloassist_analytics(metric_name, date_recorded);

-- Enable Row Level Security
ALTER TABLE public.haloassist_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haloassist_training_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for HALOassist Conversations
CREATE POLICY "Users can view their own conversations" ON public.haloassist_conversations
    FOR SELECT USING (user_id = auth.uid() OR has_halo_permission(auth.uid(), 'haloassist', 'read', company_id));

CREATE POLICY "Users can create conversations" ON public.haloassist_conversations
    FOR INSERT WITH CHECK (user_id = auth.uid() OR has_halo_permission(auth.uid(), 'haloassist', 'create', company_id));

CREATE POLICY "Users can update their conversations" ON public.haloassist_conversations
    FOR UPDATE USING (user_id = auth.uid() OR has_halo_permission(auth.uid(), 'haloassist', 'update', company_id));

-- RLS Policies for HALOassist Messages
CREATE POLICY "Users can view messages in their conversations" ON public.haloassist_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.haloassist_conversations c 
            WHERE c.id = haloassist_messages.conversation_id 
            AND (c.user_id = auth.uid() OR has_halo_permission(auth.uid(), 'haloassist', 'read', c.company_id))
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON public.haloassist_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.haloassist_conversations c 
            WHERE c.id = haloassist_messages.conversation_id 
            AND (c.user_id = auth.uid() OR has_halo_permission(auth.uid(), 'haloassist', 'create', c.company_id))
        )
    );

-- RLS Policies for HALOassist Actions
CREATE POLICY "Users can view actions in their conversations" ON public.haloassist_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.haloassist_conversations c 
            WHERE c.id = haloassist_actions.conversation_id 
            AND (c.user_id = auth.uid() OR has_halo_permission(auth.uid(), 'haloassist', 'read', c.company_id))
        )
    );

CREATE POLICY "Authorized users can create actions" ON public.haloassist_actions
    FOR INSERT WITH CHECK (
        triggered_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.haloassist_conversations c 
            WHERE c.id = haloassist_actions.conversation_id 
            AND has_halo_permission(auth.uid(), 'haloassist', 'execute', c.company_id)
        )
    );

-- RLS Policies for Knowledge Base
CREATE POLICY "Company users can view knowledge base" ON public.haloassist_knowledge_base
    FOR SELECT USING (is_active = true AND (company_id IS NULL OR has_halo_permission(auth.uid(), 'haloassist', 'read', company_id)));

CREATE POLICY "Admins can manage knowledge base" ON public.haloassist_knowledge_base
    FOR ALL USING (has_halo_permission(auth.uid(), 'haloassist', 'admin', company_id));

-- RLS Policies for Feedback
CREATE POLICY "Users can provide feedback" ON public.haloassist_feedback
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their feedback" ON public.haloassist_feedback
    FOR SELECT USING (user_id = auth.uid() OR has_halo_permission(auth.uid(), 'haloassist', 'admin', 
        (SELECT company_id FROM public.haloassist_conversations WHERE id = conversation_id)));

-- RLS Policies for User Preferences
CREATE POLICY "Users can manage their preferences" ON public.haloassist_user_preferences
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for Integrations
CREATE POLICY "Company admins can manage integrations" ON public.haloassist_integrations
    FOR ALL USING (has_halo_permission(auth.uid(), 'haloassist', 'admin', company_id));

-- RLS Policies for Analytics
CREATE POLICY "Company users can view analytics" ON public.haloassist_analytics
    FOR SELECT USING (has_halo_permission(auth.uid(), 'haloassist', 'read', company_id));

CREATE POLICY "System can insert analytics" ON public.haloassist_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Training Data
CREATE POLICY "Admins can manage training data" ON public.haloassist_training_data
    FOR ALL USING (has_halo_permission(auth.uid(), 'haloassist', 'admin', company_id));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_haloassist_conversations_updated_at
    BEFORE UPDATE ON public.haloassist_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_halo_updated_at();

CREATE TRIGGER update_haloassist_user_preferences_updated_at
    BEFORE UPDATE ON public.haloassist_user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_halo_updated_at();

CREATE TRIGGER update_haloassist_integrations_updated_at
    BEFORE UPDATE ON public.haloassist_integrations
    FOR EACH ROW EXECUTE FUNCTION public.update_halo_updated_at();

CREATE TRIGGER update_haloassist_knowledge_base_updated_at
    BEFORE UPDATE ON public.haloassist_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION public.update_halo_updated_at();

CREATE TRIGGER update_haloassist_training_data_updated_at
    BEFORE UPDATE ON public.haloassist_training_data
    FOR EACH ROW EXECUTE FUNCTION public.update_halo_updated_at();