-- Add RLS policies and other components for org structure tables

-- RLS Policies for org_locations
CREATE POLICY "Company admins can manage locations"
    ON public.org_locations
    FOR ALL
    USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for org_divisions
CREATE POLICY "Company admins can manage divisions"
    ON public.org_divisions
    FOR ALL
    USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for org_departments
CREATE POLICY "Company admins can manage departments"
    ON public.org_departments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.org_divisions od 
            WHERE od.id = org_departments.division_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, od.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_divisions od 
            WHERE od.id = org_departments.division_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, od.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

-- RLS Policies for employee_org_assignments
CREATE POLICY "Company admins can manage employee assignments"
    ON public.employee_org_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = employee_org_assignments.employee_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = employee_org_assignments.employee_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_org_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all org tables
CREATE TRIGGER update_org_locations_updated_at
    BEFORE UPDATE ON public.org_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

CREATE TRIGGER update_org_divisions_updated_at
    BEFORE UPDATE ON public.org_divisions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

CREATE TRIGGER update_org_departments_updated_at
    BEFORE UPDATE ON public.org_departments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

CREATE TRIGGER update_employee_org_assignments_updated_at
    BEFORE UPDATE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_locations_company_id ON public.org_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_org_divisions_location_id ON public.org_divisions(location_id);
CREATE INDEX IF NOT EXISTS idx_org_divisions_company_id ON public.org_divisions(company_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_division_id ON public.org_departments(division_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_assignments_employee_id ON public.employee_org_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_assignments_effective_date ON public.employee_org_assignments(effective_date);