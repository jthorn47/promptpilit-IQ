import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type LocationTimeRule = Tables<'client_location_time_rules'>;
export type LocationTimeRuleInsert = TablesInsert<'client_location_time_rules'>;
export type LocationTimeRuleUpdate = TablesUpdate<'client_location_time_rules'>;

export class LocationTimeRulesService {
  static async getLocationRules(clientId: string): Promise<LocationTimeRule[]> {
    const { data, error } = await supabase
      .from('client_location_time_rules')
      .select('*')
      .eq('client_id', clientId)
      .order('location_name');

    if (error) {
      console.error('Error fetching location time rules:', error);
      throw new Error(`Failed to fetch location time rules: ${error.message}`);
    }

    return data || [];
  }

  static async getLocationRule(id: string): Promise<LocationTimeRule | null> {
    const { data, error } = await supabase
      .from('client_location_time_rules')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching location time rule:', error);
      throw new Error(`Failed to fetch location time rule: ${error.message}`);
    }

    return data;
  }

  static async createLocationRule(rule: LocationTimeRuleInsert): Promise<LocationTimeRule> {
    const { data, error } = await supabase
      .from('client_location_time_rules')
      .insert(rule)
      .select()
      .single();

    if (error) {
      console.error('Error creating location time rule:', error);
      throw new Error(`Failed to create location time rule: ${error.message}`);
    }

    return data;
  }

  static async updateLocationRule(id: string, updates: LocationTimeRuleUpdate): Promise<LocationTimeRule> {
    const { data, error } = await supabase
      .from('client_location_time_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location time rule:', error);
      throw new Error(`Failed to update location time rule: ${error.message}`);
    }

    return data;
  }

  static async deleteLocationRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_location_time_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting location time rule:', error);
      throw new Error(`Failed to delete location time rule: ${error.message}`);
    }
  }

  static async copyLocationRule(sourceId: string, newLocationName: string): Promise<LocationTimeRule> {
    // Get the source rule
    const sourceRule = await this.getLocationRule(sourceId);
    if (!sourceRule) {
      throw new Error('Source rule not found');
    }

    // Create new rule with copied settings
    const newRule: LocationTimeRuleInsert = {
      client_id: sourceRule.client_id,
      location_name: newLocationName,
      state: sourceRule.state,
      daily_ot_threshold: sourceRule.daily_ot_threshold,
      daily_dt_threshold: sourceRule.daily_dt_threshold,
      weekly_ot_threshold: sourceRule.weekly_ot_threshold,
      seven_day_rule: sourceRule.seven_day_rule,
      workweek_start_day: sourceRule.workweek_start_day,
      notes: sourceRule.notes || '',
    };

    return this.createLocationRule(newRule);
  }

  /**
   * Get the applicable time rule for a given client and location
   * Returns location-specific rule if it exists, otherwise falls back to client default
   */
  static async getApplicableRule(clientId: string, locationName?: string): Promise<{
    rule: LocationTimeRule | Tables<'client_time_settings'>;
    isLocationSpecific: boolean;
  }> {
    // Try to get location-specific rule first
    if (locationName) {
      const { data: locationRule, error } = await supabase
        .from('client_location_time_rules')
        .select('*')
        .eq('client_id', clientId)
        .eq('location_name', locationName)
        .maybeSingle();

      if (!error && locationRule) {
        return {
          rule: locationRule,
          isLocationSpecific: true,
        };
      }
    }

    // Fall back to client default settings
    const { data: clientRule, error } = await supabase
      .from('client_time_settings')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch client time settings: ${error.message}`);
    }

    if (!clientRule) {
      throw new Error('No time settings found for client');
    }

    return {
      rule: clientRule,
      isLocationSpecific: false,
    };
  }
}