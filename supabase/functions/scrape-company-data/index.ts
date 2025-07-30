import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, companyId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Scraping URL:', url);

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use Firecrawl to scrape the website
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        pageOptions: {
          onlyMainContent: true,
          includeHtml: true,
          includeMarkdown: true
        },
        extractorOptions: {
          mode: 'llm-extraction',
          extractionPrompt: `Extract the following company information from this webpage:
            - Company name
            - Website/domain
            - Industry or business type
            - Company description/about us
            - Founded year
            - Employee count/number of employees
            - Annual revenue
            - Phone number
            - Email address
            - Physical address (street, city, state, country, postal code)
            - Company type (customer, prospect, partner, etc.)
            - Lifecycle stage (lead, prospect, customer, etc.)
            - Logo URL (if visible)
            - LinkedIn company page URL
            - Facebook company page URL
            - Twitter handle
            Return the data in JSON format with keys: companyName, website, industry, description, foundedYear, employeeCount, annualRevenue, phone, email, address, city, state, country, postalCode, companyType, lifecycleStage, logoUrl, linkedinCompanyPage, facebookCompanyPage, twitterHandle`
        }
      }),
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    console.log('Firecrawl response:', firecrawlData);

    let extractedData: any = {};

    // Try to use LLM-extracted data first
    if (firecrawlData.llm_extraction) {
      extractedData = firecrawlData.llm_extraction;
    } else {
      // Fallback to pattern matching on HTML content
      const htmlContent = firecrawlData.data?.html || '';
      extractedData = await extractCompanyData(htmlContent, url);
    }

    // If we have a company ID, update the database
    if (companyId && extractedData) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Update company settings
      const updateData: any = {};
      if (extractedData.companyName) {
        updateData.company_name = extractedData.companyName;
      }
      if (extractedData.website) {
        updateData.website = extractedData.website;
      }
      if (extractedData.industry) {
        updateData.industry = extractedData.industry;
      }
      if (extractedData.description) {
        updateData.description = extractedData.description;
      }
      if (extractedData.foundedYear) {
        updateData.founded_year = parseInt(extractedData.foundedYear);
      }
      if (extractedData.employeeCount) {
        updateData.employee_count = parseInt(extractedData.employeeCount);
      }
      if (extractedData.annualRevenue) {
        updateData.annual_revenue = parseFloat(extractedData.annualRevenue);
      }
      if (extractedData.phone) {
        updateData.phone = extractedData.phone;
      }
      if (extractedData.address) {
        updateData.address = extractedData.address;
      }
      if (extractedData.city) {
        updateData.city = extractedData.city;
      }
      if (extractedData.state) {
        updateData.state = extractedData.state;
      }
      if (extractedData.country) {
        updateData.country = extractedData.country;
      }
      if (extractedData.postalCode) {
        updateData.postal_code = extractedData.postalCode;
      }
      if (extractedData.companyType) {
        updateData.company_type = extractedData.companyType;
      }
      if (extractedData.lifecycleStage) {
        updateData.lifecycle_stage = extractedData.lifecycleStage;
      }
      if (extractedData.linkedinCompanyPage) {
        updateData.linkedin_company_page = extractedData.linkedinCompanyPage;
      }
      if (extractedData.facebookCompanyPage) {
        updateData.facebook_company_page = extractedData.facebookCompanyPage;
      }
      if (extractedData.twitterHandle) {
        updateData.twitter_handle = extractedData.twitterHandle;
      }
      if (extractedData.logoUrl || extractedData.logo) {
        updateData.company_logo_url = extractedData.logoUrl || extractedData.logo;
      }
      if (extractedData.primaryColor) {
        updateData.primary_color = extractedData.primaryColor;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('company_settings')
          .update(updateData)
          .eq('id', companyId);

        if (updateError) {
          console.error('Error updating company:', updateError);
        }
      }

      // Create or update company location if we have address data
      if (extractedData.address || extractedData.phone || extractedData.email) {
        const locationData = {
          company_id: companyId,
          location_name: 'Main Office',
          address: extractedData.address || null,
          city: extractedData.city || null,
          state: extractedData.state || null,
          country: extractedData.country || 'United States',
          phone: extractedData.phone || null,
          email: extractedData.email || null,
          is_primary: true,
          is_active: true
        };

        // Check if a primary location already exists
        const { data: existingLocation } = await supabase
          .from('company_locations')
          .select('id')
          .eq('company_id', companyId)
          .eq('is_primary', true)
          .single();

        if (existingLocation) {
          // Update existing primary location
          const { error: locationError } = await supabase
            .from('company_locations')
            .update(locationData)
            .eq('id', existingLocation.id);

          if (locationError) {
            console.error('Error updating location:', locationError);
          }
        } else {
          // Create new primary location
          const { error: locationError } = await supabase
            .from('company_locations')
            .insert(locationData);

          if (locationError) {
            console.error('Error creating location:', locationError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        message: 'Company data scraped successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error scraping company data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to scrape company data', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function extractCompanyData(html: string, baseUrl: string) {
  const data: any = {
    companyName: null,
    industry: null,
    phone: null,
    email: null,
    address: null,
    city: null,
    state: null,
    country: null,
    logoUrl: null,
    primaryColor: null,
    description: null
  };

  try {
    // Extract company name from title or h1
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)</i);
    
    if (titleMatch) {
      data.companyName = titleMatch[1].replace(/\s*[-|]\s*.*/i, '').trim();
    } else if (h1Match) {
      data.companyName = h1Match[1].trim();
    }

    // Extract phone numbers
    const phoneMatch = html.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) {
      data.phone = phoneMatch[0];
    }

    // Extract email addresses
    const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      data.email = emailMatch[0];
    }

    // Extract address information
    const addressPatterns = [
      /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln))/i,
      /([A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5})/i
    ];

    for (const pattern of addressPatterns) {
      const match = html.match(pattern);
      if (match) {
        data.address = match[1];
        break;
      }
    }

    // Extract city, state from address or separately
    const cityStateMatch = html.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s+(\d{5})/);
    if (cityStateMatch) {
      data.city = cityStateMatch[1];
      data.state = cityStateMatch[2];
    }

    // Extract logo using common selectors
    const logoPatterns = [
      /<img[^>]*(?:class|id)="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
      /<img[^>]*src="([^"]+)"[^>]*(?:class|id)="[^"]*logo[^"]*"/i,
      /<img[^>]*alt="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i
    ];

    for (const pattern of logoPatterns) {
      const match = html.match(pattern);
      if (match) {
        let logoUrl = match[1];
        if (logoUrl.startsWith('/')) {
          const urlObj = new URL(baseUrl);
          logoUrl = `${urlObj.protocol}//${urlObj.host}${logoUrl}`;
        }
        data.logoUrl = logoUrl;
        break;
      }
    }

    // Extract industry/business type keywords
    const industryKeywords = [
      'technology', 'software', 'consulting', 'finance', 'healthcare', 'education',
      'manufacturing', 'retail', 'real estate', 'construction', 'legal', 'marketing',
      'restaurant', 'hospitality', 'transportation', 'energy', 'telecommunications',
      'insurance', 'banking', 'automotive', 'pharmaceutical', 'media', 'entertainment'
    ];

    const lowerContent = html.toLowerCase();
    for (const keyword of industryKeywords) {
      if (lowerContent.includes(keyword)) {
        data.industry = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }

    // Extract colors from CSS for primary color
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColorMatch) {
      data.primaryColor = themeColorMatch[1];
    }

    console.log('Extracted company data:', data);
    return data;

  } catch (error) {
    console.error('Error extracting company data:', error);
    return data;
  }
}