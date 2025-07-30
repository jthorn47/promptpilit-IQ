-- RLS Policies for ATS Tables

-- RLS Policies for Job Postings
CREATE POLICY "Companies can manage their job postings" ON public.ats_job_postings
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role) OR
        hiring_manager_id = auth.uid()
    );

CREATE POLICY "Public job postings are viewable by all" ON public.ats_job_postings
    FOR SELECT USING (visibility = 'public' AND status = 'open');

CREATE POLICY "Internal job postings viewable by company employees" ON public.ats_job_postings
    FOR SELECT USING (
        visibility = 'internal' AND status = 'open' AND
        company_id = get_user_company_id(auth.uid())
    );

-- RLS Policies for Applications
CREATE POLICY "Company admins can view applications" ON public.ats_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_job_postings jp 
            WHERE jp.id = ats_applications.job_posting_id 
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid()
            )
        )
    );

CREATE POLICY "Anyone can create applications" ON public.ats_applications
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Activities
CREATE POLICY "Company users can view application activities" ON public.ats_application_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_applications a
            JOIN public.ats_job_postings jp ON a.job_posting_id = jp.id
            WHERE a.id = ats_application_activities.application_id
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid()
            )
        )
    );

-- RLS Policies for Interviews
CREATE POLICY "Company users can manage interviews" ON public.ats_interviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_applications a
            JOIN public.ats_job_postings jp ON a.job_posting_id = jp.id
            WHERE a.id = ats_interviews.application_id
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid() OR
                interviewer_id = auth.uid()
            )
        )
    );

-- RLS Policies for Evaluations
CREATE POLICY "Company users can manage evaluations" ON public.ats_evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_applications a
            JOIN public.ats_job_postings jp ON a.job_posting_id = jp.id
            WHERE a.id = ats_evaluations.application_id
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid() OR
                evaluator_id = auth.uid()
            )
        )
    );

-- RLS Policies for Career Page Settings
CREATE POLICY "Companies can manage their career page" ON public.ats_career_page_settings
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- RLS Policies for Application Forms
CREATE POLICY "Companies can manage their application forms" ON public.ats_application_forms
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- Triggers for updated_at timestamps
CREATE TRIGGER update_ats_job_postings_updated_at
    BEFORE UPDATE ON public.ats_job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_applications_updated_at
    BEFORE UPDATE ON public.ats_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_interviews_updated_at
    BEFORE UPDATE ON public.ats_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_evaluations_updated_at
    BEFORE UPDATE ON public.ats_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_career_page_settings_updated_at
    BEFORE UPDATE ON public.ats_career_page_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_application_forms_updated_at
    BEFORE UPDATE ON public.ats_application_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create activity when application stage changes
CREATE OR REPLACE FUNCTION log_application_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if stage actually changed
    IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
        INSERT INTO public.ats_application_activities (
            application_id,
            user_id,
            activity_type,
            description,
            old_stage,
            new_stage
        ) VALUES (
            NEW.id,
            auth.uid(),
            'stage_change',
            'Application stage changed from ' || COALESCE(OLD.current_stage::text, 'none') || ' to ' || NEW.current_stage::text,
            OLD.current_stage,
            NEW.current_stage
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ats_application_stage_change_trigger
    AFTER UPDATE ON public.ats_applications
    FOR EACH ROW EXECUTE FUNCTION log_application_stage_change();

-- Function to generate career page embed code
CREATE OR REPLACE FUNCTION generate_career_page_embed_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.embed_code := '<iframe src="https://your-domain.com/careers/' || NEW.company_id || '" width="100%" height="600" frameborder="0" style="border: none;"></iframe>';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_embed_code_trigger
    BEFORE INSERT OR UPDATE ON public.ats_career_page_settings
    FOR EACH ROW EXECUTE FUNCTION generate_career_page_embed_code();