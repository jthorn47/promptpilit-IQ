import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActivities = async (filters?: { 
    assigned_to?: string; 
    type?: string; 
    status?: string;
    lead_id?: string;
    deal_id?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from('activities').select('*');
      
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
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .select()
        .single();
      
      if (error) throw error;
      
      setActivities(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setActivities(prev => 
        prev.map(activity => activity.id === id ? data : activity)
      );
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    fetchActivities,
    createActivity,
    updateActivity,
  };
};