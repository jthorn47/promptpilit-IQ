-- Phase 1: Database Schema for Workflow Engine
-- Remove existing automation data to start fresh
DELETE FROM automation_executions;
DELETE FROM automation_workflows;

-- Enhanced automation_workflows table for workflow definitions
ALTER TABLE automation_workflows 
  DROP COLUMN trigger_conditions,
  DROP COLUMN actions,
  ADD COLUMN workflow_id TEXT UNIQUE,
  ADD COLUMN trigger_value TEXT,
  ADD COLUMN steps JSONB DEFAULT '[]'::jsonb;

-- Enhanced automation_executions table for execution tracking  
ALTER TABLE automation_executions 
  ADD COLUMN current_step INTEGER DEFAULT 0,
  ADD COLUMN step_results JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN scheduled_for TIMESTAMPTZ,
  ADD COLUMN context_data JSONB DEFAULT '{}'::jsonb;

-- Create workflow_steps table for detailed step tracking
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES automation_executions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  params JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on workflow_steps
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_steps
CREATE POLICY "Easeworks users can manage workflow steps" ON workflow_steps
  FOR ALL USING (
    has_crm_role(auth.uid(), 'internal_staff'::app_role) OR 
    has_crm_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create indexes for performance
CREATE INDEX idx_workflow_steps_execution_id ON workflow_steps(execution_id);
CREATE INDEX idx_workflow_steps_status ON workflow_steps(status);
CREATE INDEX idx_automation_executions_scheduled_for ON automation_executions(scheduled_for);
CREATE INDEX idx_automation_workflows_workflow_id ON automation_workflows(workflow_id);
CREATE INDEX idx_automation_workflows_trigger ON automation_workflows(trigger_type, trigger_value);

-- Update trigger for updated_at on workflow_steps
CREATE TRIGGER update_workflow_steps_updated_at
  BEFORE UPDATE ON workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create the initial SB553 workflow
INSERT INTO automation_workflows (
  workflow_id,
  name,
  description,
  trigger_type,
  trigger_value,
  is_active,
  steps,
  created_by
) VALUES (
  'sb553-purchase',
  'SB553 Plan Purchase Workflow',
  'Automated workflow for SB553 plan purchases including confirmation emails, product assignment, and plan generation',
  'purchase',
  'SB553-PLAN',
  true,
  '[
    {
      "action": "send_email",
      "params": {
        "template": "purchase_confirmation",
        "to": "buyer"
      }
    },
    {
      "action": "assign_product",
      "params": {
        "sku": "SB553-PLAN"
      }
    },
    {
      "action": "generate_plan",
      "params": {
        "plan_type": "WVPP"
      }
    },
    {
      "action": "delay",
      "params": {
        "minutes": 60
      }
    },
    {
      "action": "send_email",
      "params": {
        "template": "admin_setup_guide",
        "to": "buyer"
      }
    },
    {
      "action": "internal_notify",
      "params": {
        "type": "email",
        "message": "🟣 New SB 553 Plan purchased by {{company_name}}"
      }
    }
  ]'::jsonb,
  (SELECT id FROM auth.users WHERE email LIKE '%@easeworks.com' LIMIT 1)
);