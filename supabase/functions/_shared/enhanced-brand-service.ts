import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

// Enhanced Brand Service for Edge Functions
export interface BrandEmailConfig {
  identity: string;
  emailDomain: string;
  displayName: string;
  primaryColor: string;
  logoUrl: string;
  subjectPrefix: string;
  signature: string;
  supportEmail: string;
  noReplyEmail: string;
  fromName: string;
}

export class EnhancedBrandService {
  private static supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  /**
   * Validate brand identity and return fallback if invalid
   */
  static validateBrandIdentity(brandIdentity?: string): string {
    const validBrands = ['easeworks', 'easelearn', 'dual'];
    if (!brandIdentity || !validBrands.includes(brandIdentity)) {
      console.warn(`Invalid brand identity: ${brandIdentity}, falling back to 'easeworks'`);
      return 'easeworks';
    }
    return brandIdentity;
  }

  /**
   * Get brand-specific email domain using database function
   */
  static async getBrandEmailDomain(brandIdentity: string, context: string = 'default'): Promise<string> {
    try {
      const { data, error } = await this.supabase.rpc('get_brand_email_domain', {
        p_brand_identity: brandIdentity,
        p_context: context
      });

      if (error) {
        console.error('Error getting brand email domain:', error);
        return this.getFallbackDomain(brandIdentity);
      }

      return data || this.getFallbackDomain(brandIdentity);
    } catch (error) {
      console.error('Error calling get_brand_email_domain:', error);
      return this.getFallbackDomain(brandIdentity);
    }
  }

  /**
   * Get fallback domain for brand
   */
  private static getFallbackDomain(brandIdentity: string): string {
    switch (brandIdentity) {
      case 'easelearn':
        return 'easelearn.com';
      case 'dual':
        return 'easeworks.com'; // Default for dual
      default:
        return 'easeworks.com';
    }
  }

  /**
   * Get comprehensive brand configuration for emails
   */
  static async getBrandedEmailConfig(
    brandIdentity: string, 
    context: string = 'default'
  ): Promise<BrandEmailConfig> {
    const validatedBrand = this.validateBrandIdentity(brandIdentity);
    const emailDomain = await this.getBrandEmailDomain(validatedBrand, context);

    const config: BrandEmailConfig = {
      identity: validatedBrand,
      emailDomain,
      displayName: this.getBrandDisplayName(validatedBrand),
      primaryColor: this.getBrandPrimaryColor(validatedBrand),
      logoUrl: this.getBrandLogoUrl(validatedBrand),
      subjectPrefix: this.getSubjectPrefix(validatedBrand),
      signature: this.getBrandSignature(validatedBrand, emailDomain),
      supportEmail: `support@${emailDomain}`,
      noReplyEmail: `noreply@${emailDomain}`,
      fromName: this.getBrandDisplayName(validatedBrand)
    };

    return config;
  }

  /**
   * Get branded email address for specific type
   */
  static async getBrandedEmailAddress(
    brandIdentity: string, 
    context: string = 'default', 
    emailType: string = 'noreply'
  ): Promise<string> {
    const validatedBrand = this.validateBrandIdentity(brandIdentity);
    const domain = await this.getBrandEmailDomain(validatedBrand, context);
    return `${emailType}@${domain}`;
  }

  /**
   * Log email with brand identity
   */
  static async logBrandedEmail(params: {
    to: string;
    from: string;
    subject: string;
    html: string;
    brandIdentity: string;
    userId?: string;
    messageId?: string;
    context?: any;
  }): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('log_branded_email', {
        p_to_email: params.to,
        p_from_email: params.from,
        p_subject: params.subject,
        p_html: params.html,
        p_brand_identity: this.validateBrandIdentity(params.brandIdentity),
        p_user_id: params.userId || null,
        p_message_id: params.messageId || null,
        p_context: params.context || {}
      });

      if (error) {
        console.error('Error logging branded email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in logBrandedEmail:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */
  private static getBrandDisplayName(brandIdentity: string): string {
    switch (brandIdentity) {
      case 'easeworks':
        return 'Easeworks';
      case 'easelearn':
        return 'EaseLearn';
      case 'dual':
        return 'Dual Brand';
      default:
        return 'Easeworks';
    }
  }

  private static getBrandPrimaryColor(brandIdentity: string): string {
    switch (brandIdentity) {
      case 'easeworks':
        return '#2563eb';
      case 'easelearn':
        return '#059669';
      case 'dual':
        return '#7c3aed';
      default:
        return '#2563eb';
    }
  }

  private static getBrandLogoUrl(brandIdentity: string): string {
    switch (brandIdentity) {
      case 'easeworks':
        return 'https://easeworks.com/logo-light.png';
      case 'easelearn':
        return 'https://easelearn.com/logo-light.png';
      case 'dual':
        return 'https://easeworks.com/logo-dual.png';
      default:
        return 'https://easeworks.com/logo-light.png';
    }
  }

  private static getSubjectPrefix(brandIdentity: string): string {
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

  private static getBrandSignature(brandIdentity: string, emailDomain: string): string {
    const displayName = this.getBrandDisplayName(brandIdentity);
    return `Best regards,\nThe ${displayName} Team\nSupport: support@${emailDomain}`;
  }

  /**
   * Add subject prefix if not already present
   */
  static addSubjectPrefix(subject: string, brandIdentity: string): string {
    const prefix = this.getSubjectPrefix(brandIdentity);
    return subject.startsWith(prefix) ? subject : `${prefix} ${subject}`;
  }
}