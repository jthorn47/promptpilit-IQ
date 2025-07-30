/**
 * Compliance Management Service
 * Handles meal waivers, compliance policies, and violation tracking
 */

import { supabase } from "@/integrations/supabase/client";
import { CompliancePolicy, EmployeeMealWaiver, ComplianceResult } from "./ComplianceEngine";

export interface ComplianceViolation {
  id: string;
  employee_id: string;
  company_id: string;
  date: string;
  violation_type: 'meal_missing' | 'meal_late' | 'meal_short' | 'rest_missing';
  severity: 'low' | 'medium' | 'high';
  penalty_applied: boolean;
  penalty_amount: number;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  notes: string;
  created_at: string;
}

export interface ComplianceAlert {
  id: string;
  company_id: string;
  alert_type: 'violation_threshold' | 'policy_change' | 'waiver_expiry';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  employee_ids: string[];
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export class ComplianceService {
  /**
   * Create or update a meal waiver for an employee
   */
  static async createMealWaiver(
    waiver: Omit<EmployeeMealWaiver, 'signed_date'>
  ): Promise<EmployeeMealWaiver> {
    const newWaiver: EmployeeMealWaiver = {
      ...waiver,
      signed_date: new Date().toISOString()
    };

    console.log(`Creating meal waiver for employee ${waiver.employee_id}: ${waiver.waiver_type}`);

    // TODO: Store in database when meal_waivers table is available
    // const { data, error } = await supabase
    //   .from('meal_waivers')
    //   .insert(newWaiver)
    //   .select()
    //   .single();

    return newWaiver;
  }

  /**
   * Get active meal waivers for a company
   */
  static async getActiveMealWaivers(companyId: string): Promise<EmployeeMealWaiver[]> {
    console.log(`Fetching active meal waivers for company ${companyId}`);

    // TODO: Implement when meal_waivers table is available
    // const { data, error } = await supabase
    //   .from('meal_waivers')
    //   .select('*')
    //   .eq('company_id', companyId)
    //   .eq('is_active', true);

    // For now, return empty array
    return [];
  }

  /**
   * Revoke a meal waiver
   */
  static async revokeMealWaiver(
    employeeId: string,
    companyId: string,
    reason: string
  ): Promise<void> {
    console.log(`Revoking meal waiver for employee ${employeeId}: ${reason}`);

    // TODO: Implement when meal_waivers table is available
    // const { error } = await supabase
    //   .from('meal_waivers')
    //   .update({ 
    //     is_active: false, 
    //     expiry_date: new Date().toISOString(),
    //     notes: reason 
    //   })
    //   .eq('employee_id', employeeId)
    //   .eq('company_id', companyId)
    //   .eq('is_active', true);
  }

  /**
   * Get or create compliance policy for a company
   */
  static async getCompliancePolicy(companyId: string): Promise<CompliancePolicy> {
    console.log(`Fetching compliance policy for company ${companyId}`);

    try {
      // Try to get from company settings
      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companySettings) {
        // Extract state from company settings if available
        const state = companySettings.state || 'CA';
        return this.buildPolicyFromSettings(companyId, state, companySettings);
      }
    } catch (error) {
      console.warn('Could not fetch company settings, using default policy:', error);
    }

    // Return default CA policy
    return {
      company_id: companyId,
      state: 'CA',
      meal_duration_minutes: 30,
      meal_deadline_hours: 5,
      rest_break_minutes: 10,
      rest_break_frequency_hours: 4,
      premium_pay_enabled: true,
      meal_waiver_enabled: true,
      auto_deduct_meals: false,
      require_punch_for_breaks: false
    };
  }

  /**
   * Update compliance policy for a company
   */
  static async updateCompliancePolicy(policy: CompliancePolicy): Promise<void> {
    console.log(`Updating compliance policy for company ${policy.company_id}`);

    // TODO: Store in dedicated compliance_policies table
    // For now, log the policy that would be stored
    console.log('Would store compliance policy:', policy);
  }

  /**
   * Record a compliance violation
   */
  static async recordViolation(
    employeeId: string,
    companyId: string,
    complianceResult: ComplianceResult
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Create violations for each non-compliant period
    complianceResult.violation_reasons.forEach(reason => {
      const violation: ComplianceViolation = {
        id: crypto.randomUUID(),
        employee_id: employeeId,
        company_id: companyId,
        date: complianceResult.date,
        violation_type: reason as any,
        severity: this.calculateViolationSeverity(reason),
        penalty_applied: complianceResult.premium_applied,
        penalty_amount: complianceResult.penalty_hours,
        resolved: false,
        notes: complianceResult.notes.join('; '),
        created_at: new Date().toISOString()
      };

      violations.push(violation);
    });

    console.log(`Recording ${violations.length} compliance violations for ${employeeId}`);

    // TODO: Store in compliance_violations table
    // const { error } = await supabase
    //   .from('compliance_violations')
    //   .insert(violations);

    return violations;
  }

  /**
   * Get compliance violations for reporting
   */
  static async getViolations(
    companyId: string,
    startDate?: string,
    endDate?: string,
    employeeId?: string
  ): Promise<ComplianceViolation[]> {
    console.log(`Fetching compliance violations for company ${companyId}`);

    // TODO: Implement when compliance_violations table is available
    // let query = supabase
    //   .from('compliance_violations')
    //   .select('*')
    //   .eq('company_id', companyId);

    // if (startDate) query = query.gte('date', startDate);
    // if (endDate) query = query.lte('date', endDate);
    // if (employeeId) query = query.eq('employee_id', employeeId);

    // const { data, error } = await query.order('date', { ascending: false });

    return [];
  }

  /**
   * Resolve a compliance violation
   */
  static async resolveViolation(
    violationId: string,
    resolvedBy: string,
    notes: string
  ): Promise<void> {
    console.log(`Resolving compliance violation ${violationId} by ${resolvedBy}`);

    // TODO: Implement when compliance_violations table is available
    // const { error } = await supabase
    //   .from('compliance_violations')
    //   .update({
    //     resolved: true,
    //     resolved_by: resolvedBy,
    //     resolved_at: new Date().toISOString(),
    //     notes: notes
    //   })
    //   .eq('id', violationId);
  }

  /**
   * Create compliance alert
   */
  static async createAlert(
    companyId: string,
    alertType: ComplianceAlert['alert_type'],
    title: string,
    message: string,
    severity: ComplianceAlert['severity'],
    employeeIds: string[] = []
  ): Promise<ComplianceAlert> {
    const alert: ComplianceAlert = {
      id: crypto.randomUUID(),
      company_id: companyId,
      alert_type: alertType,
      title,
      message,
      severity,
      employee_ids: employeeIds,
      acknowledged: false,
      created_at: new Date().toISOString()
    };

    console.log(`Creating compliance alert: ${title} (${severity})`);

    // TODO: Store in compliance_alerts table
    // const { error } = await supabase
    //   .from('compliance_alerts')
    //   .insert(alert);

    return alert;
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    summary: {
      total_violations: number;
      penalty_hours: number;
      compliance_rate: number;
      top_violation_types: { type: string; count: number }[];
    };
    violations: ComplianceViolation[];
    recommendations: string[];
  }> {
    console.log(`Generating compliance report for ${companyId} from ${startDate} to ${endDate}`);

    const violations = await this.getViolations(companyId, startDate, endDate);

    const summary = {
      total_violations: violations.length,
      penalty_hours: violations.reduce((sum, v) => sum + v.penalty_amount, 0),
      compliance_rate: 95, // TODO: Calculate actual rate
      top_violation_types: this.calculateTopViolationTypes(violations)
    };

    const recommendations = this.generateRecommendations(violations);

    return {
      summary,
      violations,
      recommendations
    };
  }

  /**
   * Check for waiver expiries and create alerts
   */
  static async checkWaiverExpiries(companyId: string): Promise<void> {
    const waivers = await this.getActiveMealWaivers(companyId);
    const expiringWaivers = waivers.filter(waiver => {
      if (!waiver.expiry_date) return false;
      const expiryDate = new Date(waiver.expiry_date);
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 30); // 30 days warning
      return expiryDate <= warningDate;
    });

    if (expiringWaivers.length > 0) {
      await this.createAlert(
        companyId,
        'waiver_expiry',
        'Meal Waivers Expiring Soon',
        `${expiringWaivers.length} meal waivers will expire within 30 days`,
        'warning',
        expiringWaivers.map(w => w.employee_id)
      );
    }
  }

  // Private helper methods

  private static buildPolicyFromSettings(
    companyId: string,
    state: string,
    settings: any
  ): CompliancePolicy {
    return {
      company_id: companyId,
      state,
      meal_duration_minutes: settings.meal_duration_minutes || 30,
      meal_deadline_hours: 5,
      rest_break_minutes: 10,
      rest_break_frequency_hours: 4,
      premium_pay_enabled: settings.premium_pay_enabled !== false,
      meal_waiver_enabled: settings.meal_waiver_enabled !== false,
      auto_deduct_meals: settings.auto_deduct_meals || false,
      require_punch_for_breaks: settings.require_punch_for_breaks || false
    };
  }

  private static calculateViolationSeverity(violationType: string): 'low' | 'medium' | 'high' {
    if (violationType.includes('missing')) return 'high';
    if (violationType.includes('late')) return 'medium';
    return 'low';
  }

  private static calculateTopViolationTypes(violations: ComplianceViolation[]): { type: string; count: number }[] {
    const counts = violations.reduce((acc, violation) => {
      acc[violation.violation_type] = (acc[violation.violation_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private static generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];
    const violationTypes = violations.map(v => v.violation_type);

    if (violationTypes.includes('meal_missing')) {
      recommendations.push('Consider implementing automatic meal deductions for shifts over 5 hours');
    }

    if (violationTypes.includes('meal_late')) {
      recommendations.push('Add meal reminders at the 4.5 hour mark');
    }

    if (violations.length > 10) {
      recommendations.push('Review current break and meal policies with management');
    }

    return recommendations;
  }
}