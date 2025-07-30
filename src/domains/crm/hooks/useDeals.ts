import { useState, useEffect } from 'react';
import { crmAPI } from '../api';
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
      const data = await crmAPI.getDeals(filters);
      setDeals(data);
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
      const data = await crmAPI.createDeal(deal);
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
      const data = await crmAPI.updateDeal(id, updates);
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