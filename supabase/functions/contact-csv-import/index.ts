import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface HubSpotContactRow {
  'Record ID': string
  'First Name': string
  'Last Name': string
  'Email': string
  'Phone Number': string
  'Contact owner': string
  'Primary Associated Company ID': string
  'Last Activity Date': string
  'Lead Status': string
  'Marketing contact status': string
  'Create Date': string
  'Associated Company': string
}

interface ImportResult {
  success: boolean
  imported: number
  errors: number
  duplicates: number
  details: {
    imported: any[]
    errors: any[]
    duplicates: any[]
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { csvData } = await req.json()

    if (!csvData) {
      return new Response(
        JSON.stringify({ error: 'CSV data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Starting HubSpot Contact CSV import...')

    // Parse CSV data
    const lines = csvData.split('\n').filter((line: string) => line.trim())
    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''))
    const dataRows = lines.slice(1)

    console.log(`Found ${dataRows.length} contacts to import`)

    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: 0,
      duplicates: 0,
      details: {
        imported: [],
        errors: [],
        duplicates: []
      }
    }

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (!row.trim()) continue

      try {
        // Parse CSV row (simple split for now - may need more robust parsing)
        const values = row.split(',').map((v: string) => v.trim().replace(/"/g, ''))
        const rowData: any = {}
        
        headers.forEach((header: string, index: number) => {
          rowData[header] = values[index] || ''
        })

        const contactData = rowData as HubSpotContactRow

        // Skip if no email
        if (!contactData['Email']) {
          result.errors++
          result.details.errors.push({
            row: i + 2,
            error: 'Missing email address',
            data: contactData
          })
          continue
        }

        // Check for existing contact by email
        const { data: existingContact } = await supabase
          .from('leads')
          .select('id, email')
          .eq('email', contactData['Email'])
          .maybeSingle()

        if (existingContact) {
          result.duplicates++
          result.details.duplicates.push({
            row: i + 2,
            existing_id: existingContact.id,
            email: contactData['Email']
          })
          continue
        }

        // Parse lead status
        const leadStatus = contactData['Lead Status']?.toLowerCase() || 'new'
        const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
        const finalStatus = validStatuses.includes(leadStatus) ? leadStatus : 'new'

        // Prepare contact record
        const contactRecord = {
          first_name: contactData['First Name'] || '',
          last_name: contactData['Last Name'] || '',
          email: contactData['Email'],
          phone: contactData['Phone Number'] || null,
          company_name: contactData['Associated Company'] || null,
          source: 'hubspot_import',
          status: finalStatus,
          lead_score: 0,
          last_contact_date: contactData['Last Activity Date'] ? 
            new Date(contactData['Last Activity Date']).toISOString() : null,
          created_at: contactData['Create Date'] ? 
            new Date(contactData['Create Date']).toISOString() : new Date().toISOString(),
          notes: `Imported from HubSpot. Record ID: ${contactData['Record ID'] || 'N/A'}`
        }

        // Insert contact
        const { data: insertedContact, error: insertError } = await supabase
          .from('leads')
          .insert([contactRecord])
          .select()
          .single()

        if (insertError) {
          result.errors++
          result.details.errors.push({
            row: i + 2,
            error: insertError.message,
            data: contactData
          })
          console.error(`Error inserting contact ${contactData['Email']}:`, insertError)
        } else {
          result.imported++
          result.details.imported.push({
            row: i + 2,
            id: insertedContact.id,
            email: insertedContact.email,
            name: `${insertedContact.first_name} ${insertedContact.last_name}`
          })
          console.log(`Imported: ${contactData['Email']}`)
        }

      } catch (error) {
        result.errors++
        result.details.errors.push({
          row: i + 2,
          error: error.message,
          data: row
        })
        console.error(`Error processing row ${i + 2}:`, error)
      }
    }

    console.log(`Import completed: ${result.imported} imported, ${result.errors} errors, ${result.duplicates} duplicates`)

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('HubSpot Contact CSV import error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})