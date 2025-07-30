import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CalendarExportRequest {
  format: 'pdf' | 'csv';
  year: number;
  companyId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { format, year, companyId }: CalendarExportRequest = await req.json();

    console.log('Generating pay calendar:', { format, year, companyId });

    // Fetch pay calendar data
    const { data: payPeriods, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .gte('start_date', `${year}-01-01`)
      .lte('end_date', `${year}-12-31`)
      .order('start_date');

    if (error) {
      throw new Error(`Failed to fetch pay periods: ${error.message}`);
    }

    if (format === 'csv') {
      const csvContent = generateCSV(payPeriods || [], year);
      return new Response(csvContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="pay-calendar-${year}.csv"`
        }
      });
    } else {
      const pdfContent = generatePDF(payPeriods || [], year);
      return new Response(pdfContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="pay-calendar-${year}.pdf"`
        }
      });
    }

  } catch (error) {
    console.error('Error generating pay calendar:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate calendar',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateCSV(payPeriods: any[], year: number): string {
  const headers = [
    'Pay Period',
    'Start Date',
    'End Date',
    'Pay Date',
    'Cutoff Date',
    'Approval Deadline',
    'Status',
    'Notes'
  ].join(',');

  const rows = payPeriods.map(period => [
    `"PP${period.period_number}-${year}"`,
    `"${formatDate(period.start_date)}"`,
    `"${formatDate(period.end_date)}"`,
    `"${formatDate(period.pay_date)}"`,
    `"${formatDate(period.cutoff_date)}"`,
    `"${formatDate(period.approval_deadline)}"`,
    `"${period.status || 'Scheduled'}"`,
    `"${period.notes || ''}"`
  ].join(','));

  return [headers, ...rows].join('\n');
}

function generatePDF(payPeriods: any[], year: number): string {
  // Simple PDF generation - in production, use a proper PDF library
  const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${getPDFContentLength(payPeriods, year)}
>>
stream
BT
/F1 12 Tf
72 720 Td
(Pay Calendar ${year}) Tj
0 -24 Td
${payPeriods.map(period => 
  `(Pay Period ${period.period_number}: ${formatDate(period.start_date)} - ${formatDate(period.end_date)}) Tj 0 -12 Td`
).join('\n')}
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${300 + getPDFContentLength(payPeriods, year)}
%%EOF`;

  return content;
}

function getPDFContentLength(payPeriods: any[], year: number): number {
  const baseContent = `BT\n/F1 12 Tf\n72 720 Td\n(Pay Calendar ${year}) Tj\n0 -24 Td\n`;
  const periodsContent = payPeriods.map(period => 
    `(Pay Period ${period.period_number}: ${formatDate(period.start_date)} - ${formatDate(period.end_date)}) Tj 0 -12 Td`
  ).join('\n');
  const endContent = '\nET';
  
  return (baseContent + periodsContent + endContent).length;
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}