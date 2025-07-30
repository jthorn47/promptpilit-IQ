import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLeads = async (filters?: { 
    status?: string; 
    assigned_to?: string; 
    source?: string; 
    search?: string; 
  }) => {
    setLoading(true);
    try {
      let query = supabase.from('leads').select('*');
      
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
      
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();
      
      if (error) throw error;
      
      setLeads(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setLeads(prev => 
        prev.map(lead => lead.id === id ? data : lead)
      );
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
};