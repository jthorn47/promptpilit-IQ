-- Create user invitations table for secure invite tokens
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  company_id UUID,
  client_id UUID,
  role_assignment JSONB NOT NULL DEFAULT '{}',
  user_attributes JSONB NOT NULL DEFAULT '{}',
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitation management
CREATE POLICY "Company admins can manage invitations for their company"
ON public.user_invitations
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Policy for public token validation during signup
CREATE POLICY "Public can validate invitation tokens"
ON public.user_invitations
FOR SELECT
USING (status = 'pending' AND expires_at > now());

-- Create invitation audit log table
CREATE TABLE public.invitation_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES public.user_invitations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  performed_by UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for audit log
ALTER TABLE public.invitation_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit log
CREATE POLICY "Company admins can view invitation audit logs"
ON public.invitation_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_invitations ui
    WHERE ui.id = invitation_audit_log.invitation_id
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, ui.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'inv_' || encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Function to log invitation actions
CREATE OR REPLACE FUNCTION public.log_invitation_action(
  p_invitation_id UUID,
  p_action_type TEXT,
  p_performed_by UUID DEFAULT auth.uid(),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.invitation_audit_log (
    invitation_id,
    action_type,
    performed_by,
    metadata
  ) VALUES (
    p_invitation_id,
    p_action_type,
    p_performed_by,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Trigger to update updated_at on invitations
CREATE OR REPLACE FUNCTION public.update_invitation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invitation_updated_at();