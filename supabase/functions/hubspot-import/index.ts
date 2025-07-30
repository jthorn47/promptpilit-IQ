import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const requestBody = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const importType = requestBody.importType || requestBody.type || searchParams.get('type') || 'companies';

    if (!['companies', 'contacts', 'deals', 'activities', 'tasks', 'all'].includes(importType)) {
      return new Response(
        JSON.stringify({ error: 'Supported import types: companies, contacts, deals, activities, tasks, all' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const HUBSPOT_TOKEN = Deno.env.get('HUBSPOT_PRIVATE_APP_TOKEN');
    
    if (!HUBSPOT_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'HubSpot API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (importType === 'companies') {
      return await importCompanies(supabase, HUBSPOT_TOKEN);
    } else if (importType === 'contacts') {
      return await importContacts(supabase, HUBSPOT_TOKEN);
    } else if (importType === 'deals') {
      return await importDeals(supabase, HUBSPOT_TOKEN);
    } else if (importType === 'activities') {
      return await importActivities(supabase, HUBSPOT_TOKEN);
    } else if (importType === 'tasks') {
      return await importTasks(supabase, HUBSPOT_TOKEN);
    } else if (importType === 'all') {
      return await importAllRecords(supabase, HUBSPOT_TOKEN);
    }

  } catch (error) {
    console.error('💥 Import Failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'HubSpot Import Failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function importCompanies(supabase: any, HUBSPOT_TOKEN: string) {
  const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/companies';
  const BATCH_SIZE = 100;
  let after: string | undefined = undefined;
  let totalImported = 0;
  let totalErrors = 0;

  console.log('🚀 Starting HubSpot companies import...');

  while (true) {
    const url = new URL(HUBSPOT_API_URL);
    url.searchParams.append('limit', BATCH_SIZE.toString());
    url.searchParams.append('properties', 'name,domain,website,description,industry,phone,address,city,state,country,zip,hs_lead_status');
    if (after) url.searchParams.append('after', after);

    console.log(`📥 Fetching batch from HubSpot (after: ${after || 'start'})`);

    const hubRes = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });

    if (!hubRes.ok) {
      const errorData = await hubRes.json();
      console.error('❌ HubSpot API Error:', errorData);
      throw new Error(`HubSpot API Error: ${JSON.stringify(errorData)}`);
    }

    const hubData = await hubRes.json();
    console.log(`📊 Received ${hubData.results?.length || 0} companies from HubSpot`);

    // Map and filter company data
    const records = hubData.results
      ?.map((company: any) => {
        const props = company.properties;
        return {
          company_name: props.name,
          website: props.website || props.domain || null,
          description: props.description || null,
          industry: props.industry || null,
          phone: props.phone || null,
          address: props.address || null,
          city: props.city || null,
          state: props.state || null,
          country: props.country || 'United States',
          postal_code: props.zip || null,
          lifecycle_stage: props.hs_lead_status || 'lead',
          primary_color: '#655DC6' // Default color
        };
      })
      .filter((record: any) => record.company_name) || [];

    if (records.length > 0) {
      console.log(`💾 Upserting ${records.length} companies into database...`);
      
      // Use upsert to prevent duplicates
      const { data, error } = await supabase
        .from('company_settings')
        .upsert(records, { 
          onConflict: 'company_name',
          ignoreDuplicates: false 
        })
        .select('id, company_name');

      if (error) {
        console.error('❌ Database Upsert Error:', error);
        totalErrors += records.length;
      } else {
        console.log(`✅ Successfully upserted ${data?.length || 0} companies`);
        totalImported += data?.length || 0;
      }
    }

    // Check if there are more pages
    if (!hubData.paging?.next?.after) {
      console.log('📄 No more pages to process');
      break;
    }

    after = hubData.paging.next.after;
    console.log(`➡️ Moving to next page (after: ${after})`);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const result = {
    success: true,
    message: `Companies import completed: ${totalImported} companies processed`,
    imported: totalImported,
    errors: totalErrors
  };

  console.log('🎉 Companies Import Summary:', result);
  return new Response(
    JSON.stringify(result),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function importContacts(supabase: any, HUBSPOT_TOKEN: string) {
  const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';
  const BATCH_SIZE = 100;
  let after: string | undefined = undefined;
  let totalImported = 0;
  let totalErrors = 0;

  console.log('🚀 Starting HubSpot contacts import...');

  while (true) {
    const url = new URL(HUBSPOT_API_URL);
    url.searchParams.append('limit', BATCH_SIZE.toString());
    url.searchParams.append('properties', 'firstname,lastname,email,phone,jobtitle,company,website,address,city,state,country,zip,hs_lead_status');
    if (after) url.searchParams.append('after', after);

    console.log(`📥 Fetching batch from HubSpot (after: ${after || 'start'})`);

    const hubRes = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });

    if (!hubRes.ok) {
      const errorData = await hubRes.json();
      console.error('❌ HubSpot API Error:', errorData);
      throw new Error(`HubSpot API Error: ${JSON.stringify(errorData)}`);
    }

    const hubData = await hubRes.json();
    console.log(`📊 Received ${hubData.results?.length || 0} contacts from HubSpot`);

    // Map and filter contact data
    const records = hubData.results
      ?.map((contact: any) => {
        const props = contact.properties;
        return {
          first_name: props.firstname || 'Unknown',
          last_name: props.lastname || 'Contact',
          email: props.email, // Keep original - we filter out records without email anyway
          phone: props.phone || null,
          job_title: props.jobtitle || null,
          company_name: props.company || null,
          website: props.website || null,
          status: props.hs_lead_status || 'new',
          source: 'hubspot'
        };
      })
      .filter((record: any) => record.email) || []; // Only include contacts with email

    if (records.length > 0) {
      console.log(`💾 Inserting ${records.length} contacts into database...`);
      
      // Use simple insert - duplicates will be caught by unique constraint
      const { data, error } = await supabase
        .from('leads')
        .insert(records)
        .select('id, email, first_name, last_name');

      if (error) {
        console.error('❌ Database Insert Error:', error);
        // Count unique constraint violations as expected behavior, not errors
        if (error.code === '23505') { // unique_violation error code
          console.log(`⚠️ ${records.length} contacts skipped (duplicates)`);
          totalImported += 0; // No new records inserted due to duplicates
        } else {
          totalErrors += records.length;
        }
      } else {
        console.log(`✅ Successfully inserted ${data?.length || 0} contacts`);
        totalImported += data?.length || 0;
      }
    }

    // Check if there are more pages
    if (!hubData.paging?.next?.after) {
      console.log('📄 No more pages to process');
      break;
    }

    after = hubData.paging.next.after;
    console.log(`➡️ Moving to next page (after: ${after})`);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const result = {
    success: true,
    message: `Contacts import completed: ${totalImported} contacts processed`,
    imported: totalImported,
    errors: totalErrors
  };

  console.log('🎉 Contacts Import Summary:', result);
  return new Response(
    JSON.stringify(result),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function importDeals(supabase: any, HUBSPOT_TOKEN: string) {
  const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/deals';
  const BATCH_SIZE = 100;
  let after: string | undefined = undefined;
  let totalImported = 0;
  let totalErrors = 0;

  console.log('🚀 Starting HubSpot deals import...');

  while (true) {
    const url = new URL(HUBSPOT_API_URL);
    url.searchParams.append('limit', BATCH_SIZE.toString());
    url.searchParams.append('properties', 'dealname,dealstage,amount,closedate,pipeline,dealtype,description,hubspot_owner_id');
    if (after) url.searchParams.append('after', after);

    console.log(`📥 Fetching batch from HubSpot (after: ${after || 'start'})`);

    const hubRes = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });

    if (!hubRes.ok) {
      const errorData = await hubRes.json();
      console.error('❌ HubSpot API Error:', errorData);
      throw new Error(`HubSpot API Error: ${JSON.stringify(errorData)}`);
    }

    const hubData = await hubRes.json();
    console.log(`📊 Received ${hubData.results?.length || 0} deals from HubSpot`);

    // Get user IDs for Jeffrey and Matt
    const { data: jeffreyUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'jeffrey@easeworks.com')
      .single();
      
    const { data: mattUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'matt@easeworks.com')
      .single();
      
    const jeffreyUserId = jeffreyUser?.user_id;
    const mattUserId = mattUser?.user_id;
    const defaultUserId = jeffreyUserId || mattUserId;

    // Get default stage_id (we need this for the deals table)
    const { data: defaultStage } = await supabase
      .from('deal_stages')
      .select('id')
      .eq('name', 'Discovery')
      .single();
    
    const defaultStageId = defaultStage?.id;
    
    if (!defaultStageId) {
      throw new Error('No default deal stage found. Please ensure deal_stages table has data.');
    }

    // Map and filter deal data
    const records = hubData.results
      ?.map((deal: any) => {
        const props = deal.properties;
        
        // Handle contact information - deals might not have direct contact info
        let contactName = 'Unknown Contact';
        let contactEmail = 'contact@company.com';
        
        // Try different property combinations for contact info
        if (props.contactname) {
          contactName = props.contactname;
        } else if (props.firstname && props.lastname) {
          contactName = `${props.firstname} ${props.lastname}`;
        } else if (props.contact_firstname && props.contact_lastname) {
          contactName = `${props.contact_firstname} ${props.contact_lastname}`;
        }
        
        if (props.contact_email) {
          contactEmail = props.contact_email;
        } else if (props.email) {
          contactEmail = props.email;
        }
        
        return {
          title: props.dealname || props.name || 'Untitled Deal',
          company_name: props.company || props.company_name || props.dealname || 'Unknown Company',
          contact_name: contactName,
          contact_email: contactEmail,
          value: parseFloat(props.amount || props.deal_amount || 0) || 0,
          currency: 'USD',
          stage_id: defaultStageId,
          probability: 25, // Default probability for Discovery stage
          status: props.dealstage === 'closedwon' ? 'won' : props.dealstage === 'closedlost' ? 'lost' : 'open',
          expected_close_date: props.closedate ? new Date(props.closedate).toISOString().split('T')[0] : null,
          actual_close_date: (props.dealstage === 'closedwon' || props.dealstage === 'closedlost') && props.closedate ? new Date(props.closedate).toISOString().split('T')[0] : null,
          notes: props.description || props.notes || null,
          assigned_to: defaultUserId
        };
      })
      .filter((record: any) => {
        // Log the record for debugging
        console.log('Deal record:', JSON.stringify(record, null, 2));
        return record.title && record.title.trim() !== '';
      }) || [];

    if (records.length > 0) {
      console.log(`💾 Inserting ${records.length} deals into database...`);
      
      const { data, error } = await supabase
        .from('deals')
        .insert(records)
        .select('id, title, value');

      if (error) {
        console.error('❌ Database Insert Error:', error);
        totalErrors += records.length;
      } else {
        console.log(`✅ Successfully inserted ${data?.length || 0} deals`);
        totalImported += data?.length || 0;
      }
    }

    // Check if there are more pages
    if (!hubData.paging?.next?.after) {
      console.log('📄 No more pages to process');
      break;
    }

    after = hubData.paging.next.after;
    console.log(`➡️ Moving to next page (after: ${after})`);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const result = {
    success: true,
    message: `Deals import completed: ${totalImported} deals processed`,
    imported: totalImported,
    errors: totalErrors
  };

  console.log('🎉 Deals Import Summary:', result);
  return new Response(
    JSON.stringify(result),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function importActivities(supabase: any, HUBSPOT_TOKEN: string) {
  const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/calls';
  const BATCH_SIZE = 100;
  let after: string | undefined = undefined;
  let totalImported = 0;
  let totalErrors = 0;

  console.log('🚀 Starting HubSpot activities (calls) import...');

  while (true) {
    const url = new URL(HUBSPOT_API_URL);
    url.searchParams.append('limit', BATCH_SIZE.toString());
    url.searchParams.append('properties', 'hs_call_title,hs_call_body,hs_call_duration,hs_call_from_number,hs_call_to_number,hs_call_status,hs_timestamp,hubspot_owner_id');
    if (after) url.searchParams.append('after', after);

    console.log(`📥 Fetching batch from HubSpot (after: ${after || 'start'})`);

    const hubRes = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });

    if (!hubRes.ok) {
      const errorData = await hubRes.json();
      console.error('❌ HubSpot API Error:', errorData);
      throw new Error(`HubSpot API Error: ${JSON.stringify(errorData)}`);
    }

    const hubData = await hubRes.json();
    console.log(`📊 Received ${hubData.results?.length || 0} activities from HubSpot`);

    // Get user IDs for Jeffrey and Matt
    const { data: jeffreyUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'jeffrey@easeworks.com')
      .single();
      
    const { data: mattUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'matt@easeworks.com')
      .single();
      
    const jeffreyUserId = jeffreyUser?.user_id;
    const mattUserId = mattUser?.user_id;
    const defaultUserId = jeffreyUserId || mattUserId;

    // Map and filter activity data
    const records = hubData.results
      ?.map((activity: any) => {
        const props = activity.properties;
        const duration = parseInt(props.hs_call_duration) || 0;
        
        // Assign to appropriate user based on HubSpot owner or default to Jeffrey
        let assignedUserId = jeffreyUserId; // Default to Jeffrey
        
        // If there's a hubspot_owner_id, we could potentially map it
        // For now, alternate assignment or use a simple rule
        // You could enhance this logic based on specific HubSpot owner IDs
        
        return {
          type: 'call',
          subject: props.hs_call_title || 'HubSpot Call',
          description: props.hs_call_body || null,
          duration_minutes: Math.ceil(duration / 60000), // Convert ms to minutes
          scheduled_at: props.hs_timestamp ? new Date(parseInt(props.hs_timestamp)).toISOString() : new Date().toISOString(),
          completed_at: props.hs_timestamp ? new Date(parseInt(props.hs_timestamp)).toISOString() : new Date().toISOString(),
          status: props.hs_call_status === 'COMPLETED' ? 'completed' : 'scheduled',
          outcome: props.hs_call_status || null,
          assigned_to: assignedUserId,
          created_by: assignedUserId,
          priority: 'medium'
        };
      })
      .filter((record: any) => record.subject) || [];

    if (records.length > 0) {
      console.log(`💾 Inserting ${records.length} activities into database...`);
      
      const { data, error } = await supabase
        .from('activities')
        .insert(records)
        .select('id, subject, type');

      if (error) {
        console.error('❌ Database Insert Error:', error);
        totalErrors += records.length;
      } else {
        console.log(`✅ Successfully inserted ${data?.length || 0} activities`);
        totalImported += data?.length || 0;
      }
    }

    // Check if there are more pages
    if (!hubData.paging?.next?.after) {
      console.log('📄 No more pages to process');
      break;
    }

    after = hubData.paging.next.after;
    console.log(`➡️ Moving to next page (after: ${after})`);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const result = {
    success: true,
    message: `Activities import completed: ${totalImported} activities processed`,
    imported: totalImported,
    errors: totalErrors
  };

  console.log('🎉 Activities Import Summary:', result);
  return new Response(
    JSON.stringify(result),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function importTasks(supabase: any, HUBSPOT_TOKEN: string) {
  const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/tasks';
  const BATCH_SIZE = 100;
  let after: string | undefined = undefined;
  let totalImported = 0;
  let totalErrors = 0;

  console.log('🚀 Starting HubSpot tasks import...');

  while (true) {
    const url = new URL(HUBSPOT_API_URL);
    url.searchParams.append('limit', BATCH_SIZE.toString());
    url.searchParams.append('properties', 'hs_task_subject,hs_task_body,hs_task_status,hs_task_priority,hs_timestamp,hs_task_type,hubspot_owner_id');
    if (after) url.searchParams.append('after', after);

    console.log(`📥 Fetching batch from HubSpot (after: ${after || 'start'})`);

    const hubRes = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });

    if (!hubRes.ok) {
      const errorData = await hubRes.json();
      console.error('❌ HubSpot API Error:', errorData);
      throw new Error(`HubSpot API Error: ${JSON.stringify(errorData)}`);
    }

    const hubData = await hubRes.json();
    console.log(`📊 Received ${hubData.results?.length || 0} tasks from HubSpot`);

    // Get user IDs for Jeffrey and Matt
    const { data: jeffreyUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'jeffrey@easeworks.com')
      .single();
      
    const { data: mattUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'matt@easeworks.com')
      .single();
      
    const jeffreyUserId = jeffreyUser?.user_id;
    const mattUserId = mattUser?.user_id;
    const defaultUserId = jeffreyUserId || mattUserId;

    // Map and filter task data
    const records = hubData.results
      ?.map((task: any) => {
        const props = task.properties;
        return {
          type: props.hs_task_type || 'task',
          subject: props.hs_task_subject || 'HubSpot Task',
          description: props.hs_task_body || null,
          scheduled_at: props.hs_timestamp ? new Date(parseInt(props.hs_timestamp)).toISOString() : new Date().toISOString(),
          status: props.hs_task_status === 'COMPLETED' ? 'completed' : 'pending',
          priority: props.hs_task_priority || 'medium',
          assigned_to: defaultUserId, // Use a valid UUID instead of HubSpot ID
          created_by: defaultUserId // Use a valid UUID instead of HubSpot ID
        };
      })
      .filter((record: any) => record.subject) || [];

    if (records.length > 0) {
      console.log(`💾 Inserting ${records.length} tasks into database...`);
      
      const { data, error } = await supabase
        .from('activities')
        .insert(records)
        .select('id, subject, type');

      if (error) {
        console.error('❌ Database Insert Error:', error);
        totalErrors += records.length;
      } else {
        console.log(`✅ Successfully inserted ${data?.length || 0} tasks`);
        totalImported += data?.length || 0;
      }
    }

    // Check if there are more pages
    if (!hubData.paging?.next?.after) {
      console.log('📄 No more pages to process');
      break;
    }

    after = hubData.paging.next.after;
    console.log(`➡️ Moving to next page (after: ${after})`);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const result = {
    success: true,
    message: `Tasks import completed: ${totalImported} tasks processed`,
    imported: totalImported,
    errors: totalErrors
  };

  console.log('🎉 Tasks Import Summary:', result);
  return new Response(
    JSON.stringify(result),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function importAllRecords(supabase: any, HUBSPOT_TOKEN: string) {
  console.log('🚀 Starting comprehensive HubSpot import (all records)...');
  
  const results: any = {
    success: true,
    message: 'All records import completed',
    companies: { imported: 0, errors: 0 },
    contacts: { imported: 0, errors: 0 },
    deals: { imported: 0, errors: 0 },
    activities: { imported: 0, errors: 0 },
    tasks: { imported: 0, errors: 0 }
  };

  try {
    // Import companies first
    console.log('📦 Step 1/5: Importing companies...');
    const companiesResult = await importCompanies(supabase, HUBSPOT_TOKEN);
    const companiesData = await companiesResult.json();
    results.companies = { imported: companiesData.imported || 0, errors: companiesData.errors || 0 };

    // Import contacts
    console.log('📦 Step 2/5: Importing contacts...');
    const contactsResult = await importContacts(supabase, HUBSPOT_TOKEN);
    const contactsData = await contactsResult.json();
    results.contacts = { imported: contactsData.imported || 0, errors: contactsData.errors || 0 };

    // Import deals
    console.log('📦 Step 3/5: Importing deals...');
    const dealsResult = await importDeals(supabase, HUBSPOT_TOKEN);
    const dealsData = await dealsResult.json();
    results.deals = { imported: dealsData.imported || 0, errors: dealsData.errors || 0 };

    // Import activities
    console.log('📦 Step 4/5: Importing activities...');
    const activitiesResult = await importActivities(supabase, HUBSPOT_TOKEN);
    const activitiesData = await activitiesResult.json();
    results.activities = { imported: activitiesData.imported || 0, errors: activitiesData.errors || 0 };

    // Import tasks
    console.log('📦 Step 5/5: Importing tasks...');
    const tasksResult = await importTasks(supabase, HUBSPOT_TOKEN);
    const tasksData = await tasksResult.json();
    results.tasks = { imported: tasksData.imported || 0, errors: tasksData.errors || 0 };

    const totalImported = results.companies.imported + results.contacts.imported + 
                         results.deals.imported + results.activities.imported + results.tasks.imported;
    const totalErrors = results.companies.errors + results.contacts.errors + 
                       results.deals.errors + results.activities.errors + results.tasks.errors;

    results.message = `All records import completed: ${totalImported} total records imported, ${totalErrors} errors`;
    results.imported = totalImported;
    results.errors = totalErrors;

  } catch (error) {
    console.error('❌ All Records Import Error:', error);
    results.success = false;
    results.error = error.message;
  }

  console.log('🎉 All Records Import Summary:', results);
  return new Response(
    JSON.stringify(results),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
