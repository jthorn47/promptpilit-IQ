import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  benchmarkApi,
  costModelApi,
  recommendationApi,
  carrierIntegrationApi,
  planComparisonApi,
  roiAnalysisApi,
  riskAdjustmentApi,
  benchmarkingSessionApi,
  globalConfigApi
} from '../services/api';

// Market Benchmarks Hooks
export const useMarketBenchmarks = (filters?: any) => {
  return useQuery({
    queryKey: ['benefitsiq-benchmarks', filters],
    queryFn: () => benchmarkApi.getMarketBenchmarks(filters)
  });
};

export const useCreateMarketBenchmark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: benchmarkApi.createMarketBenchmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-benchmarks'] });
      toast({
        title: "Success",
        description: "Market benchmark created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create market benchmark",
        variant: "destructive"
      });
    }
  });
};

// Cost Models Hooks
export const useCostModels = (companyId?: string) => {
  return useQuery({
    queryKey: ['benefitsiq-cost-models', companyId],
    queryFn: () => costModelApi.getCostModels(companyId)
  });
};

export const useCreateCostModel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: costModelApi.createCostModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-cost-models'] });
      toast({
        title: "Success",
        description: "Cost model created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create cost model",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateCostModel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      costModelApi.updateCostModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-cost-models'] });
      toast({
        title: "Success",
        description: "Cost model updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update cost model",
        variant: "destructive"
      });
    }
  });
};

// Employee Recommendations Hooks
export const useEmployeeRecommendations = (companyId: string, employeeId?: string) => {
  return useQuery({
    queryKey: ['benefitsiq-recommendations', companyId, employeeId],
    queryFn: () => recommendationApi.getEmployeeRecommendations(companyId, employeeId),
    enabled: !!companyId
  });
};

export const useCreateEmployeeRecommendation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: recommendationApi.createEmployeeRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-recommendations'] });
      toast({
        title: "Success",
        description: "Employee recommendation created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create employee recommendation",
        variant: "destructive"
      });
    }
  });
};

// Carrier Integrations Hooks
export const useCarrierIntegrations = () => {
  return useQuery({
    queryKey: ['benefitsiq-carrier-integrations'],
    queryFn: carrierIntegrationApi.getCarrierIntegrations
  });
};

export const useCreateCarrierIntegration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: carrierIntegrationApi.createCarrierIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-carrier-integrations'] });
      toast({
        title: "Success",
        description: "Carrier integration created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create carrier integration",
        variant: "destructive"
      });
    }
  });
};

export const useTriggerCarrierSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: carrierIntegrationApi.triggerSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-carrier-integrations'] });
      toast({
        title: "Success",
        description: "Carrier sync triggered successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to trigger carrier sync",
        variant: "destructive"
      });
    }
  });
};

// Plan Comparisons Hooks
export const usePlanComparisons = (companyId: string) => {
  return useQuery({
    queryKey: ['benefitsiq-plan-comparisons', companyId],
    queryFn: () => planComparisonApi.getPlanComparisons(companyId),
    enabled: !!companyId
  });
};

export const useCreatePlanComparison = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: planComparisonApi.createPlanComparison,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-plan-comparisons'] });
      toast({
        title: "Success",
        description: "Plan comparison created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create plan comparison",
        variant: "destructive"
      });
    }
  });
};

// ROI Analysis Hooks
export const useROIAnalyses = (companyId: string) => {
  return useQuery({
    queryKey: ['benefitsiq-roi-analyses', companyId],
    queryFn: () => roiAnalysisApi.getROIAnalyses(companyId),
    enabled: !!companyId
  });
};

export const useCreateROIAnalysis = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: roiAnalysisApi.createROIAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-roi-analyses'] });
      toast({
        title: "Success",
        description: "ROI analysis created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create ROI analysis",
        variant: "destructive"
      });
    }
  });
};

// Global Config Hooks
export const useGlobalConfig = () => {
  return useQuery({
    queryKey: ['benefitsiq-global-config'],
    queryFn: globalConfigApi.getGlobalConfig
  });
};

export const useConfigByKey = (key: string) => {
  return useQuery({
    queryKey: ['benefitsiq-config', key],
    queryFn: () => globalConfigApi.getConfigByKey(key),
    enabled: !!key
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => 
      globalConfigApi.updateConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-global-config'] });
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-config'] });
      toast({
        title: "Success",
        description: "Configuration updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    }
  });
};

// Benchmarking Sessions Hooks
export const useBenchmarkingSessions = (companyId: string) => {
  return useQuery({
    queryKey: ['benefitsiq-benchmarking-sessions', companyId],
    queryFn: () => benchmarkingSessionApi.getBenchmarkingSessions(companyId),
    enabled: !!companyId
  });
};

export const useCreateBenchmarkingSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: benchmarkingSessionApi.createBenchmarkingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitsiq-benchmarking-sessions'] });
      toast({
        title: "Success",
        description: "Benchmarking session created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create benchmarking session",
        variant: "destructive"
      });
    }
  });
};