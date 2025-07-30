-- Update the client_sbw9237_modules table to copy the logo from client_onboarding_profiles
UPDATE client_sbw9237_modules 
SET intro_company_logo_url = cop.company_logo_url,
    updated_at = now()
FROM client_onboarding_profiles cop
WHERE client_sbw9237_modules.client_id = cop.client_id
AND cop.company_logo_url IS NOT NULL
AND client_sbw9237_modules.intro_company_logo_url IS NULL;