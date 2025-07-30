/**
 * TimeSettingsService - API service for client time compliance settings
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type ClientTimeSettings = Database['public']['Tables']['client_time_settings']['Row'];

export type UpdateTimeSettingsRequest = Database['public']['Tables']['client_time_settings']['Update'];

export class TimeSettingsService {
  /**
   * Get client time settings by client ID
   */
  static async getClientTimeSettings(clientId: string): Promise<ClientTimeSettings | null> {
    try {
      const { data, error } = await supabase
        .from('client_time_settings')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, create default ones
      if (!data) {
        return await this.createDefaultTimeSettings(clientId);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching client time settings:', error);
      throw error;
    }
  }

  /**
   * Update client time settings
   */
  static async updateClientTimeSettings(
    clientId: string, 
    updates: UpdateTimeSettingsRequest
  ): Promise<ClientTimeSettings> {
    try {
      // Validate daily thresholds
      if (updates.daily_ot_threshold && updates.daily_ot_threshold > 24) {
        throw new Error('Daily overtime threshold cannot exceed 24 hours');
      }
      
      if (updates.daily_dt_threshold && updates.daily_dt_threshold > 24) {
        throw new Error('Daily doubletime threshold cannot exceed 24 hours');
      }
      
      // Validate weekly threshold
      if (updates.weekly_ot_threshold && updates.weekly_ot_threshold < 40) {
        throw new Error('Weekly overtime threshold must be at least 40 hours');
      }

      const { data, error } = await supabase
        .from('client_time_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', clientId)
        .select()
        .single();

      if (error) throw error;
      
      // Trigger compliance re-evaluation (placeholder for future implementation)
      await this.triggerComplianceReEvaluation(clientId);
      
      return data;
    } catch (error) {
      console.error('Error updating client time settings:', error);
      throw error;
    }
  }

  /**
   * Create default time settings for a new client
   */
  private static async createDefaultTimeSettings(clientId: string): Promise<ClientTimeSettings> {
    try {
      const defaultSettings = {
        client_id: clientId,
        state: 'CA', // Default to California
        daily_ot_threshold: 8,
        daily_dt_threshold: 12,
        weekly_ot_threshold: 40,
        seven_day_rule: false,
        workweek_start_day: 'Monday' as const,
        custom_rule_notes: ''
      };

      const { data, error } = await supabase
        .from('client_time_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default time settings:', error);
      throw error;
    }
  }

  /**
   * Trigger compliance re-evaluation for the client's time entries
   * This would integrate with the TimeComplianceEngine
   */
  private static async triggerComplianceReEvaluation(clientId: string): Promise<void> {
    try {
      // Placeholder for future implementation
      // This would:
      // 1. Get all time entries for current week
      // 2. Re-run TimeComplianceEngine.evaluate() on each
      // 3. Update compliance flags in database
      // 4. Notify relevant stakeholders if violations found
      
      console.log(`Triggered compliance re-evaluation for client ${clientId}`);
    } catch (error) {
      console.error('Error triggering compliance re-evaluation:', error);
      // Don't throw - this is a background process
    }
  }

  /**
   * Get available US states for dropdown
   */
  static getAvailableStates(): Array<{ value: string; label: string }> {
    return [
      { value: 'AL', label: 'Alabama' },
      { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' },
      { value: 'AR', label: 'Arkansas' },
      { value: 'CA', label: 'California' },
      { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' },
      { value: 'DE', label: 'Delaware' },
      { value: 'FL', label: 'Florida' },
      { value: 'GA', label: 'Georgia' },
      { value: 'HI', label: 'Hawaii' },
      { value: 'ID', label: 'Idaho' },
      { value: 'IL', label: 'Illinois' },
      { value: 'IN', label: 'Indiana' },
      { value: 'IA', label: 'Iowa' },
      { value: 'KS', label: 'Kansas' },
      { value: 'KY', label: 'Kentucky' },
      { value: 'LA', label: 'Louisiana' },
      { value: 'ME', label: 'Maine' },
      { value: 'MD', label: 'Maryland' },
      { value: 'MA', label: 'Massachusetts' },
      { value: 'MI', label: 'Michigan' },
      { value: 'MN', label: 'Minnesota' },
      { value: 'MS', label: 'Mississippi' },
      { value: 'MO', label: 'Missouri' },
      { value: 'MT', label: 'Montana' },
      { value: 'NE', label: 'Nebraska' },
      { value: 'NV', label: 'Nevada' },
      { value: 'NH', label: 'New Hampshire' },
      { value: 'NJ', label: 'New Jersey' },
      { value: 'NM', label: 'New Mexico' },
      { value: 'NY', label: 'New York' },
      { value: 'NC', label: 'North Carolina' },
      { value: 'ND', label: 'North Dakota' },
      { value: 'OH', label: 'Ohio' },
      { value: 'OK', label: 'Oklahoma' },
      { value: 'OR', label: 'Oregon' },
      { value: 'PA', label: 'Pennsylvania' },
      { value: 'RI', label: 'Rhode Island' },
      { value: 'SC', label: 'South Carolina' },
      { value: 'SD', label: 'South Dakota' },
      { value: 'TN', label: 'Tennessee' },
      { value: 'TX', label: 'Texas' },
      { value: 'UT', label: 'Utah' },
      { value: 'VT', label: 'Vermont' },
      { value: 'VA', label: 'Virginia' },
      { value: 'WA', label: 'Washington' },
      { value: 'WV', label: 'West Virginia' },
      { value: 'WI', label: 'Wisconsin' },
      { value: 'WY', label: 'Wyoming' }
    ];
  }

  /**
   * Get workweek start day options
   */
  static getWorkweekStartDays(): Array<{ value: string; label: string }> {
    return [
      { value: 'Monday', label: 'Monday' },
      { value: 'Tuesday', label: 'Tuesday' },
      { value: 'Wednesday', label: 'Wednesday' },
      { value: 'Thursday', label: 'Thursday' },
      { value: 'Friday', label: 'Friday' },
      { value: 'Saturday', label: 'Saturday' },
      { value: 'Sunday', label: 'Sunday' }
    ];
  }
}