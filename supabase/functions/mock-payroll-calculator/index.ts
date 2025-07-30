import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MockPayrollRequest {
  employee_id: string
  hourly_rate: number
  hours_worked: number
  pre_tax_deductions?: number
  overtime_hours?: number
  pay_period_start: string
  pay_period_end: string
}

interface MockPayrollResponse {
  employee_id: string
  gross_pay: number
  fica: number
  medicare: number
  federal_tax: number
  state_tax: number
  net_pay: number
  calculation_source: string
  metadata: {
    engine_type: 'mock'
    calculation_date: string
    warning: string
  }
}

function calculateMockPayroll(input: MockPayrollRequest): MockPayrollResponse {
  const { employee_id, hourly_rate, hours_worked, pre_tax_deductions = 0, overtime_hours = 0 } = input
  
  // Calculate gross pay (regular + overtime)
  const regular_hours = Math.max(0, hours_worked - overtime_hours)
  const overtime_rate = hourly_rate * 1.5
  const gross_pay = (regular_hours * hourly_rate) + (overtime_hours * overtime_rate)
  
  // Calculate taxable income after pre-tax deductions
  const taxable_income = gross_pay - pre_tax_deductions
  
  // Mock tax calculations (simplified rates)
  const fica = taxable_income * 0.062 // 6.2% Social Security
  const medicare = taxable_income * 0.0145 // 1.45% Medicare
  const federal_tax = taxable_income * 0.12 // Flat 12% federal estimate
  const state_tax = taxable_income * 0.05 // Flat 5% state estimate
  
  const total_taxes = fica + medicare + federal_tax + state_tax
  const net_pay = gross_pay - pre_tax_deductions - total_taxes
  
  return {
    employee_id,
    gross_pay: Math.round(gross_pay * 100) / 100,
    fica: Math.round(fica * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    federal_tax: Math.round(federal_tax * 100) / 100,
    state_tax: Math.round(state_tax * 100) / 100,
    net_pay: Math.round(net_pay * 100) / 100,
    calculation_source: 'MockPayrollEngine',
    metadata: {
      engine_type: 'mock',
      calculation_date: new Date().toISOString(),
      warning: 'Mock calculation - NOT for production payroll or tax filing'
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const body = await req.json()
      
      if (Array.isArray(body)) {
        // Batch calculation
        const results = body.map(calculateMockPayroll)
        
        // Log audit trail for batch calculation
        const auditPromises = results.map(result => 
          supabase.from('audit_logs').insert({
            action_type: 'payroll_calculation',
            resource_type: 'mock_payroll_calculation',
            resource_id: result.employee_id,
            new_values: result,
            details: `Mock payroll calculation for employee ${result.employee_id}`,
            status: 'success'
          })
        )
        
        await Promise.all(auditPromises)
        
        return new Response(
          JSON.stringify({ calculations: results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Single calculation
        const result = calculateMockPayroll(body)
        
        // Log audit trail
        await supabase.from('audit_logs').insert({
          action_type: 'payroll_calculation',
          resource_type: 'mock_payroll_calculation',
          resource_id: result.employee_id,
          new_values: result,
          details: `Mock payroll calculation for employee ${result.employee_id}`,
          status: 'success'
        })
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Mock payroll calculation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        calculation_source: 'MockPayrollEngine',
        metadata: {
          engine_type: 'mock',
          error_date: new Date().toISOString()
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})