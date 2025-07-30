import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deal } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDeals = async (filters?: { 
    status?: string; 
    assigned_to?: string; 
    stage_id?: string;
    search?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from('deals').select('*');
      
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
        query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single();
      
      if (error) throw error;
      
      setDeals(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setDeals(prev => 
        prev.map(deal => deal.id === id ? data : deal)
      );
      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating deal:', error);
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return {
    deals,
    loading,
    fetchDeals,
    createDeal,
    updateDeal,
  };
};