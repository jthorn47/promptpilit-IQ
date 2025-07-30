-- Create divisions table
CREATE TABLE public.divisions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    default_bank_account_id UUID,
    payroll_schedule_id UUID,
    invoice_template_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id, name),
    UNIQUE(company_id, code) WHERE code IS NOT NULL
);

-- Create departments table
CREATE TABLE public.departments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(division_id, name),
    UNIQUE(division_id, code) WHERE code IS NOT NULL
);

-- Create locations table
CREATE TABLE public.locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(department_id, name)
);

-- Create employee org assignments table
CREATE TABLE public.employee_org_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    division_id UUID NOT NULL REFERENCES public.divisions(id),
    department_id UUID NOT NULL REFERENCES public.departments(id),
    location_id UUID NOT NULL REFERENCES public.locations(id),
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(employee_id)
);

-- Add indexes for better performance
CREATE INDEX idx_divisions_company_id ON public.divisions(company_id);
CREATE INDEX idx_departments_division_id ON public.departments(division_id);
CREATE INDEX idx_locations_department_id ON public.locations(department_id);
CREATE INDEX idx_employee_org_assignments_employee_id ON public.employee_org_assignments(employee_id);
CREATE INDEX idx_employee_org_assignments_division_id ON public.employee_org_assignments(division_id);
CREATE INDEX idx_employee_org_assignments_department_id ON public.employee_org_assignments(department_id);
CREATE INDEX idx_employee_org_assignments_location_id ON public.employee_org_assignments(location_id);

-- Enable RLS
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_org_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for divisions
CREATE POLICY "Company admins can manage divisions" ON public.divisions
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- RLS Policies for departments
CREATE POLICY "Company admins can manage departments" ON public.departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.divisions d 
            WHERE d.id = departments.division_id AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, d.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role)
            )
        )
    );

-- RLS Policies for locations
CREATE POLICY "Company admins can manage locations" ON public.locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.departments dept
            JOIN public.divisions d ON dept.division_id = d.id
            WHERE dept.id = locations.department_id AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, d.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role)
            )
        )
    );

-- RLS Policies for employee org assignments
CREATE POLICY "Company admins can manage employee org assignments" ON public.employee_org_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.divisions d 
            WHERE d.id = employee_org_assignments.division_id AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, d.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role)
            )
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_divisions_updated_at
    BEFORE UPDATE ON public.divisions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_org_assignments_updated_at
    BEFORE UPDATE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit function for org structure changes
CREATE OR REPLACE FUNCTION public.log_org_structure_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_audit_log (
        user_id,
        action_type,
        resource_type,
        resource_id,
        action_details,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        CASE TG_OP
            WHEN 'INSERT' THEN 'created'
            WHEN 'UPDATE' THEN 'updated'
            WHEN 'DELETE' THEN 'deleted'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'timestamp', now()
        ),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_divisions_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.divisions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();

CREATE TRIGGER audit_departments_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.departments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();

CREATE TRIGGER audit_locations_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();

CREATE TRIGGER audit_employee_org_assignments_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();