-- Add welcome_screen_config column to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN welcome_screen_config JSONB DEFAULT NULL;

-- Update existing records to have default welcome screen configuration
UPDATE public.company_settings 
SET welcome_screen_config = '{
  "enabled": true,
  "title": "Welcome to Your Training",
  "subtitle": "Essential Workplace Knowledge", 
  "welcomeMessage": "Thank you for taking the time to complete this important training. This module will provide you with essential knowledge and skills to ensure a safe and compliant workplace.",
  "showCompanyLogo": true,
  "showDuration": true,
  "autoAdvance": true,
  "displayDuration": 8,
  "backgroundColor": "#ffffff",
  "textColor": "#1a1a1a",
  "template": "professional"
}'::jsonb
WHERE welcome_screen_config IS NULL;