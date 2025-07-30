-- Create vault_audit_logs table for tracking vault activities
CREATE TABLE IF NOT EXISTS public.vault_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'upload', 'delete', 'share', 'search', 'access_denied')),
  file_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for vault audit logs
CREATE POLICY "Super admins can view all audit logs"
ON public.vault_audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Company admins can view their company audit logs"
ON public.vault_audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'company_admin'
  )
);

CREATE POLICY "Users can insert their own audit logs"
ON public.vault_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vault_audit_logs_user_id ON public.vault_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_audit_logs_created_at ON public.vault_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_vault_audit_logs_action ON public.vault_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_vault_audit_logs_file_id ON public.vault_audit_logs(file_id);