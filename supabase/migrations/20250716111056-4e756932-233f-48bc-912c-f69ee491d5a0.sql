-- Add workers_comp_classifications column to investment_analysis table
ALTER TABLE public.investment_analysis 
ADD COLUMN workers_comp_classifications JSONB DEFAULT '[]'::JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.investment_analysis.workers_comp_classifications IS 'Array of workers comp classification objects with code_id, employer_rate, easeworks_rate, employee_count, gross_wages, and calculated premiums';