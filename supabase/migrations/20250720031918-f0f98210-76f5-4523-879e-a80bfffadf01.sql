-- Add missing columns to pay_groups table
ALTER TABLE public.pay_groups ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.pay_groups ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Update existing pay groups to have a created_by value (set to current user if available)
UPDATE public.pay_groups 
SET created_by = (SELECT id FROM auth.users LIMIT 1)
WHERE created_by IS NULL;