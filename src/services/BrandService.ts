import { supabase } from "@/integrations/supabase/client";
import { BrandIdentity, getBrandConfig, BrandConfig } from "@/types/brand";

export class BrandService {
  /**
   * Get brand-appropriate email domain using the database function
   */
  static async getBrandEmailDomain(brandIdentity: BrandIdentity, context: string = 'default'): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('get_brand_email_domain', {
        p_brand_identity: brandIdentity,
        p_context: context
      });

      if (error) {
        console.error('Error getting brand email domain:', error);
        return getBrandConfig(brandIdentity, context).emailDomain; // Fallback to local logic
      }

      return data;
    } catch (error) {
      console.error('Error calling get_brand_email_domain:', error);
      return getBrandConfig(brandIdentity, context).emailDomain; // Fallback to local logic
    }
  }

  /**
   * Get brand configuration with dynamic email domain
   */
  static async getBrandConfigWithDomain(brandIdentity: BrandIdentity, context?: string): Promise<BrandConfig> {
    const emailDomain = await this.getBrandEmailDomain(brandIdentity, context);
    const config = getBrandConfig(brandIdentity, context);
    return {
      ...config,
      emailDomain
    };
  }

  /**
   * Get user's brand identity from their roles
   */
  static async getUserBrandIdentity(userId: string): Promise<BrandIdentity | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('brand_identity')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (error || !data?.brand_identity) {
        return null;
      }

      return data.brand_identity as BrandIdentity;
    } catch (error) {
      console.error('Error getting user brand identity:', error);
      return null;
    }
  }

  /**
   * Get company's brand identity
   */
  static async getCompanyBrandIdentity(companyId: string): Promise<BrandIdentity | null> {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('brand_identity')
        .eq('id', companyId)
        .single();

      if (error || !data?.brand_identity) {
        return null;
      }

      return data.brand_identity as BrandIdentity;
    } catch (error) {
      console.error('Error getting company brand identity:', error);
      return null;
    }
  }

  /**
   * Update company brand identity (Super Admin only)
   */
  static async updateCompanyBrandIdentity(companyId: string, brandIdentity: BrandIdentity): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({ brand_identity: brandIdentity })
        .eq('id', companyId);

      if (error) {
        console.error('Error updating company brand identity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating company brand identity:', error);
      return false;
    }
  }

  /**
   * Validate that a company has a brand identity set
   */
  static async validateCompanyBrandIdentity(companyId: string): Promise<{ isValid: boolean; brandIdentity?: BrandIdentity }> {
    const brandIdentity = await this.getCompanyBrandIdentity(companyId);
    return {
      isValid: brandIdentity !== null,
      brandIdentity: brandIdentity || undefined
    };
  }

  /**
   * Get branded email address for notifications
   */
  static async getBrandedEmailAddress(brandIdentity: BrandIdentity, context: string = 'default', emailType: string = 'noreply'): Promise<string> {
    const domain = await this.getBrandEmailDomain(brandIdentity, context);
    return `${emailType}@${domain}`;
  }

  /**
   * Get enhanced email configuration for brand-specific templates (for edge functions)
   */
  static async getBrandEmailConfig(brandIdentity: BrandIdentity): Promise<{
    logoUrl: string;
    subjectPrefix: string;
    signature: string;
    primaryColor: string;
    supportEmail: string;
  }> {
    const config = getBrandConfig(brandIdentity);
    
    return {
      logoUrl: brandIdentity === 'easeworks' 
        ? 'https://easeworks.com/logo-light.png'
        : brandIdentity === 'easelearn'
        ? 'https://easelearn.com/logo-light.png'
        : 'https://easeworks.com/logo-dual.png',
      subjectPrefix: brandIdentity === 'easeworks' 
        ? '[Easeworks]'
        : brandIdentity === 'easelearn'
        ? '[EaseLearn]'
        : '[Dual Brand]',
      signature: brandIdentity === 'easeworks'
        ? 'Best regards,\nThe Easeworks Team\nSupport: support@easeworks.com'
        : brandIdentity === 'easelearn'
        ? 'Best regards,\nThe EaseLearn Team\nSupport: support@easelearn.com'
        : 'Best regards,\nThe Team\nSupport: support@easeworks.com',
      primaryColor: config.primaryColor || '#2563eb',
      supportEmail: await this.getBrandedEmailAddress(brandIdentity, 'default', 'support')
    };
  }

  /**
   * Send branded email via edge function with proper brand validation
   */
  static async sendBrandedEmail(params: {
    to: string;
    subject: string;
    html: string;
    brandIdentity: BrandIdentity;
    emailContext?: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
    context?: any;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.to,
          subject: params.subject,
          html: params.html,
          brandIdentity: params.brandIdentity, // Now required
          emailContext: params.emailContext || 'default',
          from_name: params.fromName,
          from_email: params.fromEmail,
          reply_to: params.replyTo,
          context: params.context
        }
      });

      if (error) {
        console.error('Error sending branded email:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: data.success, 
        messageId: data.messageId,
        error: data.error 
      };
    } catch (error) {
      console.error('Error in sendBrandedEmail:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email subject prefix for brand
   */
  static getEmailSubjectPrefix(brandIdentity: BrandIdentity): string {
    switch (brandIdentity) {
      case 'easeworks':
        return '[Easeworks]';
      case 'easelearn':
        return '[EaseLearn]';
      case 'dual':
        return '[Dual Brand]';
      default:
        return '[Easeworks]';
    }
  }

  /**
   * Get brand support information
   */
  static getBrandSupportInfo(brandIdentity: BrandIdentity): {
    supportEmail: string;
    helpDeskUrl: string;
    contactPhone: string;
  } {
    switch (brandIdentity) {
      case 'easeworks':
        return {
          supportEmail: 'support@easeworks.com',
          helpDeskUrl: 'https://help.easeworks.com',
          contactPhone: '+1-800-EASEWORK'
        };
      case 'easelearn':
        return {
          supportEmail: 'support@easelearn.com',
          helpDeskUrl: 'https://help.easelearn.com',
          contactPhone: '+1-800-EASELEARN'
        };
      case 'dual':
        return {
          supportEmail: 'support@easeworks.com',
          helpDeskUrl: 'https://help.easeworks.com',
          contactPhone: '+1-800-EASEWORK'
        };
      default:
        return {
          supportEmail: 'support@easeworks.com',
          helpDeskUrl: 'https://help.easeworks.com',
          contactPhone: '+1-800-EASEWORK'
        };
    }
  }
}