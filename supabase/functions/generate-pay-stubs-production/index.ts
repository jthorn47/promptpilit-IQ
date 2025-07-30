import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayStubData {
  employee_id: string;
  employee_name: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  gross_pay: number;
  net_pay: number;
  federal_withholding: number;
  state_withholding: number;
  fica_withholding: number;
  medicare_withholding: number;
  other_deductions: number;
  ytd_gross: number;
  ytd_net: number;
  ytd_federal: number;
  ytd_state: number;
  company_info: {
    name: string;
    address: string;
    ein: string;
  };
  employee_info: {
    address: string;
    ssn_last4: string;
    employee_id: string;
  };
}

class PayStubGenerator {
  static generateHTML(data: PayStubData): string {
    const {
      employee_name,
      pay_period_start,
      pay_period_end,
      pay_date,
      gross_pay,
      net_pay,
      federal_withholding,
      state_withholding,
      fica_withholding,
      medicare_withholding,
      other_deductions,
      ytd_gross,
      ytd_net,
      ytd_federal,
      ytd_state,
      company_info,
      employee_info
    } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pay Stub - ${employee_name}</title>
    <style>
        @page {
            size: 8.5in 11in;
            margin: 0.5in;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .pay-stub-title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .employee-info, .pay-info {
            flex: 1;
        }
        
        .employee-info {
            margin-right: 40px;
        }
        
        .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 10px;
        }
        
        .earnings-section, .deductions-section, .summary-section {
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        th, td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
        }
        
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
        }
        
        .net-pay {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            background-color: #e0e0e0;
            padding: 10px;
            border: 2px solid #000;
            margin: 20px 0;
        }
        
        .ytd-section {
            margin-top: 20px;
        }
        
        .footer {
            margin-top: 30px;
            font-size: 9px;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 10px;
        }
        
        .confidential {
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${company_info.name}</div>
        <div>${company_info.address}</div>
        <div>EIN: ${company_info.ein}</div>
        <div class="pay-stub-title">PAYROLL STATEMENT</div>
    </div>

    <div class="info-section">
        <div class="employee-info">
            <div class="section-title">EMPLOYEE INFORMATION</div>
            <div><strong>Name:</strong> ${employee_name}</div>
            <div><strong>Employee ID:</strong> ${employee_info.employee_id}</div>
            <div><strong>SSN:</strong> XXX-XX-${employee_info.ssn_last4}</div>
            <div><strong>Address:</strong> ${employee_info.address}</div>
        </div>
        
        <div class="pay-info">
            <div class="section-title">PAY PERIOD INFORMATION</div>
            <div><strong>Pay Period:</strong> ${new Date(pay_period_start).toLocaleDateString()} - ${new Date(pay_period_end).toLocaleDateString()}</div>
            <div><strong>Pay Date:</strong> ${new Date(pay_date).toLocaleDateString()}</div>
            <div><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</div>
        </div>
    </div>

    <div class="earnings-section">
        <div class="section-title">EARNINGS</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Rate</th>
                    <th>Hours</th>
                    <th>Current</th>
                    <th>Year-to-Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Regular Pay</td>
                    <td class="amount">$25.00</td>
                    <td class="amount">40.00</td>
                    <td class="amount">$${(gross_pay * 0.8).toFixed(2)}</td>
                    <td class="amount">$${(ytd_gross * 0.8).toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Overtime Pay</td>
                    <td class="amount">$37.50</td>
                    <td class="amount">4.00</td>
                    <td class="amount">$${(gross_pay * 0.2).toFixed(2)}</td>
                    <td class="amount">$${(ytd_gross * 0.2).toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3"><strong>TOTAL EARNINGS</strong></td>
                    <td class="amount"><strong>$${gross_pay.toFixed(2)}</strong></td>
                    <td class="amount"><strong>$${ytd_gross.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="deductions-section">
        <div class="section-title">DEDUCTIONS</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Current</th>
                    <th>Year-to-Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Federal Income Tax</td>
                    <td class="amount">$${federal_withholding.toFixed(2)}</td>
                    <td class="amount">$${ytd_federal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>State Income Tax (CA)</td>
                    <td class="amount">$${state_withholding.toFixed(2)}</td>
                    <td class="amount">$${ytd_state.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Social Security</td>
                    <td class="amount">$${fica_withholding.toFixed(2)}</td>
                    <td class="amount">$${(ytd_gross * 0.062).toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Medicare</td>
                    <td class="amount">$${medicare_withholding.toFixed(2)}</td>
                    <td class="amount">$${(ytd_gross * 0.0145).toFixed(2)}</td>
                </tr>
                <tr>
                    <td>CA State Disability Insurance</td>
                    <td class="amount">$${(gross_pay * 0.009).toFixed(2)}</td>
                    <td class="amount">$${(ytd_gross * 0.009).toFixed(2)}</td>
                </tr>
                ${other_deductions > 0 ? `
                <tr>
                    <td>Other Deductions</td>
                    <td class="amount">$${other_deductions.toFixed(2)}</td>
                    <td class="amount">$${(other_deductions * 26).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td><strong>TOTAL DEDUCTIONS</strong></td>
                    <td class="amount"><strong>$${(gross_pay - net_pay).toFixed(2)}</strong></td>
                    <td class="amount"><strong>$${(ytd_gross - ytd_net).toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="net-pay">
        NET PAY: $${net_pay.toFixed(2)}
    </div>

    <div class="ytd-section">
        <div class="section-title">YEAR-TO-DATE SUMMARY</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Gross Earnings</td>
                    <td class="amount">$${ytd_gross.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total Deductions</td>
                    <td class="amount">$${(ytd_gross - ytd_net).toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Net Pay</strong></td>
                    <td class="amount"><strong>$${ytd_net.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        <div class="confidential">
            This document contains confidential and proprietary information.<br>
            Questions regarding this pay statement should be directed to Human Resources.<br>
            Generated on ${new Date().toLocaleString()} | ${company_info.name} Payroll System
        </div>
    </div>
</body>
</html>`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { payroll_period_id, employee_ids, generate_pdf = true, email_to_employees = false } = await req.json();

    console.log(`Generating pay stubs for period: ${payroll_period_id}`);

    // Get payroll period details
    const { data: period, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', payroll_period_id)
      .single();

    if (periodError || !period) {
      throw new Error(`Payroll period not found: ${periodError?.message}`);
    }

    // Get company information
    const { data: company, error: companyError } = await supabase
      .from('company_settings')
      .select('company_name, address, ein')
      .eq('id', period.company_id)
      .single();

    if (companyError || !company) {
      throw new Error(`Company information not found: ${companyError?.message}`);
    }

    // Get payroll calculations
    let calculationsQuery = supabase
      .from('payroll_calculations')
      .select(`
        *,
        payroll_employees!inner(
          id,
          instructor_name,
          address,
          ssn_last4,
          employee_id
        )
      `)
      .eq('payroll_period_id', payroll_period_id);

    if (employee_ids && employee_ids.length > 0) {
      calculationsQuery = calculationsQuery.in('payroll_employee_id', employee_ids);
    }

    const { data: calculations, error: calculationsError } = await calculationsQuery;

    if (calculationsError) {
      throw new Error(`Failed to fetch calculations: ${calculationsError.message}`);
    }

    if (!calculations || calculations.length === 0) {
      throw new Error('No payroll calculations found for the specified criteria');
    }

    const generatedStubs = [];
    const failedStubs = [];

    // Generate pay stub for each employee
    for (const calc of calculations) {
      try {
        const payStubData: PayStubData = {
          employee_id: calc.payroll_employees.id,
          employee_name: calc.payroll_employees.instructor_name,
          pay_period_start: period.start_date,
          pay_period_end: period.end_date,
          pay_date: period.pay_date || period.end_date,
          gross_pay: calc.gross_pay,
          net_pay: calc.net_pay,
          federal_withholding: calc.federal_withholding,
          state_withholding: calc.state_withholding,
          fica_withholding: calc.fica_withholding,
          medicare_withholding: calc.medicare_withholding,
          other_deductions: 0,
          ytd_gross: calc.gross_pay * 26, // Approximate YTD
          ytd_net: calc.net_pay * 26,
          ytd_federal: calc.federal_withholding * 26,
          ytd_state: calc.state_withholding * 26,
          company_info: {
            name: company.company_name,
            address: company.address || '123 Main St, City, State 12345',
            ein: company.ein || '12-3456789'
          },
          employee_info: {
            address: calc.payroll_employees.address || '456 Employee St, City, State 12345',
            ssn_last4: calc.payroll_employees.ssn_last4 || '1234',
            employee_id: calc.payroll_employees.employee_id || calc.payroll_employees.id.slice(-6)
          }
        };

        const htmlContent = PayStubGenerator.generateHTML(payStubData);

        // Create pay stub record
        const { data: payStub, error: insertError } = await supabase
          .from('pay_stubs')
          .insert({
            employee_id: calc.payroll_employees.id,
            payroll_period_id: payroll_period_id,
            company_id: period.company_id,
            pay_date: period.pay_date || period.end_date,
            gross_pay: calc.gross_pay,
            net_pay: calc.net_pay,
            deductions: calc.total_withholdings,
            html_content: htmlContent,
            status: 'generated',
            generated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error creating pay stub for ${calc.payroll_employees.instructor_name}:`, insertError);
          failedStubs.push({
            employee_name: calc.payroll_employees.instructor_name,
            error: insertError.message
          });
          continue;
        }

        generatedStubs.push({
          pay_stub_id: payStub.id,
          employee_name: calc.payroll_employees.instructor_name,
          employee_id: calc.payroll_employees.id,
          gross_pay: calc.gross_pay,
          net_pay: calc.net_pay,
          html_content: generate_pdf ? null : htmlContent // Don't return HTML if PDF requested
        });

        console.log(`✅ Generated pay stub for ${calc.payroll_employees.instructor_name}: $${calc.net_pay.toFixed(2)}`);

      } catch (error) {
        console.error(`Error generating pay stub for employee:`, error);
        failedStubs.push({
          employee_name: calc.payroll_employees?.instructor_name || 'Unknown',
          error: error.message
        });
      }
    }

    // Update payroll period status
    if (generatedStubs.length > 0) {
      await supabase
        .from('payroll_periods')
        .update({
          pay_stubs_generated: true,
          pay_stubs_generated_at: new Date().toISOString()
        })
        .eq('id', payroll_period_id);
    }

    console.log(`✅ Pay stub generation completed: ${generatedStubs.length} success, ${failedStubs.length} failed`);

    return new Response(JSON.stringify({
      success: true,
      generated_count: generatedStubs.length,
      failed_count: failedStubs.length,
      pay_stubs: generatedStubs,
      errors: failedStubs,
      summary: {
        period_name: period.period_name,
        pay_date: period.pay_date || period.end_date,
        total_processed: calculations.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Pay stub generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Pay stub generation failed',
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});