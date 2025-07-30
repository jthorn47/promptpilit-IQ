-- Update existing data and remove staffing references

-- First update any existing records that use 'staffing' board_type to 'internal_hr'
UPDATE public.ats_job_postings 
SET board_type = 'internal_hr' 
WHERE board_type = 'staffing';

-- Remove staffing_position_id column since staffing module is removed
ALTER TABLE public.ats_job_postings DROP COLUMN IF EXISTS staffing_position_id;