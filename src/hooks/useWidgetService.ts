import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WidgetService, WidgetDefinition, UserWidgetPreference } from '@/services/WidgetService';

export const useWidgetService = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetDefinition[]>([]);
  const [preferences, setPreferences] = useState<UserWidgetPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const service = WidgetService.getInstance();

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [widgetsData, preferencesData] = await Promise.all([
        service.fetchAvailableWidgets(),
        service.fetchUserPreferences(user.id)
      ]);
      
      setWidgets(widgetsData);
      setPreferences(preferencesData);
    } catch (err) {
      console.error('Error fetching widget data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
    } finally {
      setLoading(false);
    }
  }, [user, service]);

  const addWidget = useCallback(async (widgetId: string, position?: number): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      await service.addWidget(user.id, widgetId, position);
      await fetchData(); // Refresh data
      return true;
    } catch (err) {
      console.error('Error adding widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to add widget');
      return false;
    }
  }, [user, service, fetchData]);

  const removeWidget = useCallback(async (widgetId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      await service.removeWidget(user.id, widgetId);
      await fetchData(); // Refresh data
      return true;
    } catch (err) {
      console.error('Error removing widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove widget');
      return false;
    }
  }, [user, service, fetchData]);

  const toggleWidget = useCallback(async (widgetId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      await service.toggleWidget(user.id, widgetId, preferences);
      await fetchData(); // Refresh data
      return true;
    } catch (err) {
      console.error('Error toggling widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle widget');
      return false;
    }
  }, [user, service, preferences, fetchData]);

  const reorderWidgets = useCallback(async (reorderedPreferences: UserWidgetPreference[]): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      await service.reorderWidgets(user.id, reorderedPreferences);
      await fetchData(); // Refresh data
      return true;
    } catch (err) {
      console.error('Error reordering widgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder widgets');
      return false;
    }
  }, [user, service, fetchData]);

  const getAvailableToAdd = useCallback(() => {
    return service.getAvailableToAdd(widgets, preferences);
  }, [service, widgets, preferences]);

  const getEnabledWidgets = useCallback(() => {
    return service.getEnabledWidgets(preferences);
  }, [service, preferences]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    widgets,
    preferences,
    loading,
    error,
    addWidget,
    removeWidget,
    toggleWidget,
    reorderWidgets,
    getAvailableToAdd,
    getEnabledWidgets,
    refresh: fetchData
  };
};