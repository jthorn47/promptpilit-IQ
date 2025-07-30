export interface MockPayrollCalculationInput {
  employee_id: string
  hourly_rate: number
  hours_worked: number
  pre_tax_deductions?: number
  overtime_hours?: number
  pay_period_start: string
  pay_period_end: string
}

export interface MockPayrollCalculationOutput {
  employee_id: string
  gross_pay: number
  fica: number
  medicare: number
  federal_tax: number
  state_tax: number
  net_pay: number
  calculation_source: 'MockPayrollEngine'
  metadata: {
    engine_type: 'mock'
    calculation_date: string
    warning: string
  }
}

export interface MockPayrollBatchResponse {
  calculations: MockPayrollCalculationOutput[]
}

export type PayrollEngineSource = 'mock' | 'taxiq'

export interface PayrollEngineConfig {
  engine_source: PayrollEngineSource
  fallback_enabled: boolean
  mock_engine_url?: string
}