-- Add PropGEN manual toggle fields to propgen_workflows table
ALTER TABLE public.propgen_workflows 
ADD COLUMN IF NOT EXISTS hr_risk_assessment_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proposal_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS spin_content_completed BOOLEAN DEFAULT FALSE;