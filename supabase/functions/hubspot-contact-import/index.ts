import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface HubSpotContact {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  // Add other fields as needed
}

interface ImportRequestPayload {
  contacts: HubSpotContact[];
  source: string;
  importedBy: string;
}

async function processContacts(payload: ImportRequestPayload) {
  const { contacts, source, importedBy } = payload;
  
  // Get the map of company names to IDs from company_settings
  const { data: companies, error: companyError } = await supabase
    .from('company_settings')
    .select('id, company_name')
    .order('created_at', { ascending: false });
  
  if (companyError) {
    console.error('Error fetching companies:', companyError);
    return { error: 'Failed to fetch companies', details: companyError };
  }
  
  // Create a map of lowercase company names to company IDs for case-insensitive matching
  const companyMap = new Map();
  companies?.forEach(company => {
    if (company.company_name) {
      companyMap.set(company.company_name.toLowerCase(), company.id);
    }
  });
  
  const contactsToInsert = [];
  const leadsToInsert = [];
  
  // Process each contact
  for (const contact of contacts) {
    // Skip contacts without email
    if (!contact.email) continue;
    
    // Determine if this should be a contact or a lead
    if (contact.company) {
      const companyId = companyMap.get(contact.company.toLowerCase());
      
      if (companyId) {
        // This is a company contact
        contactsToInsert.push({
          first_name: contact.first_name || '',
          last_name: contact.last_name || '',
          email: contact.email,
          phone: contact.phone || '',
          job_title: contact.job_title || '',
          company_id: companyId,
          is_primary: false, // Default to not primary
          status: 'active',
          notes: 'Imported from HubSpot',
          created_by: importedBy
        });
        continue;
      }
    }
    
    // If no company match or no company, add as a lead
    leadsToInsert.push({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email,
      phone: contact.phone || '',
      title: contact.job_title || '',
      company_name: contact.company || '',
      status: 'new',
      source: source || 'hubspot_import',
      created_by: importedBy,
      notes: 'Imported from HubSpot'
    });
  }
  
  // Insert company contacts
  let contactsInserted = 0;
  if (contactsToInsert.length > 0) {
    // Insert in chunks to avoid payload size limits
    const chunkSize = 100;
    for (let i = 0; i < contactsToInsert.length; i += chunkSize) {
      const chunk = contactsToInsert.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('company_contacts')
        .upsert(chunk, { 
          onConflict: 'email',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error('Error inserting contacts chunk:', error);
      } else {
        contactsInserted += chunk.length;
      }
    }
  }
  
  // Insert leads
  let leadsInserted = 0;
  if (leadsToInsert.length > 0) {
    // Insert in chunks to avoid payload size limits
    const chunkSize = 100;
    for (let i = 0; i < leadsToInsert.length; i += chunkSize) {
      const chunk = leadsToInsert.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('leads')
        .upsert(chunk, { 
          onConflict: 'email',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error('Error inserting leads chunk:', error);
      } else {
        leadsInserted += chunk.length;
      }
    }
  }
  
  // Log the import statistics
  const { data: logData, error: logError } = await supabase
    .from('migration_logs')
    .insert({
      migration_name: 'hubspot_contact_import',
      affected_tables: ['company_contacts', 'leads'],
      rows_affected: {
        contacts_inserted: contactsInserted,
        leads_inserted: leadsInserted,
        total_processed: contacts.length
      },
      notes: `HubSpot import processed ${contacts.length} records, resulting in ${contactsInserted} contacts and ${leadsInserted} leads`
    });
  
  if (logError) {
    console.error('Error logging import statistics:', logError);
  }
  
  return {
    success: true,
    stats: {
      total_processed: contacts.length,
      contacts_inserted: contactsInserted,
      leads_inserted: leadsInserted
    }
  };
}

serve(async (req) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    // Parse request body
    const payload = await req.json() as ImportRequestPayload;
    
    if (!payload.contacts || !Array.isArray(payload.contacts)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: contacts array is required' }),
        { status: 400, headers }
      );
    }

    const result = await processContacts(payload);
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process contacts', details: error.message }),
      { status: 500, headers }
    );
  }
});