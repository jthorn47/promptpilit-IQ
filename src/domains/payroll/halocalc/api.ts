// HALOcalc API Client
import { supabase } from '@/integrations/supabase/client';
import {
  HALOcalcCalculateRequest,
  HALOcalcCalculateResponse,
  HALOcalcSimulateRequest,
  HALOcalcJobStatus,
  SimulationResult,
  ValidationResult,
  ProcessingError
} from './types';

export class HALOcalcAPI {
  private baseUrl = '/api/halocalc';

  // Core calculation endpoint
  async calculate(request: HALOcalcCalculateRequest): Promise<HALOcalcCalculateResponse> {
    const { data, error } = await supabase.functions.invoke('halocalc-calculate', {
      body: request
    });

    if (error) {
      throw new Error(`HALOcalc calculation failed: ${error.message}`);
    }

    return data;
  }

  // Simulation endpoint
  async simulate(request: HALOcalcSimulateRequest): Promise<SimulationResult[]> {
    const { data, error } = await supabase.functions.invoke('halocalc-simulate', {
      body: request
    });

    if (error) {
      throw new Error(`HALOcalc simulation failed: ${error.message}`);
    }

    return data;
  }

  // Job status checking for async operations
  async getJobStatus(jobId: string): Promise<HALOcalcJobStatus> {
    const { data, error } = await supabase.functions.invoke('halocalc-job-status', {
      body: { job_id: jobId }
    });

    if (error) {
      throw new Error(`Failed to get job status: ${error.message}`);
    }

    return data;
  }

  // Validation rules management
  async getValidationRules(companyId: string) {
    // This would typically call an edge function that manages validation rules
    const { data, error } = await supabase.functions.invoke('halocalc-validation-rules', {
      body: { company_id: companyId, action: 'list' }
    });

    if (error) {
      throw new Error(`Failed to fetch validation rules: ${error.message}`);
    }

    return data;
  }

  async createValidationRule(rule: any) {
    const { data, error } = await supabase.functions.invoke('halocalc-validation-rules', {
      body: { action: 'create', rule }
    });

    if (error) {
      throw new Error(`Failed to create validation rule: ${error.message}`);
    }

    return data;
  }

  // Error logging and retrieval
  async getProcessingErrors(employeeId?: string, startDate?: string, endDate?: string): Promise<ProcessingError[]> {
    const { data, error } = await supabase.functions.invoke('halocalc-errors', {
      body: { 
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate
      }
    });

    if (error) {
      throw new Error(`Failed to fetch processing errors: ${error.message}`);
    }

    return data;
  }

  // AI explanations
  async getAIExplanation(calculationId: string, lineItem: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('halocalc-ai-explain', {
      body: { 
        calculation_id: calculationId,
        line_item: lineItem
      }
    });

    if (error) {
      throw new Error(`Failed to get AI explanation: ${error.message}`);
    }

    return data.explanation;
  }

  // Bulk operations
  async calculateBatch(inputs: any[], options?: any): Promise<HALOcalcCalculateResponse> {
    const { data, error } = await supabase.functions.invoke('halocalc-calculate-batch', {
      body: { 
        inputs,
        options: {
          async_processing: true,
          ...options
        }
      }
    });

    if (error) {
      throw new Error(`Batch calculation failed: ${error.message}`);
    }

    return data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string; dependencies: any }> {
    const { data, error } = await supabase.functions.invoke('halocalc-health');

    if (error) {
      return {
        status: 'unhealthy',
        version: 'unknown',
        dependencies: { error: error.message }
      };
    }

    return data;
  }

  // Performance metrics
  async getPerformanceMetrics(timeframe: '1h' | '24h' | '7d' | '30d' = '24h') {
    const { data, error } = await supabase.functions.invoke('halocalc-metrics', {
      body: { timeframe }
    });

    if (error) {
      throw new Error(`Failed to fetch performance metrics: ${error.message}`);
    }

    return data;
  }
}

// Singleton instance
export const halocalcAPI = new HALOcalcAPI();