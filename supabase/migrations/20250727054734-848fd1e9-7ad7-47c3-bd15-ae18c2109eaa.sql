-- Create missing RLS policies with correct column names

DO $$
BEGIN
    -- Add policies for crm_tasks with correct column name
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_tasks' 
        AND policyname = 'Users can view tasks they created or are assigned to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view tasks they created or are assigned to" 
        ON public.crm_tasks 
        FOR SELECT 
        USING (created_by = auth.uid() OR assigned_user_id = auth.uid() OR has_role(auth.uid(), ''super_admin''::app_role))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_tasks' 
        AND policyname = 'Users can insert tasks'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert tasks" 
        ON public.crm_tasks 
        FOR INSERT 
        WITH CHECK (created_by = auth.uid() OR has_role(auth.uid(), ''super_admin''::app_role))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_tasks' 
        AND policyname = 'Users can update tasks they created or are assigned to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update tasks they created or are assigned to" 
        ON public.crm_tasks 
        FOR UPDATE 
        USING (created_by = auth.uid() OR assigned_user_id = auth.uid() OR has_role(auth.uid(), ''super_admin''::app_role))
        WITH CHECK (created_by = auth.uid() OR assigned_user_id = auth.uid() OR has_role(auth.uid(), ''super_admin''::app_role))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_tasks' 
        AND policyname = 'Users can delete tasks they created'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can delete tasks they created" 
        ON public.crm_tasks 
        FOR DELETE 
        USING (created_by = auth.uid() OR has_role(auth.uid(), ''super_admin''::app_role))';
    END IF;

    -- Add missing policies for other tables
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_spin_contents' 
        AND policyname = 'Users can view SPIN contents from opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view SPIN contents from opportunities they have access to" 
        ON public.crm_spin_contents 
        FOR SELECT 
        USING (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_spin_contents.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_spin_contents' 
        AND policyname = 'Users can insert SPIN contents for opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert SPIN contents for opportunities they have access to" 
        ON public.crm_spin_contents 
        FOR INSERT 
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_spin_contents.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_spin_contents' 
        AND policyname = 'Users can update SPIN contents for opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update SPIN contents for opportunities they have access to" 
        ON public.crm_spin_contents 
        FOR UPDATE 
        USING (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_spin_contents.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_spin_contents.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_spin_contents' 
        AND policyname = 'Users can delete SPIN contents for opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can delete SPIN contents for opportunities they have access to" 
        ON public.crm_spin_contents 
        FOR DELETE 
        USING (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_spin_contents.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    -- Add policies for crm_risk_assessments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_risk_assessments' 
        AND policyname = 'Users can view risk assessments from companies they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view risk assessments from companies they have access to" 
        ON public.crm_risk_assessments 
        FOR SELECT 
        USING (has_crm_access(auth.uid(), company_id))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_risk_assessments' 
        AND policyname = 'Users can insert risk assessments for companies they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert risk assessments for companies they have access to" 
        ON public.crm_risk_assessments 
        FOR INSERT 
        WITH CHECK (has_crm_access(auth.uid(), company_id))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_risk_assessments' 
        AND policyname = 'Users can update risk assessments for companies they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update risk assessments for companies they have access to" 
        ON public.crm_risk_assessments 
        FOR UPDATE 
        USING (has_crm_access(auth.uid(), company_id))
        WITH CHECK (has_crm_access(auth.uid(), company_id))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_risk_assessments' 
        AND policyname = 'Users can delete risk assessments for companies they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can delete risk assessments for companies they have access to" 
        ON public.crm_risk_assessments 
        FOR DELETE 
        USING (has_crm_access(auth.uid(), company_id))';
    END IF;

    -- Add policies for crm_proposals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_proposals' 
        AND policyname = 'Users can view proposals from opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view proposals from opportunities they have access to" 
        ON public.crm_proposals 
        FOR SELECT 
        USING (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_proposals.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_proposals' 
        AND policyname = 'Users can insert proposals for opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert proposals for opportunities they have access to" 
        ON public.crm_proposals 
        FOR INSERT 
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_proposals.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_proposals' 
        AND policyname = 'Users can update proposals for opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update proposals for opportunities they have access to" 
        ON public.crm_proposals 
        FOR UPDATE 
        USING (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_proposals.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_proposals.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_proposals' 
        AND policyname = 'Users can delete proposals for opportunities they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can delete proposals for opportunities they have access to" 
        ON public.crm_proposals 
        FOR DELETE 
        USING (EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_proposals.opportunity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        ))';
    END IF;

    -- Add policies for crm_automation_rules
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_automation_rules' 
        AND policyname = 'Company admins can manage automation rules'
    ) THEN
        EXECUTE 'CREATE POLICY "Company admins can manage automation rules" 
        ON public.crm_automation_rules 
        FOR ALL 
        USING (has_role(auth.uid(), ''company_admin''::app_role) OR has_role(auth.uid(), ''super_admin''::app_role))
        WITH CHECK (has_role(auth.uid(), ''company_admin''::app_role) OR has_role(auth.uid(), ''super_admin''::app_role))';
    END IF;

    -- Add policies for crm_activity_log
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_activity_log' 
        AND policyname = 'Users can view activity logs for companies they have access to'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view activity logs for companies they have access to" 
        ON public.crm_activity_log 
        FOR SELECT 
        USING (
            CASE 
                WHEN entity_type = ''crm_companies'' THEN has_crm_access(auth.uid(), entity_id)
                WHEN entity_type = ''crm_contacts'' THEN EXISTS (
                    SELECT 1 FROM public.crm_contacts c 
                    WHERE c.id = crm_activity_log.entity_id 
                    AND has_crm_access(auth.uid(), c.company_id)
                )
                WHEN entity_type = ''crm_opportunities'' THEN EXISTS (
                    SELECT 1 FROM public.crm_opportunities o 
                    WHERE o.id = crm_activity_log.entity_id 
                    AND has_crm_access(auth.uid(), o.company_id)
                )
                ELSE performed_by = auth.uid() OR has_role(auth.uid(), ''super_admin''::app_role)
            END
        )';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'crm_activity_log' 
        AND policyname = 'System can insert activity logs'
    ) THEN
        EXECUTE 'CREATE POLICY "System can insert activity logs" 
        ON public.crm_activity_log 
        FOR INSERT 
        WITH CHECK (true)';
    END IF;
END $$;