import { useState, useEffect } from 'react';
import { CRMService, Lead, Deal } from '../services/CRMService';
import { useToast } from "@/hooks/use-toast";

export const useCRMState = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLeads = async (filters?: { status?: string; source?: string; search?: string }) => {
    try {
      setLoading(true);
      const data = await CRMService.getLeads(filters);
      setLeads(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async (filters?: { status?: string; stage?: string; search?: string }) => {
    try {
      setLoading(true);
      const data = await CRMService.getDeals(filters);
      setDeals(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch deals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLead = await CRMService.createLead(lead);
      setLeads(prev => [newLead, ...prev]);
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      return newLead;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const updatedLead = await CRMService.updateLead(id, updates);
      setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      return updatedLead;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await CRMService.deleteLead(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    leads,
    deals,
    loading,
    fetchLeads,
    fetchDeals,
    createLead,
    updateLead,
    deleteLead
  };
};