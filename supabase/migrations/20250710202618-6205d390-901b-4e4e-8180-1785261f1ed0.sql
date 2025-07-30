-- RLS Policies for ACH tables

-- RLS Policies for company_ach_settings
CREATE POLICY "Company admins can manage their ACH settings"
ON public.company_ach_settings
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for employee_bank_accounts
CREATE POLICY "Company admins can manage employee bank accounts"
ON public.employee_bank_accounts
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for ach_batches
CREATE POLICY "Company admins can manage ACH batches"
ON public.ach_batches
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for ach_batch_entries
CREATE POLICY "Company users can view ACH batch entries"
ON public.ach_batch_entries
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
);

CREATE POLICY "Company admins can insert ACH batch entries"
ON public.ach_batch_entries
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
);

CREATE POLICY "Company admins can update ACH batch entries"
ON public.ach_batch_entries
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
);

CREATE POLICY "Company admins can delete ACH batch entries"
ON public.ach_batch_entries
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
);

-- RLS Policies for ach_audit_logs
CREATE POLICY "Company admins can view their ACH audit logs"
ON public.ach_audit_logs
FOR SELECT
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert ACH audit logs"
ON public.ach_audit_logs
FOR INSERT
WITH CHECK (true);