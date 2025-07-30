-- Storage policies for vault files (if not already exist)
DO $$ 
BEGIN
  -- Check and create storage policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Company admins can view vault files'
  ) THEN
    CREATE POLICY "Company admins can view vault files" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'vault' AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Company admins can upload vault files'
  ) THEN
    CREATE POLICY "Company admins can upload vault files" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'vault' AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Company admins can update vault files'
  ) THEN
    CREATE POLICY "Company admins can update vault files" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'vault' AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Company admins can delete vault files'
  ) THEN
    CREATE POLICY "Company admins can delete vault files" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'vault' AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    ));
  END IF;
END $$;

-- Create vault_files table for file metadata (if not exists)
CREATE TABLE IF NOT EXISTS public.vault_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  company_id UUID,
  folder_path TEXT DEFAULT '/',
  checksum TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vault_files
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for vault_files (if not already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vault_files' 
    AND schemaname = 'public' 
    AND policyname = 'Company admins can view vault files metadata'
  ) THEN
    CREATE POLICY "Company admins can view vault files metadata" 
    ON public.vault_files 
    FOR SELECT 
    USING (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vault_files' 
    AND schemaname = 'public' 
    AND policyname = 'Company admins can insert vault files metadata'
  ) THEN
    CREATE POLICY "Company admins can insert vault files metadata" 
    ON public.vault_files 
    FOR INSERT 
    WITH CHECK (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vault_files' 
    AND schemaname = 'public' 
    AND policyname = 'Company admins can update vault files metadata'
  ) THEN
    CREATE POLICY "Company admins can update vault files metadata" 
    ON public.vault_files 
    FOR UPDATE 
    USING (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vault_files' 
    AND schemaname = 'public' 
    AND policyname = 'Company admins can delete vault files metadata'
  ) THEN
    CREATE POLICY "Company admins can delete vault files metadata" 
    ON public.vault_files 
    FOR DELETE 
    USING (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    );
  END IF;
END $$;

-- Create vault_audit_logs table for comprehensive audit logging (if not exists)
CREATE TABLE IF NOT EXISTS public.vault_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  file_id UUID REFERENCES public.vault_files(id),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vault_audit_logs
ALTER TABLE public.vault_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for vault_audit_logs (if not already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vault_audit_logs' 
    AND schemaname = 'public' 
    AND policyname = 'Company admins can view vault audit logs'
  ) THEN
    CREATE POLICY "Company admins can view vault audit logs" 
    ON public.vault_audit_logs 
    FOR SELECT 
    USING (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vault_audit_logs' 
    AND schemaname = 'public' 
    AND policyname = 'System can insert vault audit logs'
  ) THEN
    CREATE POLICY "System can insert vault audit logs" 
    ON public.vault_audit_logs 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- Create function for vault audit logging (if not exists)
CREATE OR REPLACE FUNCTION public.log_vault_action(
  p_file_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.vault_audit_logs (
    user_id,
    action,
    file_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_file_id,
    p_details
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;