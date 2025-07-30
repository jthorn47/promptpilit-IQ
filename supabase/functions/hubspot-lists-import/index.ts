import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const HUBSPOT_API_KEY = Deno.env.get('HUBSPOT_API_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface HubSpotList {
  listId: string;
  name: string;
  listType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  metaData?: {
    size?: number;
    processing?: string;
  };
}

interface HubSpotListResponse {
  lists: HubSpotList[];
  hasMore: boolean;
  offset?: number;
}

async function fetchHubSpotLists(): Promise<HubSpotList[]> {
  const allLists: HubSpotList[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.hubapi.com/contacts/v1/lists?count=100&offset=${offset}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HubSpot API error:', response.status, errorText);
      throw new Error(`HubSpot API error: ${response.status} - ${errorText}`);
    }

    const data: HubSpotListResponse = await response.json();
    
    allLists.push(...data.lists);
    hasMore = data.hasMore;
    offset = data.offset || 0;
    
    console.log(`Fetched ${data.lists.length} lists, total so far: ${allLists.length}`);
  }

  return allLists;
}

async function fetchListContacts(listId: string): Promise<string[]> {
  const allContactIds: string[] = [];
  let vidOffset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.hubapi.com/contacts/v1/lists/${listId}/contacts/all?count=100&vidOffset=${vidOffset}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch contacts for list ${listId}`);
      break;
    }

    const data = await response.json();
    
    const contactIds = data.contacts?.map((contact: any) => contact.vid?.toString()) || [];
    allContactIds.push(...contactIds);
    
    hasMore = data['has-more'];
    vidOffset = data['vid-offset'] || 0;
  }

  return allContactIds;
}

async function importListsToSupabase(lists: HubSpotList[], userId: string) {
  const { data: user } = await supabase.auth.getUser();
  const currentUserId = user?.user?.id || userId;

  // Get user's company ID
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('company_id')
    .eq('user_id', currentUserId)
    .single();

  const companyId = userRole?.company_id;
  if (!companyId) {
    throw new Error('User company not found');
  }

  const listsToInsert = [];
  const listContactMappings = [];

  for (const hubspotList of lists) {
    // Skip system lists or very large lists initially
    if (hubspotList.listType === 'DYNAMIC' || (hubspotList.size > 10000)) {
      console.log(`Skipping list ${hubspotList.name} (type: ${hubspotList.listType}, size: ${hubspotList.size})`);
      continue;
    }

    const listData = {
      name: hubspotList.name,
      description: `Imported from HubSpot (ID: ${hubspotList.listId})`,
      company_id: companyId,
      created_by: currentUserId,
      recipient_count: hubspotList.size || 0,
      tags: {
        source: 'hubspot',
        hubspot_list_id: hubspotList.listId,
        hubspot_list_type: hubspotList.listType,
        imported_at: new Date().toISOString()
      },
      is_active: true
    };

    listsToInsert.push(listData);
  }

  // Insert lists in batches
  const insertedLists = [];
  const batchSize = 50;
  
  for (let i = 0; i < listsToInsert.length; i += batchSize) {
    const batch = listsToInsert.slice(i, i + batchSize);
    
    const { data: insertedBatch, error } = await supabase
      .from('email_lists')
      .insert(batch)
      .select();

    if (error) {
      console.error('Error inserting lists batch:', error);
      throw error;
    }

    insertedLists.push(...(insertedBatch || []));
  }

  // Now fetch and import list-contact associations
  let totalContactAssociations = 0;
  
  for (const list of insertedLists) {
    const hubspotListId = list.tags?.hubspot_list_id;
    if (!hubspotListId) continue;

    try {
      const contactIds = await fetchListContacts(hubspotListId);
      console.log(`List ${list.name}: ${contactIds.length} contacts`);

      // Find matching contacts in our database by HubSpot ID
      const { data: existingContacts } = await supabase
        .from('crm_contacts')
        .select('id, custom_fields')
        .eq('company_id', companyId)
        .not('custom_fields->hubspot_id', 'is', null);

      const contactMappings = [];
      
      for (const hubspotContactId of contactIds) {
        const matchingContact = existingContacts?.find(contact => 
          contact.custom_fields?.hubspot_id === hubspotContactId
        );

        if (matchingContact) {
          contactMappings.push({
            list_id: list.id,
            contact_email: '', // We'll update this with a proper query
            contact_id: matchingContact.id,
            status: 'subscribed',
            subscribed_at: new Date().toISOString(),
            source: 'hubspot_import'
          });
        }
      }

      // Get email addresses for the contacts
      if (contactMappings.length > 0) {
        const contactIds = contactMappings.map(cm => cm.contact_id);
        const { data: contactEmails } = await supabase
          .from('crm_contacts')
          .select('id, email')
          .in('id', contactIds);

        // Update contact mappings with emails
        contactMappings.forEach(mapping => {
          const contact = contactEmails?.find(c => c.id === mapping.contact_id);
          if (contact) {
            mapping.contact_email = contact.email;
          }
        });

        // Insert contact-list associations
        const { error: mappingError } = await supabase
          .from('email_list_recipients')
          .insert(contactMappings.filter(m => m.contact_email));

        if (mappingError) {
          console.error(`Error inserting contacts for list ${list.name}:`, mappingError);
        } else {
          totalContactAssociations += contactMappings.length;
          
          // Update list recipient count
          await supabase
            .from('email_lists')
            .update({ recipient_count: contactMappings.length })
            .eq('id', list.id);
        }
      }
    } catch (error) {
      console.error(`Error processing contacts for list ${list.name}:`, error);
    }
  }

  return {
    lists_imported: insertedLists.length,
    contact_associations: totalContactAssociations,
    lists: insertedLists
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !userData.user) {
      throw new Error('Invalid user token');
    }

    if (!HUBSPOT_API_KEY) {
      throw new Error('HubSpot API key not configured');
    }

    console.log('Starting HubSpot lists import...');
    
    // Fetch all lists from HubSpot
    const hubspotLists = await fetchHubSpotLists();
    console.log(`Found ${hubspotLists.length} lists in HubSpot`);

    // Import lists to Supabase
    const result = await importListsToSupabase(hubspotLists, userData.user.id);

    console.log('Import completed:', result);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        total_hubspot_lists: hubspotLists.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in hubspot-lists-import:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});