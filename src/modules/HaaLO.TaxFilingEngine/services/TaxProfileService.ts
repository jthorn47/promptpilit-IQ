/**
 * Tax Profile Service
 * Manages company tax configuration and setup
 */

import { supabase } from '@/integrations/supabase/client';
import type { TaxProfile, TaxJurisdiction } from '../types';

export class TaxProfileService {
  /**
   * Get tax profile for a company
   */
  static async getProfile(companyId: string): Promise<TaxProfile | null> {
    const { data, error } = await supabase
      .from('tax_profiles')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tax profile:', error);
      throw new Error('Failed to fetch tax profile');
    }

    if (!data) return null;

    return {
      id: data.id,
      companyId: data.company_id,
      fein: data.fein,
      stateTaxIds: (data.state_tax_ids as Record<string, string>) || {},
      localJurisdictions: (data.local_jurisdictions as unknown as TaxJurisdiction[]) || [],
      futaNumber: data.futa_number as string,
      sutaNumbers: (data.suta_numbers as Record<string, string>) || {},
      federalDepositFrequency: data.federal_deposit_frequency as "monthly" | "semi-weekly" | "quarterly",
      stateDepositFrequencies: (data.state_deposit_frequencies as Record<string, string>) || {},
      efilingEnabled: data.efiling_enabled,
      efilingProvider: data.efiling_provider,
      efilingConfig: (data.efiling_config as Record<string, any>) || {},
      isActive: data.is_active,
      setupCompleted: data.setup_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }

  /**
   * Create new tax profile
   */
  static async createProfile(profile: Omit<TaxProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaxProfile> {
    const { data, error } = await supabase
      .from('tax_profiles')
      .insert({
        company_id: profile.companyId,
        fein: profile.fein,
        state_tax_ids: profile.stateTaxIds as any,
        local_jurisdictions: profile.localJurisdictions as any,
        futa_number: profile.futaNumber,
        suta_numbers: profile.sutaNumbers,
        federal_deposit_frequency: profile.federalDepositFrequency,
        state_deposit_frequencies: profile.stateDepositFrequencies,
        efiling_enabled: profile.efilingEnabled,
        efiling_provider: profile.efilingProvider,
        efiling_config: profile.efilingConfig,
        is_active: profile.isActive,
        setup_completed: profile.setupCompleted,
        created_by: profile.createdBy,
        updated_by: profile.updatedBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tax profile:', error);
      throw new Error('Failed to create tax profile');
    }

    return this.mapDatabaseToProfile(data);
  }

  /**
   * Update tax profile
   */
  static async updateProfile(id: string, updates: Partial<TaxProfile>): Promise<TaxProfile> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.fein !== undefined) updateData.fein = updates.fein;
    if (updates.stateTaxIds !== undefined) updateData.state_tax_ids = updates.stateTaxIds;
    if (updates.localJurisdictions !== undefined) updateData.local_jurisdictions = updates.localJurisdictions;
    if (updates.futaNumber !== undefined) updateData.futa_number = updates.futaNumber;
    if (updates.sutaNumbers !== undefined) updateData.suta_numbers = updates.sutaNumbers;
    if (updates.federalDepositFrequency !== undefined) updateData.federal_deposit_frequency = updates.federalDepositFrequency;
    if (updates.stateDepositFrequencies !== undefined) updateData.state_deposit_frequencies = updates.stateDepositFrequencies;
    if (updates.efilingEnabled !== undefined) updateData.efiling_enabled = updates.efilingEnabled;
    if (updates.efilingProvider !== undefined) updateData.efiling_provider = updates.efilingProvider;
    if (updates.efilingConfig !== undefined) updateData.efiling_config = updates.efilingConfig;
    if (updates.setupCompleted !== undefined) updateData.setup_completed = updates.setupCompleted;
    if (updates.updatedBy !== undefined) updateData.updated_by = updates.updatedBy;

    const { data, error } = await supabase
      .from('tax_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tax profile:', error);
      throw new Error('Failed to update tax profile');
    }

    return this.mapDatabaseToProfile(data);
  }

  /**
   * Generate tax calendar for a company and year
   */
  static async generateTaxCalendar(companyId: string, taxYear: number): Promise<void> {
    const { error } = await supabase.rpc('generate_tax_calendar_entries', {
      p_company_id: companyId,
      p_tax_year: taxYear
    });

    if (error) {
      console.error('Error generating tax calendar:', error);
      throw new Error('Failed to generate tax calendar');
    }
  }

  /**
   * Validate FEIN format
   */
  static validateFEIN(fein: string): boolean {
    const feinRegex = /^\d{2}-\d{7}$/;
    return feinRegex.test(fein);
  }

  /**
   * Validate state tax ID format for specific states
   */
  static validateStateTaxId(state: string, taxId: string): boolean {
    const stateFormats: Record<string, RegExp> = {
      'CA': /^\d{7}-\d{1}$/, // California
      'NY': /^\d{8}$/, // New York
      'TX': /^\d{11}$/, // Texas
      'FL': /^\d{7}$/, // Florida
      // Add more state-specific formats as needed
    };

    const format = stateFormats[state];
    return format ? format.test(taxId) : true; // Return true for unknown states
  }

  /**
   * Get supported tax jurisdictions
   */
  static getSupportedJurisdictions(): TaxJurisdiction[] {
    return [
      { code: 'CA', name: 'California', type: 'state', filingFrequency: 'quarterly' },
      { code: 'NY', name: 'New York', type: 'state', filingFrequency: 'quarterly' },
      { code: 'TX', name: 'Texas', type: 'state', filingFrequency: 'quarterly' },
      { code: 'FL', name: 'Florida', type: 'state', filingFrequency: 'quarterly' },
      { code: 'OH', name: 'Ohio', type: 'state', filingFrequency: 'quarterly' },
      { code: 'PA', name: 'Pennsylvania', type: 'state', filingFrequency: 'quarterly' },
      // Add more jurisdictions as needed
    ];
  }

  /**
   * Map database row to TaxProfile object
   */
  private static mapDatabaseToProfile(data: any): TaxProfile {
    return {
      id: data.id,
      companyId: data.company_id,
      fein: data.fein,
      stateTaxIds: data.state_tax_ids || {},
      localJurisdictions: data.local_jurisdictions || [],
      futaNumber: data.futa_number,
      sutaNumbers: data.suta_numbers || {},
      federalDepositFrequency: data.federal_deposit_frequency,
      stateDepositFrequencies: data.state_deposit_frequencies || {},
      efilingEnabled: data.efiling_enabled,
      efilingProvider: data.efiling_provider,
      efilingConfig: data.efiling_config || {},
      isActive: data.is_active,
      setupCompleted: data.setup_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }
}