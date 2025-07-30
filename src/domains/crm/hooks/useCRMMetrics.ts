import { useState, useEffect } from 'react';
import { crmAPI } from '../api';
import { CRMMetrics } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useCRMMetrics = () => {
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await crmAPI.getCRMMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching CRM metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch CRM metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    fetchMetrics,
  };
};