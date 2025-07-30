import { useState, useEffect } from 'react';
import { crmAPI } from '../api';
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
      const data = await crmAPI.getLeads(filters);
      setLeads(data);
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
      const data = await crmAPI.createLead(lead);
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
      const data = await crmAPI.updateLead(id, updates);
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
      await crmAPI.deleteLead(id);
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