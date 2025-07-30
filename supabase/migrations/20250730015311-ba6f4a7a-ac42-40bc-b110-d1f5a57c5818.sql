-- Create proper RLS policies for SMS tables
DROP POLICY IF EXISTS "SMS conversations are viewable by authenticated users" ON public.sms_conversations;
DROP POLICY IF EXISTS "SMS conversations can be created by authenticated users" ON public.sms_conversations;
DROP POLICY IF EXISTS "SMS conversations can be updated by authenticated users" ON public.sms_conversations;
DROP POLICY IF EXISTS "SMS logs are viewable by authenticated users" ON public.sms_logs;
DROP POLICY IF EXISTS "SMS logs can be created by authenticated users" ON public.sms_logs;

-- Create proper RLS policies for sms_conversations
CREATE POLICY "Super admins can view all SMS conversations" 
ON public.sms_conversations 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view SMS conversations" 
ON public.sms_conversations 
FOR SELECT 
USING (has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "Case managers can view SMS conversations" 
ON public.sms_conversations 
FOR SELECT 
USING (has_role(auth.uid(), 'case_manager'::app_role));

CREATE POLICY "System can create SMS conversations" 
ON public.sms_conversations 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "System can update SMS conversations" 
ON public.sms_conversations 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create proper RLS policies for sms_logs
CREATE POLICY "Super admins can view all SMS logs" 
ON public.sms_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view SMS logs" 
ON public.sms_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "Case managers can view SMS logs" 
ON public.sms_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'case_manager'::app_role));

CREATE POLICY "System can create SMS logs" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');