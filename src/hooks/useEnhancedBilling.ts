import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BillingIntegration {
  id: string;
  company_id: string;
  retainer_id: string;
  billing_period_start: string;
  billing_period_end: string;
  base_retainer_amount: number;
  hours_included: number;
  hours_used: number;
  overage_hours: number;
  overage_rate: number;
  overage_amount: number;
  case_hours_breakdown: any[];
  service_hours_breakdown: any[];
  discount_applied?: number;
  discount_reason?: string;
  invoice_generated: boolean;
  invoice_id?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'invoiced' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface BillingPreview {
  retainer_base: number;
  overage_hours: number;
  overage_amount: number;
  total_amount: number;
  breakdown: {
    case_work: { hours: number; amount: number };
    service_delivery: { hours: number; amount: number };
    consultation: { hours: number; amount: number };
    document_prep: { hours: number; amount: number };
  };
  discounts: any[];
  taxes: any[];
}

export const useEnhancedBilling = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: billingPeriods, isLoading } = useQuery({
    queryKey: ['billing-periods', companyId],
    queryFn: async () => {
      let query = supabase
        .from('billing_integrations')
        .select('*')
        .order('billing_period_start', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BillingIntegration[];
    },
    enabled: !!companyId,
  });

  const generateBillingPreviewMutation = useMutation({
    mutationFn: async ({ 
      companyId, 
      retainerId, 
      periodStart, 
      periodEnd 
    }: { 
      companyId: string; 
      retainerId: string; 
      periodStart: string; 
      periodEnd: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-billing-preview', {
        body: { companyId, retainerId, periodStart, periodEnd }
      });

      if (error) throw error;
      return data as BillingPreview;
    },
    onSuccess: () => {
      toast({
        title: 'Preview Generated',
        description: 'Billing preview has been generated successfully',
      });
    },
  });

  const createBillingPeriodMutation = useMutation({
    mutationFn: async (billingData: Omit<BillingIntegration, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('billing_integrations')
        .insert(billingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-periods'] });
      toast({
        title: 'Success',
        description: 'Billing period created successfully',
      });
    },
  });

  const approveBillingMutation = useMutation({
    mutationFn: async ({ billingId, approvalNotes }: { billingId: string; approvalNotes?: string }) => {
      const { data, error } = await supabase
        .from('billing_integrations')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', billingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-periods'] });
      toast({
        title: 'Approved',
        description: 'Billing period has been approved',
      });
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (billingId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-billing', {
        body: { billingId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-periods'] });
      toast({
        title: 'Invoice Generated',
        description: 'Invoice has been generated and sent to client',
      });
    },
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async ({ 
      billingId, 
      discountAmount, 
      discountReason 
    }: { 
      billingId: string; 
      discountAmount: number; 
      discountReason: string; 
    }) => {
      const { data, error } = await supabase
        .from('billing_integrations')
        .update({
          discount_applied: discountAmount,
          discount_reason: discountReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', billingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-periods'] });
      toast({
        title: 'Discount Applied',
        description: 'Discount has been applied to the billing period',
      });
    },
  });

  const getCurrentBillingPeriod = () => {
    const now = new Date();
    return billingPeriods?.find(bp => {
      const start = new Date(bp.billing_period_start);
      const end = new Date(bp.billing_period_end);
      return now >= start && now <= end;
    });
  };

  const getPendingApprovals = () => {
    return billingPeriods?.filter(bp => bp.status === 'pending_approval') || [];
  };

  const getUnpaidInvoices = () => {
    return billingPeriods?.filter(bp => bp.status === 'invoiced') || [];
  };

  return {
    billingPeriods,
    isLoading,
    generateBillingPreview: generateBillingPreviewMutation.mutate,
    createBillingPeriod: createBillingPeriodMutation.mutate,
    approveBilling: approveBillingMutation.mutate,
    generateInvoice: generateInvoiceMutation.mutate,
    applyDiscount: applyDiscountMutation.mutate,
    getCurrentBillingPeriod,
    getPendingApprovals,
    getUnpaidInvoices,
  };
};