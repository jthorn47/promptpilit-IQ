-- Create RLS policies for vault_files table
CREATE POLICY "Users can view their company's files" 
ON public.vault_files 
FOR SELECT 
USING (
  company_id IS NULL OR 
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can insert files for their company" 
ON public.vault_files 
FOR INSERT 
WITH CHECK (
  company_id IS NULL OR 
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can update their company's files" 
ON public.vault_files 
FOR UPDATE 
USING (
  company_id IS NULL OR 
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can delete their company's files" 
ON public.vault_files 
FOR DELETE 
USING (
  company_id IS NULL OR 
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create RLS policies for vault_share_links table
CREATE POLICY "Users can view share links for their company's files" 
ON public.vault_share_links 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM vault_files vf 
    WHERE vf.id = vault_share_links.file_id 
    AND (
      vf.company_id IS NULL OR 
      vf.company_id = get_user_company_id(auth.uid()) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can create share links for their company's files" 
ON public.vault_share_links 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vault_files vf 
    WHERE vf.id = vault_share_links.file_id 
    AND (
      vf.company_id IS NULL OR 
      vf.company_id = get_user_company_id(auth.uid()) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can update share links for their company's files" 
ON public.vault_share_links 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM vault_files vf 
    WHERE vf.id = vault_share_links.file_id 
    AND (
      vf.company_id IS NULL OR 
      vf.company_id = get_user_company_id(auth.uid()) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Create RLS policies for vault_audit_logs table
CREATE POLICY "Users can view audit logs for their company's files" 
ON public.vault_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM vault_files vf 
    WHERE vf.id = vault_audit_logs.file_id 
    AND (
      vf.company_id IS NULL OR 
      vf.company_id = get_user_company_id(auth.uid()) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  ) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert audit logs" 
ON public.vault_audit_logs 
FOR INSERT 
WITH CHECK (true);