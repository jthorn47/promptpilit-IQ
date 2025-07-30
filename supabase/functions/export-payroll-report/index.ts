import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  reportId: string;
  companyId: string;
  format: 'pdf' | 'csv' | 'xlsx';
  filters: {
    startDate: string;
    endDate: string;
    department?: string;
    employee?: string;
    payGroup?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reportId, companyId, format, filters }: ExportRequest = await req.json();

    console.log(`Exporting payroll report: ${reportId} as ${format} for company: ${companyId}`);

    // First generate the report data
    const reportData = await generateReportData(supabase, reportId, companyId, filters);

    // Export based on format
    let exportResult: any;
    switch (format) {
      case 'csv':
        exportResult = await exportToCSV(reportData, reportId);
        break;
      case 'xlsx':
        exportResult = await exportToExcel(reportData, reportId);
        break;
      case 'pdf':
        exportResult = await exportToPDF(reportData, reportId);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Store export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('payroll_export_logs')
      .insert({
        company_id: companyId,
        report_type: reportId,
        export_format: format,
        file_size: exportResult.size,
        file_name: exportResult.filename,
        status: 'completed',
        exported_by: req.headers.get('user-id') || null
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error logging export:', exportError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        filename: exportResult.filename,
        downloadUrl: exportResult.downloadUrl,
        size: exportResult.size,
        exportId: exportRecord?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error exporting payroll report:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generateReportData(supabase: any, reportId: string, companyId: string, filters: any) {
  // This reuses the generation logic from the generate-payroll-report function
  switch (reportId) {
    case 'payroll-register':
      return await generatePayrollRegister(supabase, companyId, filters);
    case 'employee-pay-statement':
      return await generateEmployeePayStatement(supabase, companyId, filters);
    case 'payroll-summary':
      return await generatePayrollSummary(supabase, companyId, filters);
    case 'tax-liability':
      return await generateTaxLiability(supabase, companyId, filters);
    case 'deduction-summary':
      return await generateDeductionSummary(supabase, companyId, filters);
    case 'overtime-report':
      return await generateOvertimeReport(supabase, companyId, filters);
    default:
      return await generateGenericReport(supabase, companyId, filters, reportId);
  }
}

async function exportToCSV(data: any, reportId: string) {
  const filename = `${reportId}-${new Date().toISOString().split('T')[0]}.csv`;
  
  // Convert data to CSV format
  let csvContent = '';
  
  if (data.records && Array.isArray(data.records)) {
    if (data.records.length > 0) {
      // Create headers from first record
      const headers = Object.keys(data.records[0]).filter(key => 
        key !== 'id' && key !== 'created_at' && key !== 'updated_at'
      );
      csvContent += headers.join(',') + '\n';
      
      // Add data rows
      data.records.forEach((record: any) => {
        const row = headers.map(header => {
          const value = record[header];
          // Handle nested objects and arrays
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        });
        csvContent += row.join(',') + '\n';
      });
    }
  } else {
    // If no records, create a summary CSV
    csvContent = 'Summary Report\n';
    if (data.summary) {
      Object.entries(data.summary).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
    }
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  return {
    filename,
    downloadUrl: `data:text/csv;base64,${btoa(csvContent)}`,
    size: blob.size
  };
}

async function exportToExcel(data: any, reportId: string) {
  const filename = `${reportId}-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // For now, we'll export as CSV with .xlsx extension
  // In a production environment, you would use a proper Excel library
  const csvResult = await exportToCSV(data, reportId);
  
  return {
    filename,
    downloadUrl: csvResult.downloadUrl,
    size: csvResult.size
  };
}

async function exportToPDF(data: any, reportId: string) {
  const filename = `${reportId}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Create a simple HTML report that can be converted to PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.reportType}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 20px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .date-range { color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.reportType}</h1>
        <div class="date-range">Date Range: ${data.dateRange}</div>
        <div class="date-range">Generated: ${new Date().toLocaleString()}</div>
      </div>
  `;
  
  if (data.summary) {
    htmlContent += '<div class="summary"><h2>Summary</h2>';
    Object.entries(data.summary).forEach(([key, value]) => {
      htmlContent += `<p><strong>${key}:</strong> ${value}</p>`;
    });
    htmlContent += '</div>';
  }
  
  if (data.records && Array.isArray(data.records) && data.records.length > 0) {
    htmlContent += '<h2>Detailed Records</h2><table>';
    
    // Create headers
    const headers = Object.keys(data.records[0]).filter(key => 
      key !== 'id' && key !== 'created_at' && key !== 'updated_at'
    );
    htmlContent += '<tr>';
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += '</tr>';
    
    // Add data rows (limit to first 100 for PDF)
    data.records.slice(0, 100).forEach((record: any) => {
      htmlContent += '<tr>';
      headers.forEach(header => {
        const value = record[header];
        const displayValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value) 
          : String(value || '');
        htmlContent += `<td>${displayValue}</td>`;
      });
      htmlContent += '</tr>';
    });
    
    htmlContent += '</table>';
    
    if (data.records.length > 100) {
      htmlContent += '<p><em>Note: Only first 100 records shown in PDF. Use CSV export for complete data.</em></p>';
    }
  }
  
  htmlContent += '</body></html>';
  
  // In a production environment, you would use a PDF generation library
  // For now, return the HTML as a data URL
  const dataUrl = `data:text/html;base64,${btoa(htmlContent)}`;
  
  return {
    filename,
    downloadUrl: dataUrl,
    size: htmlContent.length
  };
}

// Helper functions (simplified versions from the generate function)
async function generatePayrollRegister(supabase: any, companyId: string, filters: any) {
  const { data: payrollData, error } = await supabase
    .from('pay_stubs')
    .select(`
      *,
      employees(employee_number, first_name, last_name, department)
    `)
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate)
    .order('pay_date', { ascending: false });

  if (error) throw error;

  return {
    reportType: 'Payroll Register',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    records: payrollData,
    generatedAt: new Date().toISOString()
  };
}

async function generateEmployeePayStatement(supabase: any, companyId: string, filters: any) {
  const { data: payStubs, error } = await supabase
    .from('pay_stubs')
    .select(`
      *,
      employees(employee_number, first_name, last_name, department)
    `)
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate)
    .order('pay_date', { ascending: false });

  if (error) throw error;

  return {
    reportType: 'Employee Pay Statements',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    records: payStubs,
    generatedAt: new Date().toISOString()
  };
}

async function generatePayrollSummary(supabase: any, companyId: string, filters: any) {
  const { data: summaryData, error } = await supabase
    .from('pay_stubs')
    .select('*')
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate);

  if (error) throw error;

  const summary = {
    totalEmployees: new Set(summaryData.map((p: any) => p.employee_id)).size,
    totalGrossPay: summaryData.reduce((sum: number, p: any) => sum + (p.gross_pay || 0), 0),
    totalNetPay: summaryData.reduce((sum: number, p: any) => sum + (p.net_pay || 0), 0),
    totalTaxes: summaryData.reduce((sum: number, p: any) => sum + (p.total_taxes || 0), 0),
  };

  return {
    reportType: 'Payroll Summary',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    summary,
    generatedAt: new Date().toISOString()
  };
}

async function generateTaxLiability(supabase: any, companyId: string, filters: any) {
  const { data: taxData, error } = await supabase
    .from('pay_stubs')
    .select('*')
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate);

  if (error) throw error;

  return {
    reportType: 'Tax Liability Report',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    records: taxData,
    generatedAt: new Date().toISOString()
  };
}

async function generateDeductionSummary(supabase: any, companyId: string, filters: any) {
  const { data: deductionData, error } = await supabase
    .from('pay_stubs')
    .select('*')
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate);

  if (error) throw error;

  return {
    reportType: 'Deduction Summary',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    records: deductionData,
    generatedAt: new Date().toISOString()
  };
}

async function generateOvertimeReport(supabase: any, companyId: string, filters: any) {
  const { data: overtimeData, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      employees(employee_number, first_name, last_name, department)
    `)
    .eq('company_id', companyId)
    .gte('work_date', filters.startDate)
    .lte('work_date', filters.endDate)
    .gt('overtime_hours', 0)
    .order('work_date', { ascending: false });

  if (error) throw error;

  return {
    reportType: 'Overtime Report',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    records: overtimeData,
    generatedAt: new Date().toISOString()
  };
}

async function generateGenericReport(supabase: any, companyId: string, filters: any, reportId: string) {
  return {
    reportType: `Generic Report: ${reportId}`,
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    message: 'This report type is not yet implemented with specific data queries.',
    filters,
    generatedAt: new Date().toISOString()
  };
}