-- Create missing RLS policies for vault_files table
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