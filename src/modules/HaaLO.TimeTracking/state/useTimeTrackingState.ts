import { useState, useEffect } from 'react';
import { TimeTrackingService, TimeTrackingConfig } from '../services/TimeTrackingService';
import { useToast } from "@/hooks/use-toast";

export const useTimeTrackingState = (clientId?: string) => {
  const [config, setConfig] = useState<TimeTrackingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConfig = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const data = await TimeTrackingService.getConfig(clientId);
      setConfig(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch time tracking config",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<TimeTrackingConfig>) => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const updatedConfig = await TimeTrackingService.updateConfig(clientId, updates);
      setConfig(updatedConfig);
      toast({
        title: "Success",
        description: "Time tracking configuration updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [clientId]);

  return {
    config,
    loading,
    updateConfig,
    fetchConfig
  };
};