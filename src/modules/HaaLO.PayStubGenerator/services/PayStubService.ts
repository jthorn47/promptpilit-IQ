/**
 * Pay Stub Service for HaaLO Pay Stub Generator Module
 * Note: Using mock data until database tables are created
 */

import type {
  PayStub,
  PayStubGenerationRequest,
  PayStubGenerationResult,
  PayStubSearchFilters,
  PayStubMetrics,
  PayStubAccessLog,
  PayStubBatchOperation
} from '../types';

export class PayStubService {
  /**
   * Get pay stubs with optional filtering
   */
  static async getPayStubs(filters?: PayStubSearchFilters): Promise<PayStub[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Enhanced mock pay stubs data with legal compliance
      const mockPayStubs: PayStub[] = [
        {
          id: '1',
          employee_id: 'emp_001',
          payroll_period_id: 'period_001',
          payroll_calculation_id: 'calc_001',
          company_id: 'company_001',
          stub_number: '2024-001-PS0001',
          pay_period_start: '2024-01-01',
          pay_period_end: '2024-01-15',
          pay_date: '2024-01-19',
          
          // Employee Information (Legally Required)
          employee_name: 'John Smith',
          employee_ssn_last_four: '1234',
          employee_id_number: 'EMP-001',
          employee_address: {
            street: '123 Main St',
            city: 'Los Angeles',
            state: 'CA',
            zip_code: '90210'
          },
          
          // Employer Information (Legally Required)
          employer_legal_name: 'Acme Corporation',
          employer_address: {
            legal_name: 'Acme Corporation',
            street: '456 Business Ave',
            city: 'Los Angeles',
            state: 'CA',
            zip_code: '90211',
            phone: '(555) 123-4567'
          },
          employer_ein: '12-3456789',
          employer_phone: '(555) 123-4567',
          
          // Pay Information (Legally Required)
          regular_hours: 80,
          regular_rate: 62.50,
          overtime_hours: 5,
          overtime_rate: 93.75,
          double_time_hours: 0,
          double_time_rate: 0,
          
          // Pay Totals
          gross_pay: 5468.75,
          net_pay: 3750.00,
          total_deductions: 968.75,
          total_taxes: 750.00,
          
          // YTD Totals (Legally Required)
          ytd_gross_pay: 16406.25,
          ytd_net_pay: 11250.00,
          ytd_taxes: 2250.00,
          ytd_deductions: 2906.25,
          
          // Enhanced Earnings Breakdown
          earnings_breakdown: [
            {
              code: 'REG',
              description: 'Regular Hours',
              hours: 80,
              rate: 62.50,
              amount: 5000.00,
              ytd_amount: 15000.00,
              type: 'regular',
              is_taxable: true
            },
            {
              code: 'OT',
              description: 'Overtime Hours',
              hours: 5,
              rate: 93.75,
              amount: 468.75,
              ytd_amount: 1406.25,
              type: 'overtime',
              is_taxable: true,
              state_specific_notes: 'CA overtime rate 1.5x'
            }
          ],
          
          // Enhanced Deductions Breakdown
          deductions_breakdown: [
            {
              code: 'HEALTH',
              description: 'Health Insurance Premium',
              amount: 300.00,
              ytd_amount: 900.00,
              is_pre_tax: true,
              type: 'benefits',
              is_legally_required: false,
              category: 'voluntary'
            },
            {
              code: '401K',
              description: '401(k) Contribution',
              amount: 200.00,
              ytd_amount: 600.00,
              is_pre_tax: true,
              type: 'retirement',
              is_legally_required: false,
              category: 'voluntary'
            },
            {
              code: 'HSA',
              description: 'Health Savings Account',
              amount: 150.00,
              ytd_amount: 450.00,
              is_pre_tax: true,
              type: 'hsa_fsa',
              is_legally_required: false,
              category: 'voluntary'
            },
            {
              code: 'DENTAL',
              description: 'Dental Insurance Premium',
              amount: 50.00,
              ytd_amount: 150.00,
              is_pre_tax: true,
              type: 'benefits',
              is_legally_required: false,
              category: 'voluntary'
            },
            {
              code: 'VISION',
              description: 'Vision Insurance Premium',
              amount: 25.00,
              ytd_amount: 75.00,
              is_pre_tax: true,
              type: 'benefits',
              is_legally_required: false,
              category: 'voluntary'
            },
            {
              code: 'LIFE',
              description: 'Life Insurance Premium',
              amount: 15.00,
              ytd_amount: 45.00,
              is_pre_tax: false,
              type: 'benefits',
              is_legally_required: false,
              category: 'voluntary'
            }
          ],
          
          // Enhanced Taxes Breakdown
          taxes_breakdown: [
            {
              code: 'FED',
              description: 'Federal Income Tax',
              amount: 400.00,
              ytd_amount: 1200.00,
              tax_type: 'federal',
              rate: 12.0,
              taxable_wages: 4818.75
            },
            {
              code: 'CA_SIT',
              description: 'CA State Income Tax',
              amount: 145.00,
              ytd_amount: 435.00,
              tax_type: 'state',
              rate: 3.0,
              taxable_wages: 4818.75
            },
            {
              code: 'FICA_SS',
              description: 'Social Security Tax',
              amount: 339.07,
              ytd_amount: 1017.19,
              tax_type: 'fica_ss',
              rate: 6.2,
              taxable_wages: 5468.75
            },
            {
              code: 'FICA_MED',
              description: 'Medicare Tax',
              amount: 79.30,
              ytd_amount: 237.90,
              tax_type: 'fica_medicare',
              rate: 1.45,
              taxable_wages: 5468.75
            },
            {
              code: 'CA_SDI',
              description: 'CA State Disability Insurance',
              amount: 54.69,
              ytd_amount: 164.06,
              tax_type: 'sdi',
              rate: 1.0,
              taxable_wages: 5468.75
            }
          ],
          
          // Employer Contributions
          employer_contributions: [
            {
              code: 'EMP_HEALTH',
              description: 'Employer Health Insurance Contribution',
              amount: 450.00,
              ytd_amount: 1350.00,
              type: 'health_insurance',
              is_taxable_to_employee: false
            },
            {
              code: 'EMP_401K',
              description: 'Employer 401(k) Match',
              amount: 100.00,
              ytd_amount: 300.00,
              type: 'retirement_match',
              is_taxable_to_employee: false
            },
            {
              code: 'EMP_LIFE',
              description: 'Employer Life Insurance Premium',
              amount: 25.00,
              ytd_amount: 75.00,
              type: 'life_insurance',
              is_taxable_to_employee: false
            }
          ],
          
          // Leave Balances (State-Specific Requirements)
          pto_balance: 120.0,
          sick_leave_balance: 40.0, // Required in CA
          vacation_balance: 80.0,
          
          // Payment Method
          direct_deposit_breakdown: [
            {
              account_type: 'checking',
              account_last_four: '1234',
              bank_name: 'First National Bank',
              routing_number_last_four: '5678',
              amount: 3750.00,
              percentage: 100,
              is_remainder: true,
              bank_verification_status: 'verified'
            }
          ],
          
          // Compliance & Metadata
          state_jurisdiction: 'CA',
          status: 'generated',
          metadata: {
            compliance_version: '2024.1',
            state_jurisdiction: 'CA',
            local_jurisdictions: ['Los Angeles County'],
            ada_compliant: true,
            generation_source: 'automatic'
          },
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z',
          created_by: 'admin_001'
        }
      ];

      // Apply filters
      let filteredStubs = mockPayStubs;
      if (filters?.employee_name) {
        // Mock filtering - in real implementation, this would be done in the query
      }
      if (filters?.pay_date_start) {
        filteredStubs = filteredStubs.filter(stub => stub.pay_date >= filters.pay_date_start!);
      }
      if (filters?.pay_date_end) {
        filteredStubs = filteredStubs.filter(stub => stub.pay_date <= filters.pay_date_end!);
      }
      if (filters?.status) {
        filteredStubs = filteredStubs.filter(stub => stub.status === filters.status);
      }

      return filteredStubs;
    } catch (error) {
      console.error('Error fetching pay stubs:', error);
      throw error;
    }
  }

  /**
   * Get single pay stub by ID
   */
  static async getPayStub(stubId: string): Promise<PayStub> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return first mock pay stub
      const stubs = await this.getPayStubs();
      const stub = stubs.find(s => s.id === stubId) || stubs[0];
      
      if (!stub) {
        throw new Error('Pay stub not found');
      }

      return stub;
    } catch (error) {
      console.error('Error fetching pay stub:', error);
      throw error;
    }
  }

  /**
   * Get pay stubs for specific employee
   */
  static async getEmployeePayStubs(employeeId: string): Promise<PayStub[]> {
    try {
      const allStubs = await this.getPayStubs();
      return allStubs.filter(stub => stub.employee_id === employeeId);
    } catch (error) {
      console.error('Error fetching employee pay stubs:', error);
      throw error;
    }
  }

  /**
   * Generate pay stubs for payroll period
   */
  static async generatePayStubs(request: PayStubGenerationRequest): Promise<PayStubGenerationResult> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock generation result
      const result: PayStubGenerationResult = {
        success: true,
        generated_count: request.employee_ids?.length || 42,
        failed_count: 0,
        pay_stub_ids: Array.from({ length: request.employee_ids?.length || 42 }, (_, i) => `stub_${i + 1}`),
        errors: []
      };

      return result;
    } catch (error) {
      console.error('Error generating pay stubs:', error);
      throw error;
    }
  }

  /**
   * Get pay stub access logs
   */
  static async getPayStubAccessLogs(stubId: string): Promise<PayStubAccessLog[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      return [
        {
          id: '1',
          pay_stub_id: stubId,
          accessed_by: 'user_001',
          access_type: 'view',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          accessed_at: '2024-01-18T14:30:00Z',
          company_id: 'company_001'
        }
      ];
    } catch (error) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
  }

  /**
   * Log pay stub access
   */
  static async logPayStubAccess(
    stubId: string, 
    accessType: 'view' | 'download' | 'email',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Mock logging - in real implementation, this would insert into database
      console.log(`Logged ${accessType} access for pay stub ${stubId}`, metadata);
    } catch (error) {
      console.error('Error logging pay stub access:', error);
      throw error;
    }
  }

  /**
   * Download pay stub as PDF
   */
  static async downloadPayStubPDF(stubId: string): Promise<Blob> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock PDF content
      const pdfContent = `Mock PDF content for pay stub ${stubId}`;
      return new Blob([pdfContent], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error downloading pay stub PDF:', error);
      throw error;
    }
  }

  /**
   * Get pay stub metrics
   */
  static async getPayStubMetrics(
    companyId: string, 
    dateRange?: { start: string; end: string }
  ): Promise<PayStubMetrics> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock metrics
      return {
        total_generated: 156,
        total_downloaded: 89,
        total_viewed: 142,
        generation_date_range: dateRange || {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        average_gross_pay: 4750.00,
        total_payroll_amount: 741000.00,
        employee_count: 156
      };
    } catch (error) {
      console.error('Error fetching pay stub metrics:', error);
      throw error;
    }
  }

  /**
   * Perform batch operation on pay stubs
   */
  static async performBatchOperation(operation: PayStubBatchOperation): Promise<{ success: boolean }> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      switch (operation.operation) {
        case 'download':
          // Mock bulk download
          console.log(`Downloading ${operation.pay_stub_ids.length} pay stubs`);
          break;
        case 'email':
          // Mock bulk email
          console.log(`Emailing ${operation.pay_stub_ids.length} pay stubs`);
          break;
        case 'regenerate':
          // Mock bulk regeneration
          console.log(`Regenerating ${operation.pay_stub_ids.length} pay stubs`);
          break;
      }

      return { success: true };
    } catch (error) {
      console.error('Error performing batch operation:', error);
      throw error;
    }
  }

  /**
   * Health check for pay stub service
   */
  static async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; message: string }> {
    try {
      // Mock health check
      return {
        status: 'healthy',
        message: 'All services operational'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Service unavailable'
      };
    }
  }

  /**
   * Perform compliance check on pay stub
   */
  static async performComplianceCheck(stubId: string, state?: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock compliance check results
      const complianceResult = {
        stub_id: stubId,
        is_compliant: true,
        federal_compliance: true,
        state_compliance: true,
        ada_compliance: true,
        missing_fields: [],
        warnings: [],
        recommendations: [
          'Consider adding employer UBI number for Washington state compliance',
          'Ensure sick leave balance is displayed for California employees'
        ],
        last_checked_at: new Date().toISOString(),
        state_jurisdiction: state || 'CA',
        compliance_version: '2024.1'
      };

      return complianceResult;
    } catch (error) {
      console.error('Error performing compliance check:', error);
      throw error;
    }
  }

  /**
   * Generate state-specific pay stub format
   */
  static async generateStateSpecificFormat(stubId: string, stateCode: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const stateRequirements = {
        'CA': {
          required_fields: ['sick_leave_balance', 'overtime_breakdown', 'employer_contributions'],
          disclaimers: ['This pay stub complies with California Labor Code Section 226'],
          special_formatting: 'california_format'
        },
        'NY': {
          required_fields: ['employer_phone', 'overtime_breakdown'],
          disclaimers: ['This pay stub complies with New York Labor Law'],
          special_formatting: 'new_york_format'
        },
        'WA': {
          required_fields: ['sick_leave_balance', 'employer_uBI'],
          disclaimers: ['This pay stub complies with Washington State wage statement requirements'],
          special_formatting: 'washington_format'
        },
        'IL': {
          required_fields: ['overtime_breakdown', 'itemized_hours'],
          disclaimers: ['This pay stub complies with Illinois wage statement requirements'],
          special_formatting: 'illinois_format'
        }
      };

      return {
        state_code: stateCode,
        requirements: stateRequirements[stateCode as keyof typeof stateRequirements] || stateRequirements['CA'],
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating state-specific format:', error);
      throw error;
    }
  }

  /**
   * Validate ADA compliance
   */
  static async validateADACompliance(stubId: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        is_ada_compliant: true,
        accessibility_score: 98,
        issues: [],
        recommendations: [
          'Ensure PDF has proper heading structure',
          'Verify color contrast meets WCAG 2.1 AA standards',
          'Include alt text for any images or logos'
        ],
        last_validated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error validating ADA compliance:', error);
      throw error;
    }
  }
}