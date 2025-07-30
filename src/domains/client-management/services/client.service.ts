import { supabase } from "@/integrations/supabase/client";
import { Client, ClientFormData, ClientFilters, ClientMetrics } from "../types/client.types";

export class ClientService {
  static async getClients(filters?: ClientFilters): Promise<Client[]> {
    let query = supabase.from('companies').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    
    if (filters?.size) {
      query = query.eq('size', filters.size);
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []) as Client[];
  }

  static async getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data as Client;
  }

  static async createClient(clientData: ClientFormData): Promise<Client> {
    const { data, error } = await supabase
      .from('companies')
      .insert([clientData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Client;
  }

  static async updateClient(id: string, updates: any): Promise<Client> {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Client;
  }

  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }

  static async getClientMetrics(): Promise<ClientMetrics> {
    const { data, error } = await supabase
      .from('companies')
      .select('status, contract_end_date');
    
    if (error) throw new Error(error.message);
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const metrics: ClientMetrics = {
      totalClients: data?.length || 0,
      activeClients: data?.filter(c => c.status === 'active').length || 0,
      prospectiveClients: data?.filter(c => c.status === 'prospective').length || 0,
      churnedClients: data?.filter(c => c.status === 'churned').length || 0,
      contractsExpiringSoon: data?.filter(c => 
        c.contract_end_date && 
        new Date(c.contract_end_date) <= thirtyDaysFromNow &&
        new Date(c.contract_end_date) >= now
      ).length || 0,
    };
    
    return metrics;
  }
}