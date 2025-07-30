import { useState, useEffect } from 'react';
import { crmAPI } from '../api';
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
      const data = await crmAPI.getActivities(filters);
      setActivities(data);
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
      const data = await crmAPI.createActivity(activity);
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
      const data = await crmAPI.updateActivity(id, updates);
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