-- Phase 1: HaaLOvault Database Schema Enhancement
-- Add missing relationship tables and features using existing halovault_documents as base

-- Create entity relationships table for linking files to Company/Employee/Proposal/Case
CREATE TABLE public.halovault_entity_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.halovault_documents(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'employee', 'proposal', 'case', 'deal', 'lead')),
  entity_id UUID NOT NULL,
  relationship_type TEXT DEFAULT 'attached', -- attached, referenced, related
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(document_id, entity_type, entity_id)
);

-- Create dedicated file tags system
CREATE TABLE public.halovault_file_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.halovault_documents(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_category TEXT DEFAULT 'general', -- general, confidential, legal, hr, financial
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(document_id, tag_name)
);

-- Create admin settings for system-wide configuration
CREATE TABLE public.halovault_admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin settings
INSERT INTO public.halovault_admin_settings (setting_key, setting_value, description) VALUES
('file_retention_years', '7', 'Default file retention period in years'),
('max_file_size_mb', '100', 'Maximum file size in MB'),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","txt","zip"]', 'Allowed file extensions'),
('external_sharing_enabled', 'true', 'Enable/disable external file sharing'),
('auto_delete_expired_shares', 'true', 'Automatically delete expired share links'),
('preview_enabled_types', '["pdf","jpg","jpeg","png","txt"]', 'File types that support preview');

-- Enable RLS on new tables
ALTER TABLE public.halovault_entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halovault_file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halovault_admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entity relationships
CREATE POLICY "Users can view entity relationships for accessible documents"
ON public.halovault_entity_relationships FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_documents hd
    WHERE hd.id = halovault_entity_relationships.document_id
    AND (
      hd.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_document_permissions hdp
        WHERE hdp.document_id = hd.id
        AND hdp.user_id = auth.uid()
        AND hdp.permission_type IN ('view', 'edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can manage entity relationships for their documents"
ON public.halovault_entity_relationships FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_documents hd
    WHERE hd.id = halovault_entity_relationships.document_id
    AND (
      hd.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_document_permissions hdp
        WHERE hdp.document_id = hd.id
        AND hdp.user_id = auth.uid()
        AND hdp.permission_type IN ('edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- RLS Policies for file tags
CREATE POLICY "Users can view tags for accessible documents"
ON public.halovault_file_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_documents hd
    WHERE hd.id = halovault_file_tags.document_id
    AND (
      hd.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_document_permissions hdp
        WHERE hdp.document_id = hd.id
        AND hdp.user_id = auth.uid()
        AND hdp.permission_type IN ('view', 'edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can manage tags for their documents"
ON public.halovault_file_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_documents hd
    WHERE hd.id = halovault_file_tags.document_id
    AND (
      hd.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_document_permissions hdp
        WHERE hdp.document_id = hd.id
        AND hdp.user_id = auth.uid()
        AND hdp.permission_type IN ('edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- RLS Policies for admin settings
CREATE POLICY "Super admins can manage admin settings"
ON public.halovault_admin_settings FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view admin settings"
ON public.halovault_admin_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_halovault_entity_relationships_entity ON public.halovault_entity_relationships(entity_type, entity_id);
CREATE INDEX idx_halovault_entity_relationships_document ON public.halovault_entity_relationships(document_id);
CREATE INDEX idx_halovault_file_tags_name ON public.halovault_file_tags(tag_name);
CREATE INDEX idx_halovault_file_tags_category ON public.halovault_file_tags(tag_category);
CREATE INDEX idx_halovault_file_tags_document ON public.halovault_file_tags(document_id);

-- Full-text search index for tags
CREATE INDEX idx_halovault_file_tags_search ON public.halovault_file_tags USING GIN(to_tsvector('english', tag_name));

-- Add missing columns to existing halovault_documents table for enhanced functionality
ALTER TABLE public.halovault_documents 
ADD COLUMN IF NOT EXISTS checksum TEXT,
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create function to get file tags for search
CREATE OR REPLACE FUNCTION get_document_tags(doc_id UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT tag_name 
    FROM public.halovault_file_tags 
    WHERE document_id = doc_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;