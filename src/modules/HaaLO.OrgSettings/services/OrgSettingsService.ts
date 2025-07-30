import { supabase } from "@/integrations/supabase/client";

export interface OrganizationSettings {
  id?: string;
  company_id: string;
  legal_business_name: string;
  ein?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  time_zone: string;
  locale: string;
  logo_url?: string;
  primary_color?: string;
  default_pay_frequency: string;
  brand_identity?: 'easeworks' | 'easelearn' | 'dual';
  created_at?: string;
  updated_at?: string;
}

export class OrgSettingsService {
  /**
   * Get organization settings for a company
   */
  async getSettings(companyId: string): Promise<OrganizationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      
      // Map database fields to our interface
      return {
        id: data.id,
        company_id: data.id,
        legal_business_name: data.company_name || '',
        ein: data.ein || '',
        address_line_1: data.address || '',
        address_line_2: '',
        city: data.city || '',
        state: data.state || '',
        postal_code: data.postal_code || '',
        country: data.country || 'US',
        phone: '', // Not in current schema
        email: '', // Not in current schema
        website: data.website || '',
        time_zone: data.timezone || 'America/Los_Angeles',
        locale: 'en-US', // Default since not in DB
        logo_url: data.company_logo_url || '',
        primary_color: '#3b82f6', // Default since not in DB
        default_pay_frequency: 'bi-weekly', // Default since not in DB
        brand_identity: data.brand_identity || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching org settings:', error);
      return null;
    }
  }

  /**
   * Update organization settings
   */
  async updateSettings(companyId: string, settings: Partial<OrganizationSettings>): Promise<boolean> {
    try {
      // Map our interface fields back to database fields
      const updateData: any = {};
      
      if (settings.legal_business_name) updateData.company_name = settings.legal_business_name;
      if (settings.ein) updateData.ein = settings.ein;
      if (settings.address_line_1) updateData.address = settings.address_line_1;
      if (settings.city) updateData.city = settings.city;
      if (settings.state) updateData.state = settings.state;
      if (settings.postal_code) updateData.postal_code = settings.postal_code;
      if (settings.country) updateData.country = settings.country;
      // Note: phone and email fields not available in current schema
      if (settings.website) updateData.website = settings.website;
      if (settings.time_zone) updateData.timezone = settings.time_zone;
      if (settings.logo_url) updateData.company_logo_url = settings.logo_url;
      if (settings.brand_identity) updateData.brand_identity = settings.brand_identity;
      
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('company_settings')
        .update(updateData)
        .eq('id', companyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating org settings:', error);
      return false;
    }
  }

  /**
   * Upload logo file
   */
  async uploadLogo(companyId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  }
}