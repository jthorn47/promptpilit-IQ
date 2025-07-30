import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BrandIdentity } from '@/types/brand';

export interface SystemEmailTemplate {
  id: string;
  name: string;
  template_type: 'authentication' | 'security' | 'notification' | 'system' | '2fa';
  category: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  is_default: boolean;
  brand_identity: BrandIdentity | null; // Added brand identity
  created_at: string;
  updated_at: string;
  usage_count?: number;
  last_used?: string;
}

export const useSystemEmailTemplates = (brandFilter?: BrandIdentity[]) => {
  const [templates, setTemplates] = useState<SystemEmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async (brands?: BrandIdentity[]) => {
    setLoading(true);
    console.log('🔄 Starting to fetch system email templates...');
    try {
      // For now, return the mock data that was inserted into the email_templates table
      // Filter only system email templates (not marketing ones)
      let query = supabase
        .from('email_templates')
        .select('*')
        .in('template_type', ['authentication', 'security', 'notification', 'system', '2fa']);

      // Apply brand filter if provided
      const filterBrands = brands || brandFilter;
      if (filterBrands && filterBrands.length > 0) {
        // Include both brand-specific templates and system templates (null brand_identity)
        query = query.or(`brand_identity.in.(${filterBrands.join(',')}),brand_identity.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      console.log('📧 Raw email templates query result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Transform the data to match our SystemEmailTemplate interface
      const systemTemplates: SystemEmailTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        template_type: template.template_type as any,
        category: template.template_type, // Use template_type as category for now
        subject: template.subject,
        body: template.html_content,
        variables: [], // Extract from body content later
        is_active: template.is_active,
        is_default: false, // Add this field to email_templates table if needed
        brand_identity: template.brand_identity as BrandIdentity | null, // Include brand identity
        created_at: template.created_at,
        updated_at: template.updated_at,
        usage_count: 0, // Track this separately if needed
        last_used: undefined
      }));

      setTemplates(systemTemplates);
      console.log('System email templates loaded:', systemTemplates);
    } catch (error) {
      console.error('Error fetching system email templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<SystemEmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get current user for created_by field
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || '00000000-0000-0000-0000-000000000000'; // Fallback UUID
      
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: templateData.name,
          template_type: templateData.template_type,
          subject: templateData.subject,
          html_content: templateData.body,
          is_active: templateData.is_active,
          brand_identity: templateData.brand_identity,
          created_by: currentUserId
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the templates list
      await fetchTemplates();
      
      return data;
    } catch (error) {
      console.error('Error creating system email template:', error);
      throw error;
    }
  };

  const updateTemplate = async (templateId: string, templateData: Partial<SystemEmailTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: templateData.name,
          template_type: templateData.template_type,
          subject: templateData.subject,
          html_content: templateData.body,
          is_active: templateData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // Refresh the templates list
      await fetchTemplates();
      
      return data;
    } catch (error) {
      console.error('Error updating system email template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      // Refresh the templates list
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting system email template:', error);
      throw error;
    }
  };

  const getTemplateByType = async (templateType: string, category?: string) => {
    try {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('template_type', templateType)
        .eq('is_active', true);

      if (category) {
        // Add category filter when the schema supports it
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching template by type:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [brandFilter]);

  const refreshTemplates = (brands?: BrandIdentity[]) => {
    fetchTemplates(brands);
  };

  return {
    templates,
    loading,
    fetchTemplates: refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateByType
  };
};