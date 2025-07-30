import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface HubSpotCompanyRow {
  'Record ID': string
  'Company name': string
  'Company owner': string
  'Create Date': string
  'Phone Number': string
  'Last Activity Date': string
  'City': string
  'Country/Region': string
  'Industry': string
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

    console.log('Starting HubSpot CSV import...')

    // Parse CSV data
    const lines = csvData.split('\n').filter((line: string) => line.trim())
    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''))
    const dataRows = lines.slice(1)

    console.log(`Found ${dataRows.length} companies to import`)

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

        const companyData = rowData as HubSpotCompanyRow

        // Skip if no company name
        if (!companyData['Company name']) {
          result.errors++
          result.details.errors.push({
            row: i + 2,
            error: 'Missing company name',
            data: companyData
          })
          continue
        }

        // Check for existing company
        const { data: existingCompany } = await supabase
          .from('company_settings')
          .select('id, company_name')
          .eq('company_name', companyData['Company name'])
          .maybeSingle()

        if (existingCompany) {
          result.duplicates++
          result.details.duplicates.push({
            row: i + 2,
            existing_id: existingCompany.id,
            company_name: companyData['Company name']
          })
          continue
        }

        // Prepare company record
        const companyRecord = {
          company_name: companyData['Company name'],
          company_owner_name: companyData['Company owner'] || null,
          phone: companyData['Phone Number'] || null,
          city: companyData['City'] || null,
          country: companyData['Country/Region'] || null,
          industry: companyData['Industry'] || null,
          hubspot_record_id: companyData['Record ID'] || null,
          last_activity_date: companyData['Last Activity Date'] ? 
            new Date(companyData['Last Activity Date']).toISOString() : null,
          created_at: companyData['Create Date'] ? 
            new Date(companyData['Create Date']).toISOString() : new Date().toISOString(),
          subscription_status: 'trial',
          primary_color: '#655DC6'
        }

        // Insert company
        const { data: insertedCompany, error: insertError } = await supabase
          .from('company_settings')
          .insert([companyRecord])
          .select()
          .single()

        if (insertError) {
          result.errors++
          result.details.errors.push({
            row: i + 2,
            error: insertError.message,
            data: companyData
          })
          console.error(`Error inserting company ${companyData['Company name']}:`, insertError)
        } else {
          result.imported++
          result.details.imported.push({
            row: i + 2,
            id: insertedCompany.id,
            company_name: insertedCompany.company_name
          })
          console.log(`Imported: ${companyData['Company name']}`)
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
    console.error('HubSpot CSV import error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})