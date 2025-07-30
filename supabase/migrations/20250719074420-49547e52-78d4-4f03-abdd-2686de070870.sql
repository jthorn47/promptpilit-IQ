-- Phase 1: HaaLOvault Database Schema Consolidation & Enhancement
-- Consolidate to halovault_* as canonical schema and add missing relationships

-- Create entity relationships table for linking files to Company/Employee/Proposal/Case
CREATE TABLE public.halovault_entity_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.halovault_files(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'employee', 'proposal', 'case', 'deal', 'lead')),
  entity_id UUID NOT NULL,
  relationship_type TEXT DEFAULT 'attached', -- attached, referenced, related
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(file_id, entity_type, entity_id)
);

-- Create dedicated file tags system
CREATE TABLE public.halovault_file_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.halovault_files(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_category TEXT DEFAULT 'general', -- general, confidential, legal, hr, financial
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(file_id, tag_name)
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

-- Create file versions table for proper version control
CREATE TABLE public.halovault_file_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.halovault_files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  checksum TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version_notes TEXT,
  is_current BOOLEAN DEFAULT false,
  UNIQUE(file_id, version_number)
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
ALTER TABLE public.halovault_file_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entity relationships
CREATE POLICY "Users can view entity relationships for accessible files"
ON public.halovault_entity_relationships FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_files hf
    WHERE hf.id = halovault_entity_relationships.file_id
    AND (
      hf.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_permissions hp
        WHERE hp.file_id = hf.id
        AND hp.user_id = auth.uid()
        AND hp.permission_type IN ('view', 'edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can manage entity relationships for their files"
ON public.halovault_entity_relationships FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_files hf
    WHERE hf.id = halovault_entity_relationships.file_id
    AND (
      hf.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_permissions hp
        WHERE hp.file_id = hf.id
        AND hp.user_id = auth.uid()
        AND hp.permission_type IN ('edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- RLS Policies for file tags
CREATE POLICY "Users can view tags for accessible files"
ON public.halovault_file_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_files hf
    WHERE hf.id = halovault_file_tags.file_id
    AND (
      hf.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_permissions hp
        WHERE hp.file_id = hf.id
        AND hp.user_id = auth.uid()
        AND hp.permission_type IN ('view', 'edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can manage tags for their files"
ON public.halovault_file_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_files hf
    WHERE hf.id = halovault_file_tags.file_id
    AND (
      hf.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_permissions hp
        WHERE hp.file_id = hf.id
        AND hp.user_id = auth.uid()
        AND hp.permission_type IN ('edit', 'admin')
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

-- RLS Policies for file versions
CREATE POLICY "Users can view versions for accessible files"
ON public.halovault_file_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_files hf
    WHERE hf.id = halovault_file_versions.file_id
    AND (
      hf.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_permissions hp
        WHERE hp.file_id = hf.id
        AND hp.user_id = auth.uid()
        AND hp.permission_type IN ('view', 'edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can manage versions for their files"
ON public.halovault_file_versions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.halovault_files hf
    WHERE hf.id = halovault_file_versions.file_id
    AND (
      hf.uploaded_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.halovault_permissions hp
        WHERE hp.file_id = hf.id
        AND hp.user_id = auth.uid()
        AND hp.permission_type IN ('edit', 'admin')
      ) OR
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_halovault_entity_relationships_entity ON public.halovault_entity_relationships(entity_type, entity_id);
CREATE INDEX idx_halovault_entity_relationships_file ON public.halovault_entity_relationships(file_id);
CREATE INDEX idx_halovault_file_tags_name ON public.halovault_file_tags(tag_name);
CREATE INDEX idx_halovault_file_tags_category ON public.halovault_file_tags(tag_category);
CREATE INDEX idx_halovault_file_tags_file ON public.halovault_file_tags(file_id);
CREATE INDEX idx_halovault_file_versions_file ON public.halovault_file_versions(file_id, version_number);
CREATE INDEX idx_halovault_file_versions_current ON public.halovault_file_versions(file_id) WHERE is_current = true;

-- Full-text search index for tags
CREATE INDEX idx_halovault_file_tags_search ON public.halovault_file_tags USING GIN(to_tsvector('english', tag_name));

-- Trigger to update file metadata when versions are added
CREATE OR REPLACE FUNCTION update_file_current_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Set all versions for this file to not current
  UPDATE public.halovault_file_versions 
  SET is_current = false 
  WHERE file_id = NEW.file_id;
  
  -- Set the new version as current
  NEW.is_current = true;
  
  -- Update the main file record with latest version info
  UPDATE public.halovault_files 
  SET 
    file_size = NEW.file_size,
    mime_type = NEW.mime_type,
    updated_at = now()
  WHERE id = NEW.file_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_file_current_version
  BEFORE INSERT ON public.halovault_file_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_file_current_version();