-- Make original_deal_owner nullable since these are existing clients not from deals
ALTER TABLE public.clients ALTER COLUMN original_deal_owner DROP NOT NULL;