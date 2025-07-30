import { supabase } from "@/integrations/supabase/client";
import type {
  Lead,
  Deal,
  Activity,
  Contact,
  CRMMetrics,
  SalesStage,
  EmailTemplate,
  EmailCampaign
} from "../types";

export class CRMAPI {
  // Leads Management
  async getLeads(filters?: { 
    status?: string; 
    assigned_to?: string; 
    source?: string;
    search?: string;
  }): Promise<Lead[]> {
    let query = supabase
      .from('leads')
      .select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    return data as Lead[];
  }

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    return data as Lead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    return data as Lead;
  }

  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete lead: ${error.message}`);
    }
  }

  // Deals Management
  async getDeals(filters?: { 
    status?: string; 
    assigned_to?: string; 
    stage_id?: string;
    search?: string;
  }): Promise<Deal[]> {
    let query = supabase
      .from('deals')
      .select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.stage_id) {
      query = query.eq('stage_id', filters.stage_id);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    return data as Deal[];
  }

  async createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .insert([deal])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create deal: ${error.message}`);
    }

    return data as Deal;
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deal: ${error.message}`);
    }

    return data as Deal;
  }

  // Activities Management
  async getActivities(filters?: { 
    assigned_to?: string; 
    type?: string; 
    status?: string;
    lead_id?: string;
    deal_id?: string;
  }): Promise<Activity[]> {
    let query = supabase
      .from('activities')
      .select('*');

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }
    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    return data as Activity[];
  }

  async createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create activity: ${error.message}`);
    }

    return data as Activity;
  }

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }

    return data as Activity;
  }

  // Contacts Management - Using leads table for now
  async getContacts(filters?: { 
    search?: string;
    company?: string;
  }): Promise<Contact[]> {
    let query = supabase
      .from('leads')
      .select('*');

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    if (filters?.company) {
      query = query.ilike('company_name', `%${filters.company}%`);
    }

    const { data, error } = await query.order('last_name');

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    // Map leads to contacts format
    return data.map(lead => ({
      id: lead.id,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company_name,
      title: lead.job_title,
      source: lead.source,
      notes: lead.notes,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
    })) as Contact[];
  }

  // CRM Metrics
  async getCRMMetrics(dateFrom?: string, dateTo?: string): Promise<CRMMetrics> {
    const promises = [
      this.getLeads(),
      this.getDeals(),
      this.getActivities(),
    ] as const;

    const [leads, deals, activities] = await Promise.all(promises);

    // Calculate conversion rate
    const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
    const wonDeals = deals.filter(deal => deal.status === 'won').length;
    const conversionRate = qualifiedLeads > 0 ? (wonDeals / qualifiedLeads) * 100 : 0;

    // Calculate average deal size
    const wonDealsWithValue = deals.filter(deal => deal.status === 'won' && deal.value);
    const totalWonValue = wonDealsWithValue.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const avgDealSize = wonDealsWithValue.length > 0 ? totalWonValue / wonDealsWithValue.length : 0;

    // Calculate pipeline value
    const pipelineValue = deals
      .filter(deal => !['won', 'lost', 'cancelled'].includes(deal.status))
      .reduce((sum, deal) => sum + (deal.value || 0), 0);

    return {
      totalLeads: leads.length,
      totalDeals: deals.length,
      totalActivities: activities.length,
      conversionRate,
      avgDealSize,
      pipelineValue,
    };
  }

  // Email Management
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch email templates: ${error.message}`);
    }

    // Map database fields to our EmailTemplate interface
    return data.map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.html_content || template.text_content || '',
      template_type: template.template_type,
      is_active: template.is_active,
      created_by: template.created_by,
      created_at: template.created_at,
      updated_at: template.updated_at,
    })) as EmailTemplate[];
  }

  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch email campaigns: ${error.message}`);
    }

    return data as EmailCampaign[];
  }
}

// Export singleton instance
export const crmAPI = new CRMAPI();