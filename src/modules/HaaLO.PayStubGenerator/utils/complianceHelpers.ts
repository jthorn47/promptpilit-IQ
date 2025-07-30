/**
 * Compliance helper utilities for pay stub generation
 * Ensures federal and state-specific legal requirements are met
 */

import { PayStub, StateSpecificSettings } from '../types';

export const FEDERAL_REQUIRED_FIELDS = [
  'employee_name',
  'employer_legal_name',
  'employer_ein',
  'pay_period_start',
  'pay_period_end',
  'pay_date',
  'gross_pay',
  'net_pay',
  'total_taxes',
  'earnings_breakdown',
  'taxes_breakdown'
];

export const STATE_REQUIREMENTS: Record<string, StateSpecificSettings> = {
  'CA': {
    state_code: 'CA',
    show_sick_leave_balance: true,
    show_overtime_breakdown: true,
    show_employer_uBI: false,
    required_disclaimers: [
      'This pay stub complies with California Labor Code Section 226',
      'Paid sick leave balance is provided as required by California law'
    ],
    wage_statement_frequency: 'semi-monthly'
  },
  'NY': {
    state_code: 'NY',
    show_sick_leave_balance: true,
    show_overtime_breakdown: true,
    show_employer_uBI: false,
    required_disclaimers: [
      'This pay stub complies with New York Labor Law',
      'Employer phone number and address provided as required'
    ],
    wage_statement_frequency: 'semi-monthly'
  },
  'WA': {
    state_code: 'WA',
    show_sick_leave_balance: true,
    show_overtime_breakdown: false,
    show_employer_uBI: true,
    required_disclaimers: [
      'This pay stub complies with Washington State wage statement requirements',
      'Paid sick leave balance provided as required by state law'
    ],
    wage_statement_frequency: 'semi-monthly'
  },
  'IL': {
    state_code: 'IL',
    show_sick_leave_balance: false,
    show_overtime_breakdown: true,
    show_employer_uBI: false,
    required_disclaimers: [
      'This pay stub complies with Illinois wage statement requirements',
      'Hours and rates are itemized as required by state law'
    ],
    wage_statement_frequency: 'semi-monthly'
  },
  'TX': {
    state_code: 'TX',
    show_sick_leave_balance: false,
    show_overtime_breakdown: false,
    show_employer_uBI: false,
    required_disclaimers: [
      'This pay stub complies with Texas Labor Code requirements'
    ],
    wage_statement_frequency: 'semi-monthly'
  },
  'FL': {
    state_code: 'FL',
    show_sick_leave_balance: false,
    show_overtime_breakdown: false,
    show_employer_uBI: false,
    required_disclaimers: [
      'This pay stub complies with Florida wage statement requirements'
    ],
    wage_statement_frequency: 'semi-monthly'
  }
};

export function validateFederalCompliance(payStub: PayStub): {
  isCompliant: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check required federal fields
  FEDERAL_REQUIRED_FIELDS.forEach(field => {
    const value = (payStub as any)[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  });

  // Validate EIN format
  if (payStub.employer_ein && !/^\d{2}-\d{7}$/.test(payStub.employer_ein)) {
    warnings.push('EIN should be in format XX-XXXXXXX');
  }

  // Check for proper tax breakdowns
  if (!payStub.taxes_breakdown.some(tax => tax.tax_type === 'federal')) {
    warnings.push('Federal income tax withholding should be shown');
  }

  if (!payStub.taxes_breakdown.some(tax => tax.tax_type === 'fica_ss')) {
    warnings.push('Social Security tax withholding should be shown');
  }

  if (!payStub.taxes_breakdown.some(tax => tax.tax_type === 'fica_medicare')) {
    warnings.push('Medicare tax withholding should be shown');
  }

  // Validate overtime calculations
  if (payStub.overtime_hours && payStub.overtime_hours > 0) {
    if (!payStub.overtime_rate || payStub.overtime_rate < payStub.regular_rate * 1.5) {
      warnings.push('Overtime rate should be at least 1.5x regular rate per FLSA');
    }
  }

  return {
    isCompliant: missingFields.length === 0,
    missingFields,
    warnings
  };
}

export function validateStateCompliance(payStub: PayStub, stateCode: string): {
  isCompliant: boolean;
  missingFields: string[];
  warnings: string[];
  recommendations: string[];
} {
  const requirements = STATE_REQUIREMENTS[stateCode];
  const missingFields: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!requirements) {
    warnings.push(`State compliance rules not defined for ${stateCode}`);
    return { isCompliant: false, missingFields, warnings, recommendations };
  }

  // California specific requirements
  if (stateCode === 'CA') {
    // Sick leave balance required
    if (requirements.show_sick_leave_balance && payStub.sick_leave_balance === undefined) {
      missingFields.push('sick_leave_balance');
    }

    // Overtime breakdown required
    if (requirements.show_overtime_breakdown && payStub.overtime_hours && payStub.overtime_hours > 0) {
      if (!payStub.earnings_breakdown.some(earning => earning.type === 'overtime')) {
        missingFields.push('overtime_earnings_breakdown');
      }
    }

    // Check for all deductions clearly listed
    if (payStub.deductions_breakdown.length > 0) {
      payStub.deductions_breakdown.forEach(deduction => {
        if (!deduction.description || deduction.description.trim() === '') {
          warnings.push('All deductions must have clear descriptions (CA Labor Code 226)');
        }
      });
    }
  }

  // New York specific requirements
  if (stateCode === 'NY') {
    // Employer phone number required
    if (!payStub.employer_phone) {
      missingFields.push('employer_phone');
    }

    // Clear overtime breakdown
    if (payStub.overtime_hours && payStub.overtime_hours > 0) {
      if (!payStub.earnings_breakdown.some(earning => earning.type === 'overtime')) {
        warnings.push('Overtime hours and rates must be clearly itemized');
      }
    }
  }

  // Washington specific requirements
  if (stateCode === 'WA') {
    // Sick leave balance required
    if (requirements.show_sick_leave_balance && payStub.sick_leave_balance === undefined) {
      missingFields.push('sick_leave_balance');
    }

    // UBI number if available
    if (requirements.show_employer_uBI && !payStub.employer_uBI_number) {
      recommendations.push('Consider including employer UBI number for full Washington compliance');
    }
  }

  // Illinois specific requirements
  if (stateCode === 'IL') {
    // Overtime and regular hours must be distinctly itemized
    if (payStub.overtime_hours && payStub.overtime_hours > 0) {
      const hasRegularEarning = payStub.earnings_breakdown.some(earning => earning.type === 'regular');
      const hasOvertimeEarning = payStub.earnings_breakdown.some(earning => earning.type === 'overtime');
      
      if (!hasRegularEarning || !hasOvertimeEarning) {
        missingFields.push('distinct_hour_itemization');
      }
    }
  }

  return {
    isCompliant: missingFields.length === 0,
    missingFields,
    warnings,
    recommendations
  };
}

export function validateADACompliance(payStub: PayStub): {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if metadata indicates ADA compliance
  if (!payStub.metadata.ada_compliant) {
    issues.push('Pay stub not marked as ADA compliant');
  }

  // Recommendations for ADA compliance
  recommendations.push('Ensure PDF has proper heading structure (H1, H2, etc.)');
  recommendations.push('Verify color contrast meets WCAG 2.1 AA standards (4.5:1 ratio)');
  recommendations.push('Include alt text for any images, logos, or graphics');
  recommendations.push('Ensure tabular data has proper table headers');
  recommendations.push('Test with screen readers for accessibility');

  return {
    isCompliant: issues.length === 0,
    issues,
    recommendations
  };
}

export function getRequiredDisclaimers(stateCode: string): string[] {
  const stateRequirements = STATE_REQUIREMENTS[stateCode];
  const baseDisclaimer = 'This pay stub is for informational purposes only and does not constitute a tax document.';
  
  if (stateRequirements) {
    return [baseDisclaimer, ...stateRequirements.required_disclaimers];
  }
  
  return [baseDisclaimer];
}

export function formatComplianceReport(payStub: PayStub) {
  const federalCompliance = validateFederalCompliance(payStub);
  const stateCompliance = validateStateCompliance(payStub, payStub.state_jurisdiction);
  const adaCompliance = validateADACompliance(payStub);

  return {
    overall_compliance: federalCompliance.isCompliant && stateCompliance.isCompliant && adaCompliance.isCompliant,
    federal: federalCompliance,
    state: stateCompliance,
    ada: adaCompliance,
    required_disclaimers: getRequiredDisclaimers(payStub.state_jurisdiction),
    compliance_summary: {
      total_issues: federalCompliance.missingFields.length + stateCompliance.missingFields.length + adaCompliance.issues.length,
      total_warnings: federalCompliance.warnings.length + stateCompliance.warnings.length,
      total_recommendations: stateCompliance.recommendations.length + adaCompliance.recommendations.length
    }
  };
}

export function generateComplianceChecklist(stateCode: string) {
  const federalItems = [
    'Employee full name',
    'Employer legal name and EIN',
    'Pay period dates and pay date',
    'Regular and overtime hours/rates',
    'Gross pay calculation',
    'All tax withholdings (Federal, FICA)',
    'All deductions clearly described',
    'Net pay amount',
    'Year-to-date totals'
  ];

  const stateRequirements = STATE_REQUIREMENTS[stateCode];
  const stateItems: string[] = [];

  if (stateRequirements) {
    if (stateRequirements.show_sick_leave_balance) {
      stateItems.push('Paid sick leave balance');
    }
    if (stateRequirements.show_overtime_breakdown) {
      stateItems.push('Detailed overtime hour/rate breakdown');
    }
    if (stateRequirements.show_employer_uBI) {
      stateItems.push('Employer UBI number');
    }
  }

  const adaItems = [
    'Accessible PDF format',
    'Proper heading structure',
    'Adequate color contrast',
    'Alt text for images',
    'Screen reader compatibility'
  ];

  return {
    federal: federalItems,
    state: stateItems,
    ada: adaItems,
    disclaimers: getRequiredDisclaimers(stateCode)
  };
}