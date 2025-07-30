-- Add missing columns to hroiq_onboarding_packets table
ALTER TABLE public.hroiq_onboarding_packets 
ADD COLUMN IF NOT EXISTS custom_checklist TEXT[],
ADD COLUMN IF NOT EXISTS notification_emails TEXT[];

-- Add comment for clarity
COMMENT ON COLUMN public.hroiq_onboarding_packets.custom_checklist IS 'Custom checklist items for this onboarding packet';
COMMENT ON COLUMN public.hroiq_onboarding_packets.notification_emails IS 'Additional emails to notify about onboarding progress';