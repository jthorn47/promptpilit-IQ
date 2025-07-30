-- Update system settings to use uploaded EaseLEARN logo
UPDATE system_settings 
SET value = '"/lovable-uploads/805873c9-56ad-4a22-9220-a36242da5bd1.png"'
WHERE key = 'easelearn_logo_url';