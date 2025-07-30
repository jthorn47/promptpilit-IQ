-- Add benefits_analysis field to propgen_workflows table
ALTER TABLE public.propgen_workflows
ADD COLUMN benefits_analysis JSONB;