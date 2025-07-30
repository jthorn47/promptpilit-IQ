-- PHASE 1: COMPLETE DATA WIPE FOR FRESH HUBSPOT IMPORT
-- Wipe all CRM-related data for clean slate

-- Delete all CRM data in proper order (respecting foreign keys)
DELETE FROM activities;
DELETE FROM deals;
DELETE FROM leads;
DELETE FROM company_contacts;
DELETE FROM company_locations;
DELETE FROM clients;
DELETE FROM company_settings;

-- Clear related audit logs for clean start
DELETE FROM audit_logs WHERE resource_type IN ('company', 'contact', 'deal', 'activity', 'lead', 'client');

-- Add helpful function for HubSpot import domain extraction
CREATE OR REPLACE FUNCTION public.extract_domain_from_email(email_address text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF email_address IS NULL OR email_address = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract domain part after @
  RETURN lower(split_part(email_address, '@', 2));
END;
$$;