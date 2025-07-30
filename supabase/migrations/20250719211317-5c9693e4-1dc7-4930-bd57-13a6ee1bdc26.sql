-- Universal Tag System Migration
-- Create the core tags table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name TEXT NOT NULL,
    tag_color TEXT NOT NULL DEFAULT '#655DC6',
    tag_type TEXT DEFAULT 'general',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    scope TEXT NOT NULL DEFAULT 'global', -- 'global', 'company', 'team'
    company_id UUID REFERENCES public.company_settings(id),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_tag_name_per_scope UNIQUE (tag_name, company_id, scope),
    CONSTRAINT valid_tag_color CHECK (tag_color ~ '^#[0-9A-Fa-f]{6}$' OR tag_color ~ '^[a-z-]+$'),
    CONSTRAINT valid_scope CHECK (scope IN ('global', 'company', 'team'))
);

-- Create generic taggable relationships table
CREATE TABLE public.taggable_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'client', 'proposal', 'case', 'document', 'training_assignment'
    entity_id UUID NOT NULL,
    tagged_by UUID NOT NULL,
    tagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Prevent duplicate tag assignments
    CONSTRAINT unique_tag_entity UNIQUE (tag_id, entity_type, entity_id)
);

-- Create indexes for performance
CREATE INDEX idx_tags_company_scope ON public.tags(company_id, scope) WHERE is_active = true;
CREATE INDEX idx_tags_name_search ON public.tags USING gin(to_tsvector('english', tag_name));
CREATE INDEX idx_taggable_entities_lookup ON public.taggable_entities(entity_type, entity_id);
CREATE INDEX idx_taggable_entities_tag ON public.taggable_entities(tag_id);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taggable_entities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Users can view tags in their scope" ON public.tags
    FOR SELECT USING (
        scope = 'global' OR 
        (scope = 'company' AND (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

CREATE POLICY "Company admins can create company tags" ON public.tags
    FOR INSERT WITH CHECK (
        (scope = 'company' AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id)) OR
        (scope = 'global' AND has_role(auth.uid(), 'super_admin'::app_role))
    );

CREATE POLICY "Tag creators and admins can update tags" ON public.tags
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        (scope = 'company' AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id)) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

CREATE POLICY "Tag creators and admins can delete tags" ON public.tags
    FOR DELETE USING (
        created_by = auth.uid() OR 
        (scope = 'company' AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id)) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- RLS Policies for taggable entities
CREATE POLICY "Users can view tag assignments in their scope" ON public.taggable_entities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tags t 
            WHERE t.id = taggable_entities.tag_id 
            AND (
                t.scope = 'global' OR 
                (t.scope = 'company' AND (t.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))) OR
                has_role(auth.uid(), 'super_admin'::app_role)
            )
        )
    );

CREATE POLICY "Users can create tag assignments" ON public.taggable_entities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tags t 
            WHERE t.id = taggable_entities.tag_id 
            AND t.is_active = true
            AND (
                t.scope = 'global' OR 
                (t.scope = 'company' AND (t.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))) OR
                has_role(auth.uid(), 'super_admin'::app_role)
            )
        )
    );

CREATE POLICY "Users can remove their tag assignments" ON public.taggable_entities
    FOR DELETE USING (
        tagged_by = auth.uid() OR 
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'company_admin'::app_role)
    );

-- Create function to get entity tags
CREATE OR REPLACE FUNCTION public.get_entity_tags(p_entity_type TEXT, p_entity_id UUID)
RETURNS TABLE(
    tag_id UUID,
    tag_name TEXT,
    tag_color TEXT,
    tag_type TEXT,
    tagged_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.tag_name,
        t.tag_color,
        t.tag_type,
        te.tagged_at
    FROM public.tags t
    INNER JOIN public.taggable_entities te ON t.id = te.tag_id
    WHERE te.entity_type = p_entity_type 
    AND te.entity_id = p_entity_id
    AND t.is_active = true
    ORDER BY t.tag_name;
END;
$$;

-- Create function to search tags
CREATE OR REPLACE FUNCTION public.search_tags(
    p_search_term TEXT DEFAULT '',
    p_tag_type TEXT DEFAULT NULL,
    p_scope TEXT DEFAULT NULL,
    p_company_id UUID DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    tag_name TEXT,
    tag_color TEXT,
    tag_type TEXT,
    scope TEXT,
    usage_count BIGINT
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.tag_name,
        t.tag_color,
        t.tag_type,
        t.scope,
        COUNT(te.id) as usage_count
    FROM public.tags t
    LEFT JOIN public.taggable_entities te ON t.id = te.tag_id
    WHERE t.is_active = true
    AND (p_search_term = '' OR t.tag_name ILIKE '%' || p_search_term || '%')
    AND (p_tag_type IS NULL OR t.tag_type = p_tag_type)
    AND (p_scope IS NULL OR t.scope = p_scope)
    AND (p_company_id IS NULL OR t.company_id = p_company_id OR t.scope = 'global')
    AND (
        t.scope = 'global' OR 
        (t.scope = 'company' AND (t.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    )
    GROUP BY t.id, t.tag_name, t.tag_color, t.tag_type, t.scope
    ORDER BY usage_count DESC, t.tag_name;
END;
$$;

-- Create function to assign tags to entities
CREATE OR REPLACE FUNCTION public.assign_tags_to_entity(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_tag_ids UUID[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tag_id UUID;
    assigned_count INTEGER := 0;
BEGIN
    -- Remove existing tags for this entity
    DELETE FROM public.taggable_entities 
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
    
    -- Assign new tags
    FOREACH tag_id IN ARRAY p_tag_ids
    LOOP
        INSERT INTO public.taggable_entities (tag_id, entity_type, entity_id, tagged_by)
        VALUES (tag_id, p_entity_type, p_entity_id, auth.uid())
        ON CONFLICT (tag_id, entity_type, entity_id) DO NOTHING;
        
        assigned_count := assigned_count + 1;
    END LOOP;
    
    RETURN assigned_count;
END;
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_tags_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tags_updated_at();

-- Insert some default global tags
INSERT INTO public.tags (tag_name, tag_color, tag_type, scope, created_by) VALUES
('Urgent', '#ef4444', 'priority', 'global', '00000000-0000-0000-0000-000000000000'),
('High Priority', '#f97316', 'priority', 'global', '00000000-0000-0000-0000-000000000000'),
('Normal', '#22c55e', 'priority', 'global', '00000000-0000-0000-0000-000000000000'),
('Low Priority', '#6b7280', 'priority', 'global', '00000000-0000-0000-0000-000000000000'),
('Marketing', '#3b82f6', 'department', 'global', '00000000-0000-0000-0000-000000000000'),
('Sales', '#8b5cf6', 'department', 'global', '00000000-0000-0000-0000-000000000000'),
('HR', '#ec4899', 'department', 'global', '00000000-0000-0000-0000-000000000000'),
('Compliance', '#dc2626', 'compliance', 'global', '00000000-0000-0000-0000-000000000000'),
('Training', '#059669', 'training', 'global', '00000000-0000-0000-0000-000000000000'),
('Review', '#d97706', 'status', 'global', '00000000-0000-0000-0000-000000000000');