
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaxChangeAlert {
  change_type: string;
  jurisdiction: string;
  effective_date: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  source_url: string;
  detected_at: string;
}

interface TaxDataSource {
  name: string;
  url: string;
  type: 'rss' | 'api' | 'scrape';
  jurisdiction: string;
  check_frequency: number; // hours
}

const TAX_DATA_SOURCES: TaxDataSource[] = [
  {
    name: 'IRS Publication 15',
    url: 'https://www.irs.gov/pub/irs-pdf/p15.pdf',
    type: 'scrape',
    jurisdiction: 'federal',
    check_frequency: 24,
  },
  {
    name: 'SSA Wage Base Updates',
    url: 'https://www.ssa.gov/oact/cola/cbb.html',
    type: 'scrape',
    jurisdiction: 'federal',
    check_frequency: 24,
  },
  {
    name: 'California EDD Updates',
    url: 'https://www.edd.ca.gov/en/payroll_taxes/rates_and_withholding',
    type: 'scrape',
    jurisdiction: 'california',
    check_frequency: 12,
  },
  {
    name: 'IRS News RSS',
    url: 'https://www.irs.gov/newsroom/irs-news-releases-rss-feeds',
    type: 'rss',
    jurisdiction: 'federal',
    check_frequency: 6,
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting tax change monitoring cycle...');

    const alerts: TaxChangeAlert[] = [];

    // Monitor each tax data source
    for (const source of TAX_DATA_SOURCES) {
      try {
        console.log(`Checking ${source.name}...`);
        
        // Check if we need to monitor this source based on frequency
        const shouldCheck = await shouldCheckSource(supabase, source);
        if (!shouldCheck) {
          console.log(`Skipping ${source.name} - not due for check`);
          continue;
        }

        const changes = await monitorTaxSource(source);
        if (changes.length > 0) {
          alerts.push(...changes);
          console.log(`Found ${changes.length} changes from ${source.name}`);
        }

        // Update last check time
        await updateLastCheckTime(supabase, source);

      } catch (error) {
        console.error(`Error monitoring ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }

    // Process and store alerts
    if (alerts.length > 0) {
      await processAlerts(supabase, alerts);
      await sendNotifications(supabase, alerts);
      console.log(`Processed ${alerts.length} tax change alerts`);
    } else {
      console.log('No tax changes detected');
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertsFound: alerts.length,
        message: `Tax change monitoring completed. Found ${alerts.length} alerts.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Tax change monitoring error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function shouldCheckSource(supabase: any, source: TaxDataSource): Promise<boolean> {
  const { data } = await supabase
    .from('tax_monitoring_log')
    .select('last_checked')
    .eq('source_name', source.name)
    .single();

  if (!data?.last_checked) return true;

  const lastCheck = new Date(data.last_checked);
  const hoursAgo = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);
  
  return hoursAgo >= source.check_frequency;
}

async function monitorTaxSource(source: TaxDataSource): Promise<TaxChangeAlert[]> {
  const alerts: TaxChangeAlert[] = [];

  try {
    switch (source.type) {
      case 'rss':
        return await monitorRSSFeed(source);
      case 'api':
        return await monitorAPI(source);
      case 'scrape':
        return await monitorWebsite(source);
      default:
        console.log(`Unknown source type: ${source.type}`);
        return [];
    }
  } catch (error) {
    console.error(`Error monitoring ${source.name}:`, error);
    return [];
  }
}

async function monitorRSSFeed(source: TaxDataSource): Promise<TaxChangeAlert[]> {
  const alerts: TaxChangeAlert[] = [];
  
  try {
    const response = await fetch(source.url);
    const text = await response.text();
    
    // Parse RSS and look for tax-related keywords
    const taxKeywords = [
      'tax rate', 'withholding', 'wage base', 'bracket', 'deduction',
      'FICA', 'Social Security', 'Medicare', 'unemployment',
      'Publication 15', 'Circular E', 'payroll'
    ];

    // Simple XML parsing for RSS items
    const items = text.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    for (const item of items) {
      const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
      const description = item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || '';
      const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || '';
      const pubDate = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || '';

      // Check if this item contains tax-related content
      const content = (title + ' ' + description).toLowerCase();
      const hasTaxKeyword = taxKeywords.some(keyword => content.includes(keyword.toLowerCase()));

      if (hasTaxKeyword) {
        // Check if this is a recent item (within last 30 days)
        const itemDate = new Date(pubDate);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        if (itemDate > thirtyDaysAgo) {
          alerts.push({
            change_type: 'news_update',
            jurisdiction: source.jurisdiction,
            effective_date: itemDate.toISOString().split('T')[0],
            description: `${title}: ${description}`,
            impact_level: determineImpactLevel(content),
            source_url: link,
            detected_at: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS feed ${source.url}:`, error);
  }

  return alerts;
}

async function monitorAPI(source: TaxDataSource): Promise<TaxChangeAlert[]> {
  // Placeholder for API monitoring
  // Would integrate with tax data provider APIs like Thomson Reuters, Vertex, etc.
  return [];
}

async function monitorWebsite(source: TaxDataSource): Promise<TaxChangeAlert[]> {
  const alerts: TaxChangeAlert[] = [];
  
  try {
    const response = await fetch(source.url);
    const text = await response.text();
    
    // Look for common indicators of tax changes
    const changeIndicators = [
      /tax year 2025/gi,
      /effective\s+(?:january|date)[\s\d,]+2025/gi,
      /new\s+(?:rate|bracket|wage\s+base)/gi,
      /updated?\s+(?:withholding|rates?)/gi,
      /\$[\d,]+\s*(?:wage\s+base|maximum|threshold)/gi,
    ];

    for (const pattern of changeIndicators) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          alerts.push({
            change_type: 'website_update',
            jurisdiction: source.jurisdiction,
            effective_date: new Date().toISOString().split('T')[0],
            description: `Potential tax change detected: "${match}" on ${source.name}`,
            impact_level: 'medium',
            source_url: source.url,
            detected_at: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scraping website ${source.url}:`, error);
  }

  return alerts;
}

function determineImpactLevel(content: string): 'low' | 'medium' | 'high' | 'critical' {
  const criticalKeywords = ['wage base', 'social security', 'medicare rate'];
  const highKeywords = ['tax bracket', 'withholding table', 'rate change'];
  const mediumKeywords = ['publication', 'update', 'revision'];

  content = content.toLowerCase();

  if (criticalKeywords.some(keyword => content.includes(keyword))) {
    return 'critical';
  } else if (highKeywords.some(keyword => content.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => content.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

async function updateLastCheckTime(supabase: any, source: TaxDataSource) {
  await supabase
    .from('tax_monitoring_log')
    .upsert({
      source_name: source.name,
      source_url: source.url,
      last_checked: new Date().toISOString(),
      check_frequency_hours: source.check_frequency,
    });
}

async function processAlerts(supabase: any, alerts: TaxChangeAlert[]) {
  for (const alert of alerts) {
    await supabase
      .from('tax_change_alerts')
      .insert(alert);
  }
}

async function sendNotifications(supabase: any, alerts: TaxChangeAlert[]) {
  // Get list of tax administrators who should be notified
  const { data: admins } = await supabase
    .from('profiles')
    .select('user_id, email')
    .eq('receive_tax_alerts', true);

  if (!admins || admins.length === 0) return;

  // Group alerts by impact level
  const criticalAlerts = alerts.filter(a => a.impact_level === 'critical');
  const highAlerts = alerts.filter(a => a.impact_level === 'high');

  // Send immediate notifications for critical alerts
  if (criticalAlerts.length > 0) {
    for (const admin of admins) {
      await supabase.functions.invoke('send-email', {
        body: {
          to: admin.email,
          subject: `🚨 CRITICAL Tax Change Alert - Immediate Action Required`,
          html: generateCriticalAlertEmail(criticalAlerts),
        },
      });
    }
  }

  // Send summary notifications for high impact alerts
  if (highAlerts.length > 0) {
    for (const admin of admins) {
      await supabase.functions.invoke('send-email', {
        body: {
          to: admin.email,
          subject: `⚠️ High Priority Tax Changes Detected`,
          html: generateHighAlertEmail(highAlerts),
        },
      });
    }
  }
}

function generateCriticalAlertEmail(alerts: TaxChangeAlert[]): string {
  const alertList = alerts.map(alert => `
    <div style="background: #fee2e2; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #dc2626; margin: 0 0 10px 0;">${alert.change_type.toUpperCase()}</h3>
      <p><strong>Jurisdiction:</strong> ${alert.jurisdiction}</p>
      <p><strong>Effective Date:</strong> ${alert.effective_date}</p>
      <p><strong>Description:</strong> ${alert.description}</p>
      <p><a href="${alert.source_url}" style="color: #dc2626;">View Source</a></p>
    </div>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">🚨 CRITICAL Tax Change Alert</h1>
        <p>The following critical tax changes have been detected and require immediate attention:</p>
        ${alertList}
        <div style="background: #f3f4f6; padding: 15px; margin: 20px 0;">
          <h3>Immediate Actions Required:</h3>
          <ol>
            <li>Review and validate each change</li>
            <li>Update tax tables in the system</li>
            <li>Test payroll calculations</li>
            <li>Notify payroll administrators</li>
          </ol>
        </div>
        <p><a href="${Deno.env.get('SUPABASE_URL')}/admin/tax-alerts" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View All Alerts</a></p>
      </body>
    </html>
  `;
}

function generateHighAlertEmail(alerts: TaxChangeAlert[]): string {
  const alertList = alerts.map(alert => `
    <div style="background: #fef3c7; padding: 15px; margin: 10px 0; border-left: 4px solid #f59e0b;">
      <h3 style="color: #f59e0b; margin: 0 0 10px 0;">${alert.change_type.toUpperCase()}</h3>
      <p><strong>Jurisdiction:</strong> ${alert.jurisdiction}</p>
      <p><strong>Description:</strong> ${alert.description}</p>
      <p><a href="${alert.source_url}" style="color: #f59e0b;">View Source</a></p>
    </div>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">⚠️ High Priority Tax Changes</h1>
        <p>The following tax changes have been detected and may require action:</p>
        ${alertList}
        <p><a href="${Deno.env.get('SUPABASE_URL')}/admin/tax-alerts" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review All Alerts</a></p>
      </body>
    </html>
  `;
}
