import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/modules/HaaLO.CRM/types';
import { useToast } from '@/hooks/use-toast';

interface UseActivityFeedProps {
  entityType: 'company' | 'client';
  entityId: string;
  showChildren?: boolean;
  typeFilter?: string;
  limit?: number;
}

interface ActivityStats {
  total: number;
  thisWeek: number;
  completed: number;
  pending: number;
  byType: Record<string, number>;
}

export const useActivityFeed = ({
  entityType,
  entityId,
  showChildren = false,
  typeFilter,
  limit = 5
}: UseActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('activities').select('*');

      // Apply entity-specific filters
      if (entityType === 'company') {
        query = query.eq('company_id', entityId);
      } else if (entityType === 'client') {
        // For client view, get activities related to that client's company
        const { data: clientData } = await supabase
          .from('clients')
          .select('company_settings_id, company_name')
          .eq('id', entityId)
          .single();

        if (clientData?.company_settings_id) {
          query = query.eq('company_id', clientData.company_settings_id);
        } else {
          // If no company found, return empty results
          setActivities([]);
          setStats(null);
          setLoading(false);
          return;
        }
      }

      // Apply type filter
      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }

      // Order and limit
      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      setActivities(data || []);
      
      // Calculate stats for all activities (not just limited set)
      await calculateStats();
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      let statsQuery = supabase.from('activities').select('type, status, created_at');

      // Apply same entity filters as main query
      if (entityType === 'company') {
        statsQuery = statsQuery.eq('company_id', entityId);
      } else if (entityType === 'client') {
        const { data: clientData } = await supabase
          .from('clients')
          .select('company_settings_id, company_name')
          .eq('id', entityId)
          .single();

        if (clientData?.company_settings_id) {
          statsQuery = statsQuery.eq('company_id', clientData.company_settings_id);
        } else {
          return; // No stats if no company found
        }
      }

      const { data: allActivities } = await statsQuery;

      if (allActivities) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const stats: ActivityStats = {
          total: allActivities.length,
          thisWeek: allActivities.filter(a => new Date(a.created_at) >= oneWeekAgo).length,
          completed: allActivities.filter(a => a.status === 'completed').length,
          pending: allActivities.filter(a => a.status !== 'completed').length,
          byType: {}
        };

        // Count by type
        allActivities.forEach(activity => {
          stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
        });

        setStats(stats);
      }
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  const refreshActivities = () => {
    fetchActivities();
  };

  useEffect(() => {
    if (entityId) {
      fetchActivities();
    }
  }, [entityType, entityId, showChildren, typeFilter, limit]);

  // Set up real-time subscription for activities
  useEffect(() => {
    if (!entityId) return;

    const channel = supabase
      .channel('activity-feed-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          // Refresh activities when any activity changes
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityId, entityType, showChildren, typeFilter, limit]);

  return {
    activities,
    stats,
    loading,
    error,
    refreshActivities
  };
};