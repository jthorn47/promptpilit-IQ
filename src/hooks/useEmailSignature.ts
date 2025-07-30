import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface SignatureSettings {
  id: string;
  template_html: string;
  template_text: string;
  is_enabled: boolean;
  allow_user_customization: boolean;
  available_tokens: string[];
  preview_data: Json;
}

interface UserProfile {
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  title?: string;
}

export const useEmailSignature = () => {
  const [signatureSettings, setSignatureSettings] = useState<SignatureSettings | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignatureSettings();
    loadUserProfile();
  }, []);

  const loadSignatureSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_email_signature_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSignatureSettings(data);
    } catch (error) {
      console.error('Error loading signature settings:', error);
      // Set default settings if table doesn't exist or has errors
      setSignatureSettings({
        id: 'default',
        template_html: '<div style="font-family: Arial, sans-serif; color: #333;"><p><strong>{{first_name}} {{last_name}}</strong><br>{{title}}<br>{{company_name}}</p><p>Email: <a href="mailto:{{email}}">{{email}}</a><br>Phone: {{phone}}</p></div>',
        template_text: '{{first_name}} {{last_name}}\n{{title}}\n{{company_name}}\n\nEmail: {{email}}\nPhone: {{phone}}',
        is_enabled: false,
        allow_user_customization: true,
        available_tokens: ['first_name', 'last_name', 'title', 'email', 'phone', 'company_name'],
        preview_data: {
          first_name: 'John',
          last_name: 'Doe',
          title: 'Software Engineer',
          email: 'john.doe@company.com',
          phone: '(555) 123-4567',
          company_name: 'Acme Corp'
        } as Json
      });
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get profile from profiles table first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Try to get employee data for additional info
      const { data: employeeData } = await supabase
        .from('employees')
        .select('first_name, last_name, position, company_id')
        .eq('user_id', user.id)
        .single();

      // Get company name if available
      let companyName = '';
      if (employeeData?.company_id) {
        const { data: companyData } = await supabase
          .from('company_settings')
          .select('company_name')
          .eq('id', employeeData.company_id)
          .single();
        companyName = companyData?.company_name || '';
      }

      setUserProfile({
        user_id: user.id,
        email: profileData?.email || user.email,
        first_name: employeeData?.first_name || user.user_metadata?.first_name || '',
        last_name: employeeData?.last_name || user.user_metadata?.last_name || '',
        phone: '', // No phone field in employees table
        company_name: companyName,
        title: employeeData?.position || '',
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const replaceTokens = (template: string, profile: UserProfile | null = userProfile): string => {
    if (!profile || !template) return template;

    const tokenMap: Record<string, string> = {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      company_name: profile.company_name || '',
      title: profile.title || '',
    };

    let result = template;
    Object.entries(tokenMap).forEach(([token, value]) => {
      result = result.replace(new RegExp(`{{${token}}}`, 'g'), value);
    });

    return result;
  };

  const generateUserSignature = (format: 'html' | 'text' = 'html'): string => {
    if (!signatureSettings?.is_enabled || !userProfile) return '';

    const template = format === 'html' ? signatureSettings.template_html : signatureSettings.template_text;
    return replaceTokens(template, userProfile);
  };

  const canUserCustomizeSignature = (): boolean => {
    return signatureSettings?.allow_user_customization ?? true;
  };

  const createUserSignatureOnProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    if (!signatureSettings?.is_enabled) return;

    const mergedProfile = { ...userProfile, ...updatedProfile };
    const htmlSignature = replaceTokens(signatureSettings.template_html, mergedProfile as UserProfile);
    const textSignature = replaceTokens(signatureSettings.template_text, mergedProfile as UserProfile);

    // You could store user-specific signatures in a separate table here
    // For now, we'll just return the generated signatures
    return {
      html: htmlSignature,
      text: textSignature,
    };
  };

  return {
    signatureSettings,
    userProfile,
    loading,
    generateUserSignature,
    canUserCustomizeSignature,
    replaceTokens,
    createUserSignatureOnProfileUpdate,
    refreshSignatureSettings: loadSignatureSettings,
    refreshUserProfile: loadUserProfile,
  };
};