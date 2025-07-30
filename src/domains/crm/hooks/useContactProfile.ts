import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { ContactWithCompany } from './useGlobalContacts';

export interface ContactProfileData extends ContactWithCompany {
  relatedOpportunities?: Array<{
    id: string;
    name: string;
    deal_value: number;
    stage: string;
    close_probability: number;
    forecast_close_date: string;
  }>;
  relatedActivities?: Array<{
    id: string;
    type: string;
    subject: string;
    description: string;
    created_at: string;
    status: string;
  }>;
}

export function useContactProfile(contactId: string) {
  return useSupabaseQuery(
    ['contact-profile', contactId],
    async () => {
      if (!contactId) return { data: null, error: null };

      // Get contact details with company info
      const { data: contact, error: contactError } = await supabase
        .from('crm_contacts')
        .select(`
          *,
          company:crm_companies(
            id,
            name,
            assigned_rep_id,
            industry,
            phone,
            website
          )
        `)
        .eq('id', contactId)
        .single();

      if (contactError) throw contactError;

      // Get related opportunities from the company
      const { data: opportunities } = await supabase
        .from('crm_opportunities')
        .select(`
          id,
          name,
          deal_value,
          stage,
          close_probability,
          forecast_close_date
        `)
        .eq('company_id', contact.company_id)
        .order('forecast_close_date', { ascending: false });

      // Get related activities where this contact is mentioned
      const { data: activities } = await supabase
        .from('crm_activity_log')
        .select(`
          id,
          activity_type,
          description,
          created_at
        `)
        .eq('entity_type', 'crm_contacts')
        .eq('entity_id', contactId)
        .order('created_at', { ascending: false })
        .limit(10);

      const profileData: ContactProfileData = {
        ...contact,
        relatedOpportunities: opportunities || [],
        relatedActivities: activities?.map(activity => ({
          id: activity.id,
          type: activity.activity_type,
          subject: activity.activity_type,
          description: activity.description,
          created_at: activity.created_at,
          status: 'completed'
        })) || []
      };

      return {
        data: profileData,
        error: null
      };
    },
    {
      enabled: !!contactId
    }
  );
}