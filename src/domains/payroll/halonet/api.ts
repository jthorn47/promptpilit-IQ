// HALOnet API Client
import { supabase } from '@/integrations/supabase/client';
import {
  PaymentBatch,
  PaymentEntry,
  ApprovalRequest,
  RiskControl,
  RiskEvent,
  CreateBatchRequest,
  HALOcalcIntegrationRequest,
  ProviderSubmissionResponse
} from './types';

export class HALOnetAPI {
  // Batch Management
  async createBatch(request: CreateBatchRequest): Promise<PaymentBatch> {
    const { data, error } = await supabase.functions.invoke('halonet-create-batch', {
      body: request
    });

    if (error) {
      throw new Error(`Failed to create payment batch: ${error.message}`);
    }

    return data;
  }

  async getBatches(companyId?: string, status?: string): Promise<PaymentBatch[]> {
    let query = supabase
      .from('halonet_payment_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch payment batches: ${error.message}`);
    }

    return data as PaymentBatch[];
  }

  async getBatch(batchId: string): Promise<PaymentBatch | null> {
    const { data, error } = await supabase
      .from('halonet_payment_batches')
      .select('*, halonet_payment_entries(*)')
      .eq('id', batchId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch payment batch: ${error.message}`);
    }

    return data as PaymentBatch;
  }

  // HALOcalc Integration
  async createBatchFromHALOcalc(request: HALOcalcIntegrationRequest): Promise<PaymentBatch> {
    const { data, error } = await supabase.functions.invoke('halonet-from-halocalc', {
      body: request
    });

    if (error) {
      throw new Error(`Failed to create batch from HALOcalc: ${error.message}`);
    }

    return data;
  }

  // Approval Workflow
  async requestApproval(batchId: string, reason?: string): Promise<ApprovalRequest> {
    const { data, error } = await supabase.functions.invoke('halonet-request-approval', {
      body: { batch_id: batchId, request_reason: reason }
    });

    if (error) {
      throw new Error(`Failed to request approval: ${error.message}`);
    }

    return data;
  }

  async approveRequest(approvalRequestId: string, comments?: string, twoFactorCode?: string): Promise<void> {
    const { error } = await supabase.functions.invoke('halonet-approve', {
      body: { 
        approval_request_id: approvalRequestId, 
        comments,
        two_factor_code: twoFactorCode
      }
    });

    if (error) {
      throw new Error(`Failed to approve request: ${error.message}`);
    }
  }

  async rejectRequest(approvalRequestId: string, comments: string): Promise<void> {
    const { error } = await supabase.functions.invoke('halonet-reject', {
      body: { 
        approval_request_id: approvalRequestId, 
        comments
      }
    });

    if (error) {
      throw new Error(`Failed to reject request: ${error.message}`);
    }
  }

  // Provider Submission
  async submitToProvider(batchId: string, providerId?: string): Promise<ProviderSubmissionResponse> {
    const { data, error } = await supabase.functions.invoke('halonet-submit-provider', {
      body: { batch_id: batchId, provider_id: providerId }
    });

    if (error) {
      throw new Error(`Failed to submit to provider: ${error.message}`);
    }

    return data;
  }

  // NACHA File Generation
  async generateNACHAFile(batchId: string): Promise<{ file_content: string; file_hash: string }> {
    const { data, error } = await supabase.functions.invoke('halonet-generate-nacha', {
      body: { batch_id: batchId }
    });

    if (error) {
      throw new Error(`Failed to generate NACHA file: ${error.message}`);
    }

    return data;
  }

  // Risk Management
  async getRiskControls(companyId: string): Promise<RiskControl[]> {
    const { data, error } = await supabase
      .from('halonet_risk_controls')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('priority');

    if (error) {
      throw new Error(`Failed to fetch risk controls: ${error.message}`);
    }

    return data as RiskControl[];
  }

  async getRiskEvents(companyId: string, status?: string): Promise<RiskEvent[]> {
    let query = supabase
      .from('halonet_risk_events')
      .select('*, halonet_risk_controls(control_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch risk events: ${error.message}`);
    }

    return data as RiskEvent[];
  }

  async resolveRiskEvent(eventId: string, resolution: string): Promise<void> {
    const { error } = await supabase.functions.invoke('halonet-resolve-risk', {
      body: { event_id: eventId, resolution }
    });

    if (error) {
      throw new Error(`Failed to resolve risk event: ${error.message}`);
    }
  }

  // Payment Status Updates
  async voidPayment(entryId: string, reason: string): Promise<void> {
    const { error } = await supabase.functions.invoke('halonet-void-payment', {
      body: { entry_id: entryId, reason }
    });

    if (error) {
      throw new Error(`Failed to void payment: ${error.message}`);
    }
  }

  async processReturn(entryId: string, returnCode: string, returnReason: string): Promise<void> {
    const { error } = await supabase.functions.invoke('halonet-process-return', {
      body: { entry_id: entryId, return_code: returnCode, return_reason: returnReason }
    });

    if (error) {
      throw new Error(`Failed to process return: ${error.message}`);
    }
  }

  // Dashboard and Monitoring
  async getDashboardMetrics(companyId: string, timeframe: '24h' | '7d' | '30d' = '24h') {
    const { data, error } = await supabase.functions.invoke('halonet-dashboard-metrics', {
      body: { company_id: companyId, timeframe }
    });

    if (error) {
      throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }

    return data;
  }

  async getPaymentStatus(batchId?: string, entryId?: string) {
    const { data, error } = await supabase.functions.invoke('halonet-payment-status', {
      body: { batch_id: batchId, entry_id: entryId }
    });

    if (error) {
      throw new Error(`Failed to fetch payment status: ${error.message}`);
    }

    return data;
  }

  // Webhooks
  async configureWebhook(companyId: string, webhookUrl: string, eventTypes: string[], secret: string) {
    const { data, error } = await supabase
      .from('halonet_webhooks')
      .insert({
        company_id: companyId,
        webhook_url: webhookUrl,
        event_types: eventTypes,
        webhook_secret: secret
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to configure webhook: ${error.message}`);
    }

    return data;
  }

  // Real-time Updates
  subscribeToPaymentUpdates(companyId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('halonet-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'halonet_payment_batches',
          filter: `company_id=eq.${companyId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'halonet_payment_entries',
          filter: `company_id=eq.${companyId}`
        },
        callback
      )
      .subscribe();

    return channel;
  }
}

// Singleton instance
export const halonetAPI = new HALOnetAPI();