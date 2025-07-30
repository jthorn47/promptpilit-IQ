import { supabase } from "@/integrations/supabase/client";
import type {
  MarketBenchmark,
  CostModel,
  EmployeeRecommendation,
  CarrierIntegration,
  PlanComparison,
  ROIAnalysis,
  RiskAdjustment,
  BenchmarkingSession,
  GlobalConfig
} from '../types';

// Market Benchmarks API
export const benchmarkApi = {
  async getMarketBenchmarks(filters?: {
    industry?: string;
    region?: string;
    company_size_range?: string;
    benchmark_type?: string;
  }) {
    let query = supabase.from('benefitsiq_market_benchmarks').select('*');
    
    if (filters) {
      if (filters.industry) query = query.eq('industry', filters.industry);
      if (filters.region) query = query.eq('region', filters.region);
      if (filters.company_size_range) query = query.eq('company_size_range', filters.company_size_range);
      if (filters.benchmark_type) query = query.eq('benchmark_type', filters.benchmark_type);
    }
    
    return query.eq('is_active', true).order('updated_at', { ascending: false });
  },

  async createMarketBenchmark(data: Omit<MarketBenchmark, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_market_benchmarks').insert(data).select().single();
  },

  async updateMarketBenchmark(id: string, data: Partial<MarketBenchmark>) {
    return supabase.from('benefitsiq_market_benchmarks').update(data).eq('id', id).select().single();
  },

  async deleteMarketBenchmark(id: string) {
    return supabase.from('benefitsiq_market_benchmarks').update({ is_active: false }).eq('id', id);
  }
};

// Cost Models API
export const costModelApi = {
  async getCostModels(companyId?: string) {
    let query = supabase.from('benefitsiq_cost_models').select('*');
    if (companyId) query = query.eq('company_id', companyId);
    return query.order('updated_at', { ascending: false });
  },

  async createCostModel(data: Omit<CostModel, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_cost_models').insert(data).select().single();
  },

  async updateCostModel(id: string, data: Partial<CostModel>) {
    return supabase.from('benefitsiq_cost_models').update(data).eq('id', id).select().single();
  },

  async deleteCostModel(id: string) {
    return supabase.from('benefitsiq_cost_models').delete().eq('id', id);
  },

  async saveCostModel(id: string) {
    return supabase.from('benefitsiq_cost_models').update({ is_saved: true }).eq('id', id);
  }
};

// Employee Recommendations API
export const recommendationApi = {
  async getEmployeeRecommendations(companyId: string, employeeId?: string) {
    let query = supabase.from('benefitsiq_employee_recommendations').select('*').eq('company_id', companyId);
    if (employeeId) query = query.eq('employee_id', employeeId);
    return query.order('updated_at', { ascending: false });
  },

  async createEmployeeRecommendation(data: Omit<EmployeeRecommendation, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_employee_recommendations').insert(data).select().single();
  },

  async updateEmployeeRecommendation(id: string, data: Partial<EmployeeRecommendation>) {
    return supabase.from('benefitsiq_employee_recommendations').update(data).eq('id', id).select().single();
  }
};

// Carrier Integrations API
export const carrierIntegrationApi = {
  async getCarrierIntegrations() {
    return supabase.from('benefitsiq_carrier_integrations').select(`
      *,
      benefit_carriers (
        id,
        name,
        logo_url,
        contact_info
      )
    `).eq('is_active', true).order('updated_at', { ascending: false });
  },

  async createCarrierIntegration(data: Omit<CarrierIntegration, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_carrier_integrations').insert(data).select().single();
  },

  async updateCarrierIntegration(id: string, data: Partial<CarrierIntegration>) {
    return supabase.from('benefitsiq_carrier_integrations').update(data).eq('id', id).select().single();
  },

  async triggerSync(id: string) {
    return supabase.from('benefitsiq_carrier_integrations')
      .update({ 
        sync_status: 'running',
        last_sync_at: new Date().toISOString()
      })
      .eq('id', id);
  }
};

// Plan Comparisons API
export const planComparisonApi = {
  async getPlanComparisons(companyId: string) {
    return supabase.from('benefitsiq_plan_comparisons').select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
  },

  async createPlanComparison(data: Omit<PlanComparison, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_plan_comparisons').insert(data).select().single();
  },

  async updatePlanComparison(id: string, data: Partial<PlanComparison>) {
    return supabase.from('benefitsiq_plan_comparisons').update(data).eq('id', id).select().single();
  }
};

// ROI Analysis API
export const roiAnalysisApi = {
  async getROIAnalyses(companyId: string) {
    return supabase.from('benefitsiq_roi_analyses').select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
  },

  async createROIAnalysis(data: Omit<ROIAnalysis, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_roi_analyses').insert(data).select().single();
  },

  async updateROIAnalysis(id: string, data: Partial<ROIAnalysis>) {
    return supabase.from('benefitsiq_roi_analyses').update(data).eq('id', id).select().single();
  },

  async exportToPropGEN(id: string, workflowId: string) {
    return supabase.from('benefitsiq_roi_analyses')
      .update({ propgen_workflow_id: workflowId })
      .eq('id', id);
  }
};

// Risk Adjustments API
export const riskAdjustmentApi = {
  async getRiskAdjustments(companyId: string) {
    return supabase.from('benefitsiq_risk_adjustments').select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
  },

  async createRiskAdjustment(data: Omit<RiskAdjustment, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_risk_adjustments').insert(data).select().single();
  },

  async updateRiskAdjustment(id: string, data: Partial<RiskAdjustment>) {
    return supabase.from('benefitsiq_risk_adjustments').update(data).eq('id', id).select().single();
  }
};

// Benchmarking Sessions API
export const benchmarkingSessionApi = {
  async getBenchmarkingSessions(companyId: string) {
    return supabase.from('benefitsiq_benchmarking_sessions').select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
  },

  async createBenchmarkingSession(data: Omit<BenchmarkingSession, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_benchmarking_sessions').insert(data).select().single();
  },

  async updateBenchmarkingSession(id: string, data: Partial<BenchmarkingSession>) {
    return supabase.from('benefitsiq_benchmarking_sessions').update(data).eq('id', id).select().single();
  }
};

// Global Config API
export const globalConfigApi = {
  async getGlobalConfig() {
    return supabase.from('benefitsiq_global_config').select('*').order('config_key');
  },

  async getConfigByKey(key: string) {
    return supabase.from('benefitsiq_global_config').select('*').eq('config_key', key).single();
  },

  async updateConfig(key: string, value: Record<string, any>) {
    return supabase.from('benefitsiq_global_config')
      .update({ config_value: value })
      .eq('config_key', key)
      .select()
      .single();
  },

  async createConfig(data: Omit<GlobalConfig, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('benefitsiq_global_config').insert(data).select().single();
  }
};