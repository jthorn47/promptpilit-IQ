-- Fix enum drop with cascade and update data

-- First update any existing records that use 'staffing' board_type to 'internal_hr'
UPDATE public.ats_job_postings 
SET board_type = 'internal_hr' 
WHERE board_type = 'staffing';

-- Drop the existing enum with cascade and recreate without 'staffing'
DROP TYPE IF EXISTS public.job_board_type CASCADE;
CREATE TYPE public.job_board_type AS ENUM ('internal_hr', 'both');

-- Now update the column to use the new enum
ALTER TABLE public.ats_job_postings 
ALTER COLUMN board_type TYPE public.job_board_type 
USING board_type::public.job_board_type;

-- Remove staffing_position_id column since staffing module is removed
ALTER TABLE public.ats_job_postings DROP COLUMN IF EXISTS staffing_position_id;