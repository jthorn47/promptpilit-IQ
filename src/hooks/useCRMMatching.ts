import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CRMContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  is_primary: boolean;
  company_id: string;
  company_name?: string;
  company_status?: string;
}

interface CRMCompany {
  id: string;
  company_name: string;
  lifecycle_stage?: string;
}

interface CRMLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  status: string;
  lead_score?: number;
  source?: string;
  notes?: string;
  last_contact_date?: string;
}

interface CRMDeal {
  id: string;
  title: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  value: number;
  currency: string;
  status: string;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
}

interface CRMActivity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  scheduled_at?: string;
  completed_at?: string;
  status: string;
  created_at: string;
}

interface CRMMatchResult {
  contact?: CRMContact;
  company?: CRMCompany;
  lead?: CRMLead;
  deals?: CRMDeal[];
  activities?: CRMActivity[];
  matchType: 'email' | 'domain' | 'company' | 'none';
}

export const useCRMMatching = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchEmailToCRM = async (email: string, senderName: string): Promise<CRMMatchResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const domain = email.split('@')[1];
      let matchResult: CRMMatchResult = { matchType: 'none' };

      // 1. First, try exact email match in contacts
      const { data: contactData, error: contactError } = await supabase
        .from('company_contacts')
        .select(`
          *,
          company_settings!inner(
            id,
            company_name,
            lifecycle_stage
          )
        `)
        .eq('email', email)
        .single();

      if (contactData && !contactError) {
        matchResult = {
          contact: {
            id: contactData.id,
            first_name: contactData.first_name,
            last_name: contactData.last_name,
            email: contactData.email,
            phone: contactData.phone,
            job_title: contactData.job_title,
            is_primary: contactData.is_primary,
            company_id: contactData.company_id,
            company_name: contactData.company_settings.company_name,
            company_status: contactData.company_settings.lifecycle_stage
          },
          company: {
            id: contactData.company_settings.id,
            company_name: contactData.company_settings.company_name,
            lifecycle_stage: contactData.company_settings.lifecycle_stage
          },
          matchType: 'email'
        };
      }

      // 2. If no contact match, try leads table
      if (matchResult.matchType === 'none') {
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('email', email)
          .single();

        if (leadData && !leadError) {
          matchResult = {
            lead: {
              id: leadData.id,
              first_name: leadData.first_name,
              last_name: leadData.last_name,
              email: leadData.email,
              phone: leadData.phone,
              company_name: leadData.company_name,
              job_title: leadData.job_title,
              industry: leadData.industry,
              status: leadData.status,
              lead_score: leadData.lead_score,
              source: leadData.source,
              notes: leadData.notes,
              last_contact_date: leadData.last_contact_date
            },
            matchType: 'email'
          };
        }
      }

      // 3. If no exact email match, try domain matching
      if (matchResult.matchType === 'none') {
        const { data: domainContacts, error: domainError } = await supabase
          .from('company_contacts')
          .select(`
            *,
            company_settings!inner(
              id,
              company_name,
              lifecycle_stage
            )
          `)
          .like('email', `%@${domain}`)
          .limit(1);

        if (domainContacts && domainContacts.length > 0 && !domainError) {
          const contact = domainContacts[0];
          matchResult = {
            company: {
              id: contact.company_settings.id,
              company_name: contact.company_settings.company_name,
              lifecycle_stage: contact.company_settings.lifecycle_stage
            },
            matchType: 'domain'
          };
        }
      }

      // 4. If we have a match, fetch related data
      if (matchResult.matchType !== 'none') {
        // Fetch deals
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*')
          .eq('contact_email', email)
          .order('created_at', { ascending: false })
          .limit(5);

        if (dealsData) {
          matchResult.deals = dealsData.map(deal => ({
            id: deal.id,
            title: deal.title,
            company_name: deal.company_name,
            contact_name: deal.contact_name,
            contact_email: deal.contact_email,
            value: deal.value,
            currency: deal.currency,
            status: deal.status,
            probability: deal.probability,
            expected_close_date: deal.expected_close_date,
            notes: deal.notes
          }));
        }

        // Fetch activities - check for lead_id or deal_id matches
        const { data: activitiesData } = await supabase
          .from('activities')
          .select('*')
          .or(`lead_id.eq.${matchResult.lead?.id || 'null'},deal_id.in.(${matchResult.deals?.map(d => d.id).join(',') || 'null'})`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesData) {
          matchResult.activities = activitiesData.map(activity => ({
            id: activity.id,
            type: activity.type,
            subject: activity.subject,
            description: activity.description,
            scheduled_at: activity.scheduled_at,
            completed_at: activity.completed_at,
            status: activity.status,
            created_at: activity.created_at
          }));
        }
      }

      return matchResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to match email to CRM';
      setError(errorMessage);
      return { matchType: 'none' };
    } finally {
      setIsLoading(false);
    }
  };

  const addCRMNote = async (contactId: string, note: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          type: 'note',
          subject: 'Email Communication Note',
          description: note,
          status: 'completed',
          assigned_to: (await supabase.auth.getUser()).data.user?.id || '',
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        }]);

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add CRM note');
    }
  };

  const logCRMActivity = async (contactId: string, activityType: string, subject: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          type: activityType,
          subject,
          description,
          status: 'completed',
          assigned_to: (await supabase.auth.getUser()).data.user?.id || '',
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        }]);

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to log CRM activity');
    }
  };

  return {
    matchEmailToCRM,
    addCRMNote,
    logCRMActivity,
    isLoading,
    error
  };
};