-- Enhance tasks table with auto-generation capabilities
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trigger_reason TEXT,
ADD COLUMN IF NOT EXISTS sarah_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_generation_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS workflow_rule_id UUID,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS risk_score INTEGER;

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view their assigned tasks or company tasks" ON public.tasks
FOR SELECT USING (
  assigned_to = auth.uid() OR 
  created_by = auth.uid() OR
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM company_settings cs 
    WHERE cs.id = tasks.company_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  ))
);

CREATE POLICY "Users can create tasks" ON public.tasks
FOR INSERT WITH CHECK (
  assigned_to = auth.uid() OR 
  created_by = auth.uid() OR
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM company_settings cs 
    WHERE cs.id = tasks.company_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  ))
);

CREATE POLICY "Users can update their tasks or company tasks" ON public.tasks
FOR UPDATE USING (
  assigned_to = auth.uid() OR 
  created_by = auth.uid() OR
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM company_settings cs 
    WHERE cs.id = tasks.company_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  ))
);

CREATE POLICY "Users can delete their tasks or company tasks" ON public.tasks
FOR DELETE USING (
  assigned_to = auth.uid() OR 
  created_by = auth.uid() OR
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM company_settings cs 
    WHERE cs.id = tasks.company_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  ))
);

-- Create auto-task generation function
CREATE OR REPLACE FUNCTION public.generate_auto_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deal_record RECORD;
  company_record RECORD;
  task_id UUID;
BEGIN
  -- Generate follow-up tasks for deals with no activity in 5+ days
  FOR deal_record IN 
    SELECT d.*, cs.company_name, d.contact_name, d.contact_email, d.assigned_to
    FROM deals d
    JOIN company_settings cs ON d.company_id = cs.id
    WHERE d.status = 'open'
    AND (d.last_activity_date IS NULL OR d.last_activity_date < NOW() - INTERVAL '5 days')
    AND NOT EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.deal_id = d.id 
      AND t.is_auto_generated = true 
      AND t.trigger_reason = 'No activity in 5+ days'
      AND t.created_at > NOW() - INTERVAL '7 days'
    )
  LOOP
    INSERT INTO public.tasks (
      title, description, type, priority, status, assigned_to, created_by,
      deal_id, company_id, contact_name, contact_email, due_date,
      is_auto_generated, trigger_reason, sarah_generated, auto_generation_metadata
    ) VALUES (
      'Follow-up: ' || deal_record.title,
      'This deal has had no activity for 5+ days. Reach out to maintain momentum and check on status.',
      'follow_up',
      'medium',
      'pending',
      deal_record.assigned_to,
      deal_record.assigned_to,
      deal_record.id,
      deal_record.company_id,
      deal_record.contact_name,
      deal_record.contact_email,
      NOW() + INTERVAL '1 day',
      true,
      'No activity in 5+ days',
      true,
      jsonb_build_object(
        'days_since_activity', EXTRACT(days FROM NOW() - COALESCE(deal_record.last_activity_date, deal_record.created_at)),
        'deal_value', deal_record.value,
        'auto_generated_at', NOW()
      )
    );
  END LOOP;

  -- Generate risk assessment tasks for high-risk deals
  FOR deal_record IN 
    SELECT d.*, cs.company_name, d.contact_name, d.contact_email, d.assigned_to
    FROM deals d
    JOIN company_settings cs ON d.company_id = cs.id
    WHERE d.status = 'open'
    AND COALESCE(d.probability, 50) < 30
    AND NOT EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.deal_id = d.id 
      AND t.is_auto_generated = true 
      AND t.trigger_reason = 'High risk score detected'
      AND t.created_at > NOW() - INTERVAL '7 days'
    )
  LOOP
    INSERT INTO public.tasks (
      title, description, type, priority, status, assigned_to, created_by,
      deal_id, company_id, contact_name, contact_email, due_date,
      is_auto_generated, trigger_reason, sarah_generated, auto_generation_metadata,
      risk_score
    ) VALUES (
      'Risk Assessment: ' || deal_record.title,
      'Deal probability is below 30%. Consider scheduling consultation or adjusting strategy.',
      'assessment',
      'high',
      'pending',
      deal_record.assigned_to,
      deal_record.assigned_to,
      deal_record.id,
      deal_record.company_id,
      deal_record.contact_name,
      deal_record.contact_email,
      NOW() + INTERVAL '1 day',
      true,
      'High risk score detected',
      true,
      jsonb_build_object(
        'probability', deal_record.probability,
        'deal_value', deal_record.value,
        'auto_generated_at', NOW()
      ),
      100 - COALESCE(deal_record.probability, 50)
    );
  END LOOP;

  -- Generate proposal follow-up tasks (simulated - would need proposal tracking)
  FOR deal_record IN 
    SELECT d.*, cs.company_name, d.contact_name, d.contact_email, d.assigned_to
    FROM deals d
    JOIN company_settings cs ON d.company_id = cs.id
    WHERE d.status = 'open'
    AND d.stage_id IN (SELECT id FROM sales_stages WHERE name ILIKE '%proposal%')
    AND NOT EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.deal_id = d.id 
      AND t.is_auto_generated = true 
      AND t.trigger_reason = 'Proposal follow-up needed'
      AND t.created_at > NOW() - INTERVAL '3 days'
    )
  LOOP
    INSERT INTO public.tasks (
      title, description, type, priority, status, assigned_to, created_by,
      deal_id, company_id, contact_name, contact_email, due_date,
      is_auto_generated, trigger_reason, sarah_generated, auto_generation_metadata
    ) VALUES (
      'Proposal Follow-up: ' || deal_record.title,
      'Follow up on proposal to check status, answer questions, and move toward decision.',
      'follow_up',
      'high',
      'pending',
      deal_record.assigned_to,
      deal_record.assigned_to,
      deal_record.id,
      deal_record.company_id,
      deal_record.contact_name,
      deal_record.contact_email,
      NOW() + INTERVAL '2 days',
      true,
      'Proposal follow-up needed',
      true,
      jsonb_build_object(
        'stage', 'proposal',
        'deal_value', deal_record.value,
        'auto_generated_at', NOW()
      )
    );
  END LOOP;
END;
$$;

-- Create function to update task status
CREATE OR REPLACE FUNCTION public.update_task_status(
  task_id UUID,
  new_status TEXT,
  completion_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_record RECORD;
BEGIN
  -- Get task details
  SELECT * INTO task_record FROM tasks WHERE id = task_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update task status
  UPDATE tasks
  SET 
    status = new_status,
    completed_at = CASE WHEN new_status = 'completed' THEN NOW() ELSE NULL END,
    updated_at = NOW(),
    notes = CASE WHEN completion_notes IS NOT NULL THEN 
      COALESCE(notes, '') || E'\n\n' || 'Completion: ' || completion_notes 
      ELSE notes END
  WHERE id = task_id;
  
  -- Log completion in activities if completed
  IF new_status = 'completed' THEN
    INSERT INTO activities (
      type, status, subject, description, assigned_to, created_by,
      company_id, lead_id, deal_id, contact_name, contact_email,
      completed_at
    ) VALUES (
      task_record.type,
      'completed',
      'Task Completed: ' || task_record.title,
      COALESCE(completion_notes, 'Task marked as completed'),
      task_record.assigned_to,
      auth.uid(),
      task_record.company_id,
      task_record.lead_id,
      task_record.deal_id,
      task_record.contact_name,
      task_record.contact_email,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create trigger to auto-generate tasks on deal updates
CREATE OR REPLACE FUNCTION public.trigger_auto_task_generation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_activity_date when deal is modified
  NEW.last_activity_date = NOW();
  
  -- Schedule auto-task generation for background processing
  PERFORM pg_notify('auto_task_generation', json_build_object(
    'deal_id', NEW.id,
    'company_id', NEW.company_id,
    'trigger', 'deal_updated'
  )::text);
  
  RETURN NEW;
END;
$$;

-- Add trigger to deals table
DROP TRIGGER IF EXISTS deals_auto_task_trigger ON deals;
CREATE TRIGGER deals_auto_task_trigger
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_task_generation();