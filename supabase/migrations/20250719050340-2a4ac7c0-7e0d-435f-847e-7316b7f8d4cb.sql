-- Create Vault storage and permissions tables

-- Create vault_files table
CREATE TABLE public.vault_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  folder_path TEXT DEFAULT '/',
  version INTEGER NOT NULL DEFAULT 1,
  checksum TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vault_permissions table
CREATE TABLE public.vault_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.vault_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'download', 'share', 'delete')),
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(file_id, user_id, permission_type)
);

-- Create vault_share_links table
CREATE TABLE public.vault_share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.vault_files(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_downloads INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vault_audit_logs table
CREATE TABLE public.vault_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.vault_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_vault_files_company ON public.vault_files(company_id);
CREATE INDEX idx_vault_files_uploaded_by ON public.vault_files(uploaded_by);
CREATE INDEX idx_vault_files_folder ON public.vault_files(folder_path);
CREATE INDEX idx_vault_files_created ON public.vault_files(created_at);
CREATE INDEX idx_vault_permissions_file ON public.vault_permissions(file_id);
CREATE INDEX idx_vault_permissions_user ON public.vault_permissions(user_id);
CREATE INDEX idx_vault_share_links_token ON public.vault_share_links(token);
CREATE INDEX idx_vault_audit_logs_file ON public.vault_audit_logs(file_id);
CREATE INDEX idx_vault_audit_logs_user ON public.vault_audit_logs(user_id);

-- Enable RLS
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vault_files
CREATE POLICY "Users can view files they have access to" ON public.vault_files
FOR SELECT USING (
  auth.uid() = uploaded_by OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (company_id IS NOT NULL AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id)) OR
  EXISTS (
    SELECT 1 FROM public.vault_permissions vp 
    WHERE vp.file_id = id AND vp.user_id = auth.uid() AND vp.permission_type = 'view'
  )
);

CREATE POLICY "Users can upload files" ON public.vault_files
FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'company_admin'::app_role))
);

CREATE POLICY "File owners and admins can update files" ON public.vault_files
FOR UPDATE USING (
  auth.uid() = uploaded_by OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (company_id IS NOT NULL AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
);

CREATE POLICY "File owners and admins can delete files" ON public.vault_files
FOR DELETE USING (
  auth.uid() = uploaded_by OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (company_id IS NOT NULL AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
);

-- RLS Policies for vault_permissions
CREATE POLICY "Users can view their own permissions" ON public.vault_permissions
FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() = granted_by OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "File owners and admins can grant permissions" ON public.vault_permissions
FOR INSERT WITH CHECK (
  auth.uid() = granted_by AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR
   EXISTS (SELECT 1 FROM public.vault_files vf WHERE vf.id = file_id AND vf.uploaded_by = auth.uid()))
);

CREATE POLICY "Permission granters can manage permissions" ON public.vault_permissions
FOR ALL USING (
  auth.uid() = granted_by OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for vault_share_links
CREATE POLICY "File owners can manage share links" ON public.vault_share_links
FOR ALL USING (
  auth.uid() = created_by OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (SELECT 1 FROM public.vault_files vf WHERE vf.id = file_id AND vf.uploaded_by = auth.uid())
);

-- RLS Policies for vault_audit_logs
CREATE POLICY "Admins can view audit logs" ON public.vault_audit_logs
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "System can insert audit logs" ON public.vault_audit_logs
FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_vault_files_updated_at
  BEFORE UPDATE ON public.vault_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate secure share tokens
CREATE OR REPLACE FUNCTION generate_vault_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log vault actions
CREATE OR REPLACE FUNCTION log_vault_action(
  p_file_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.vault_audit_logs (
    file_id, user_id, action, details, ip_address, user_agent
  ) VALUES (
    p_file_id, auth.uid(), p_action, p_details, p_ip_address::INET, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create vault storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vault', 'vault', false, 104857600, NULL) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vault bucket
CREATE POLICY "Authenticated users can upload to vault" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'vault' AND 
  auth.uid() IS NOT NULL AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
);

CREATE POLICY "Users can view files they have access to" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'vault' AND 
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.vault_files vf 
      WHERE vf.file_path = name AND 
      (vf.uploaded_by = auth.uid() OR 
       EXISTS (SELECT 1 FROM public.vault_permissions vp 
               WHERE vp.file_id = vf.id AND vp.user_id = auth.uid()))
    )
  )
);

CREATE POLICY "File owners and admins can update vault files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'vault' AND 
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (SELECT 1 FROM public.vault_files vf 
            WHERE vf.file_path = name AND vf.uploaded_by = auth.uid())
  )
);

CREATE POLICY "File owners and admins can delete vault files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'vault' AND 
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (SELECT 1 FROM public.vault_files vf 
            WHERE vf.file_path = name AND vf.uploaded_by = auth.uid())
  )
);