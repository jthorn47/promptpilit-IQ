-- Migration: Fix contact data structure and link contacts to companies
-- Move contacts from leads table to company_contacts table with proper company linkage

-- Step 1: Create a temporary table to store the mapping between company names and IDs
CREATE TEMP TABLE company_name_mapping AS
SELECT 
    id as company_id,
    company_name,
    LOWER(TRIM(company_name)) as normalized_name
FROM company_settings
WHERE company_name IS NOT NULL AND company_name != '';

-- Step 2: Insert contacts from leads table into company_contacts table
-- This will link contacts to companies based on company name matching
INSERT INTO company_contacts (
    company_id,
    first_name,
    last_name,
    email,
    phone,
    job_title,
    department,
    contact_type,
    status,
    notes,
    created_at,
    updated_at,
    metadata
)
SELECT 
    cnm.company_id,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    l.job_title,
    l.department,
    CASE 
        WHEN l.lead_status IN ('qualified', 'unqualified', 'new', 'working', 'nurturing') THEN 'lead'
        ELSE 'contact'
    END as contact_type,
    COALESCE(l.status, 'active') as status,
    l.notes,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
        'source', 'hubspot_migration',
        'original_lead_id', l.id,
        'hubspot_contact_id', l.metadata->>'hubspot_contact_id',
        'associated_company', l.company_name,
        'lead_source', l.source,
        'lifecycle_stage', l.metadata->>'lifecycle_stage'
    ) as metadata
FROM leads l
LEFT JOIN company_name_mapping cnm ON LOWER(TRIM(l.company_name)) = cnm.normalized_name
WHERE l.company_name IS NOT NULL 
    AND l.company_name != ''
    AND l.email IS NOT NULL
    AND l.email != '';

-- Step 3: Handle contacts without company matches - create placeholder companies
INSERT INTO company_settings (
    company_name,
    created_at,
    updated_at,
    notes
)
SELECT DISTINCT
    l.company_name,
    now(),
    now(),
    'Auto-created during contact migration from HubSpot data'
FROM leads l
LEFT JOIN company_name_mapping cnm ON LOWER(TRIM(l.company_name)) = cnm.normalized_name
WHERE l.company_name IS NOT NULL 
    AND l.company_name != ''
    AND cnm.company_id IS NULL
    AND l.email IS NOT NULL
    AND l.email != ''
ON CONFLICT (company_name) DO NOTHING;

-- Step 4: Insert remaining contacts with newly created companies
INSERT INTO company_contacts (
    company_id,
    first_name,
    last_name,
    email,
    phone,
    job_title,
    department,
    contact_type,
    status,
    notes,
    created_at,
    updated_at,
    metadata
)
SELECT 
    cs.id as company_id,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    l.job_title,
    l.department,
    CASE 
        WHEN l.lead_status IN ('qualified', 'unqualified', 'new', 'working', 'nurturing') THEN 'lead'
        ELSE 'contact'
    END as contact_type,
    COALESCE(l.status, 'active') as status,
    l.notes,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
        'source', 'hubspot_migration',
        'original_lead_id', l.id,
        'hubspot_contact_id', l.metadata->>'hubspot_contact_id',
        'associated_company', l.company_name,
        'lead_source', l.source,
        'lifecycle_stage', l.metadata->>'lifecycle_stage'
    ) as metadata
FROM leads l
JOIN company_settings cs ON LOWER(TRIM(l.company_name)) = LOWER(TRIM(cs.company_name))
LEFT JOIN company_contacts cc ON cc.email = l.email AND cc.company_id = cs.id
WHERE l.company_name IS NOT NULL 
    AND l.company_name != ''
    AND l.email IS NOT NULL
    AND l.email != ''
    AND cc.id IS NULL -- Avoid duplicates
    AND NOT EXISTS (
        SELECT 1 FROM company_contacts cc2 
        JOIN company_name_mapping cnm2 ON cc2.company_id = cnm2.company_id
        WHERE cc2.email = l.email AND cnm2.normalized_name = LOWER(TRIM(l.company_name))
    );

-- Step 5: Clean up leads table - keep only actual sales leads
-- Create a backup table first
CREATE TABLE leads_backup AS SELECT * FROM leads;

-- Delete contacts that were successfully migrated to company_contacts
DELETE FROM leads 
WHERE id IN (
    SELECT l.id 
    FROM leads l
    JOIN company_contacts cc ON l.email = cc.email
    WHERE cc.metadata->>'original_lead_id' = l.id::text
);

-- Step 6: Update remaining leads to ensure they are actual leads
UPDATE leads 
SET 
    lead_status = COALESCE(lead_status, 'new'),
    status = COALESCE(status, 'active'),
    updated_at = now()
WHERE lead_status IS NULL OR lead_status = '';

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_contacts_company_id ON company_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_email ON company_contacts(email);
CREATE INDEX IF NOT EXISTS idx_company_contacts_contact_type ON company_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_company_contacts_metadata_hubspot ON company_contacts USING gin(metadata) WHERE metadata ? 'hubspot_contact_id';

-- Step 8: Add constraints to prevent future data integrity issues
ALTER TABLE company_contacts 
ADD CONSTRAINT unique_email_per_company UNIQUE (company_id, email) DEFERRABLE INITIALLY DEFERRED;