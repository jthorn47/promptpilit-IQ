import { supabase } from "@/integrations/supabase/client";
import type {
  PricingModel,
  FeatureSku,
  ClientSubscription,
  Invoice,
  InvoiceLineItem,
  Payment,
  Partner,
  Commission,
  RevenueMetric,
  BillingAlert,
  UsageTracking
} from "./types";

export class HALObillAPI {
  // Pricing Models
  async getPricingModels(): Promise<PricingModel[]> {
    const { data, error } = await supabase
      .from('halobill_pricing_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pricing models: ${error.message}`);
    }

    return data as PricingModel[];
  }

  async createPricingModel(model: Omit<PricingModel, 'id' | 'created_at' | 'updated_at'>): Promise<PricingModel> {
    const { data, error } = await supabase
      .from('halobill_pricing_models')
      .insert([model])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pricing model: ${error.message}`);
    }

    return data as PricingModel;
  }

  async updatePricingModel(id: string, updates: Partial<PricingModel>): Promise<PricingModel> {
    const { data, error } = await supabase
      .from('halobill_pricing_models')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update pricing model: ${error.message}`);
    }

    return data as PricingModel;
  }

  // Feature SKUs
  async getFeatureSkus(): Promise<FeatureSku[]> {
    const { data, error } = await supabase
      .from('halobill_feature_skus')
      .select('*')
      .order('feature_name');

    if (error) {
      throw new Error(`Failed to fetch feature SKUs: ${error.message}`);
    }

    return data as FeatureSku[];
  }

  async createFeatureSku(sku: Omit<FeatureSku, 'id' | 'created_at' | 'updated_at'>): Promise<FeatureSku> {
    const { data, error } = await supabase
      .from('halobill_feature_skus')
      .insert([sku])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feature SKU: ${error.message}`);
    }

    return data as FeatureSku;
  }

  // Client Subscriptions
  async getClientSubscriptions(): Promise<ClientSubscription[]> {
    const { data, error } = await supabase
      .from('halobill_client_subscriptions')
      .select(`
        *,
        pricing_model:halobill_pricing_models(*),
        client:clients(id, company_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch client subscriptions: ${error.message}`);
    }

    return data as ClientSubscription[];
  }

  async createClientSubscription(subscription: Omit<ClientSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<ClientSubscription> {
    const { data, error } = await supabase
      .from('halobill_client_subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client subscription: ${error.message}`);
    }

    return data as ClientSubscription;
  }

  // Invoices
  async getInvoices(filters?: { 
    status?: string; 
    client_id?: string; 
    date_from?: string; 
    date_to?: string;
  }): Promise<Invoice[]> {
    let query = supabase
      .from('halobill_invoices')
      .select(`
        *,
        client:clients(id, company_name),
        line_items:halobill_invoice_line_items(
          *,
          feature_sku:halobill_feature_skus(*)
        )
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }

    return data as Invoice[];
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'invoice_number'>): Promise<Invoice> {
    const invoiceWithNumber = {
      ...invoice,
      invoice_number: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const { data, error } = await supabase
      .from('halobill_invoices')
      .insert([invoiceWithNumber])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }

    return data as Invoice;
  }

  async addInvoiceLineItems(invoiceId: string, lineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]): Promise<InvoiceLineItem[]> {
    const itemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoice_id: invoiceId
    }));

    const { data, error } = await supabase
      .from('halobill_invoice_line_items')
      .insert(itemsWithInvoiceId)
      .select(`
        *,
        feature_sku:halobill_feature_skus(*)
      `);

    if (error) {
      throw new Error(`Failed to add invoice line items: ${error.message}`);
    }

    return data as InvoiceLineItem[];
  }

  async updateInvoiceStatus(invoiceId: string, status: Invoice['status'], metadata?: Record<string, any>): Promise<Invoice> {
    const updates: Partial<Invoice> = { status };
    
    if (status === 'paid') {
      updates.paid_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('halobill_invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update invoice status: ${error.message}`);
    }

    return data as Invoice;
  }

  // Payments
  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('halobill_payments')
      .insert([payment])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    return data as Payment;
  }

  async getPayments(filters?: { 
    status?: string; 
    invoice_id?: string; 
    client_id?: string; 
  }): Promise<Payment[]> {
    let query = supabase.from('halobill_payments').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.invoice_id) {
      query = query.eq('invoice_id', filters.invoice_id);
    }
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return data as Payment[];
  }

  // Partners & Commissions
  async getPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('halobill_partners')
      .select('*')
      .order('partner_name');

    if (error) {
      throw new Error(`Failed to fetch partners: ${error.message}`);
    }

    return data as Partner[];
  }

  async getCommissions(filters?: { 
    partner_id?: string; 
    status?: string; 
    period_start?: string; 
    period_end?: string; 
  }): Promise<Commission[]> {
    let query = supabase
      .from('halobill_commissions')
      .select(`
        *,
        partner:halobill_partners(*),
        client:clients(id, company_name)
      `);

    if (filters?.partner_id) {
      query = query.eq('partner_id', filters.partner_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.period_start) {
      query = query.gte('commission_period_start', filters.period_start);
    }
    if (filters?.period_end) {
      query = query.lte('commission_period_end', filters.period_end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch commissions: ${error.message}`);
    }

    return data as Commission[];
  }

  // Revenue Analytics
  async getRevenueMetrics(dateFrom?: string, dateTo?: string): Promise<RevenueMetric[]> {
    let query = supabase.from('halobill_revenue_metrics').select('*');

    if (dateFrom) {
      query = query.gte('metric_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('metric_date', dateTo);
    }

    const { data, error } = await query.order('metric_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch revenue metrics: ${error.message}`);
    }

    return data as RevenueMetric[];
  }

  // Billing Alerts
  async getBillingAlerts(resolved?: boolean): Promise<BillingAlert[]> {
    let query = supabase.from('halobill_billing_alerts').select('*');

    if (resolved !== undefined) {
      query = query.eq('resolved', resolved);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .order('severity', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch billing alerts: ${error.message}`);
    }

    return data as BillingAlert[];
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<BillingAlert> {
    const { data, error } = await supabase
      .from('halobill_billing_alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }

    return data as BillingAlert;
  }

  // Usage Tracking
  async trackUsage(usage: Omit<UsageTracking, 'id' | 'created_at' | 'processed'>): Promise<UsageTracking> {
    const { data, error } = await supabase
      .from('halobill_usage_tracking')
      .insert([{ ...usage, processed: false }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to track usage: ${error.message}`);
    }

    return data as UsageTracking;
  }

  async getUsageData(filters?: { 
    client_id?: string; 
    feature_sku_id?: string; 
    date_from?: string; 
    date_to?: string; 
  }): Promise<UsageTracking[]> {
    let query = supabase
      .from('halobill_usage_tracking')
      .select(`
        *,
        feature_sku:halobill_feature_skus(*),
        client:clients(id, company_name)
      `);

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    if (filters?.feature_sku_id) {
      query = query.eq('feature_sku_id', filters.feature_sku_id);
    }
    if (filters?.date_from) {
      query = query.gte('usage_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('usage_date', filters.date_to);
    }

    const { data, error } = await query.order('usage_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch usage data: ${error.message}`);
    }

    return data as UsageTracking[];
  }

  // Calculate pricing for a client
  async calculatePricing(
    clientId: string,
    employeeCount: number,
    checkCount: number,
    features: string[] = []
  ): Promise<{
    baseAmount: number;
    featureAmount: number;
    totalAmount: number;
    breakdown: Array<{ description: string; amount: number }>;
  }> {
    // Get client's subscription and pricing model
    const { data: subscription, error: subError } = await supabase
      .from('halobill_client_subscriptions')
      .select(`
        *,
        pricing_model:halobill_pricing_models(*)
      `)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      throw new Error('No active subscription found for client');
    }

    const model = subscription.pricing_model;
    if (!model) {
      throw new Error('No pricing model found for subscription');
    }

    let baseAmount = 0;
    const breakdown: Array<{ description: string; amount: number }> = [];

    // Calculate base pricing
    switch (model.model_type) {
      case 'per_check':
        baseAmount = (model.per_check_rate || 0) * checkCount;
        breakdown.push({ description: `${checkCount} checks @ $${model.per_check_rate}`, amount: baseAmount });
        break;
      
      case 'per_employee':
        baseAmount = (model.per_employee_rate || 0) * employeeCount;
        breakdown.push({ description: `${employeeCount} employees @ $${model.per_employee_rate}`, amount: baseAmount });
        break;
      
      case 'flat_fee':
        baseAmount = model.base_rate;
        breakdown.push({ description: 'Base service fee', amount: baseAmount });
        break;
      
      case 'hybrid':
        const checkAmount = (model.per_check_rate || 0) * checkCount;
        const employeeAmount = (model.per_employee_rate || 0) * employeeCount;
        baseAmount = model.base_rate + checkAmount + employeeAmount;
        
        breakdown.push({ description: 'Base fee', amount: model.base_rate });
        if (checkAmount > 0) {
          breakdown.push({ description: `${checkCount} checks @ $${model.per_check_rate}`, amount: checkAmount });
        }
        if (employeeAmount > 0) {
          breakdown.push({ description: `${employeeCount} employees @ $${model.per_employee_rate}`, amount: employeeAmount });
        }
        break;
    }

    // Apply minimum/maximum fee constraints
    if (model.minimum_fee && baseAmount < model.minimum_fee) {
      baseAmount = model.minimum_fee;
      breakdown.push({ description: 'Minimum fee adjustment', amount: model.minimum_fee - baseAmount });
    }
    if (model.maximum_fee && baseAmount > model.maximum_fee) {
      baseAmount = model.maximum_fee;
      breakdown.push({ description: 'Maximum fee cap', amount: model.maximum_fee - baseAmount });
    }

    // Calculate feature costs
    let featureAmount = 0;
    if (features.length > 0) {
      const { data: featureSkus, error: featureError } = await supabase
        .from('halobill_feature_skus')
        .select('*')
        .in('sku_code', features)
        .eq('is_active', true);

      if (featureError) {
        throw new Error(`Failed to fetch feature SKUs: ${featureError.message}`);
      }

      for (const sku of featureSkus || []) {
        let amount = 0;
        
        switch (sku.pricing_type) {
          case 'one_time':
          case 'monthly':
            amount = sku.unit_price;
            break;
          case 'per_employee':
            amount = sku.unit_price * employeeCount;
            break;
          case 'per_use':
            amount = sku.unit_price; // Would need usage data for accurate calculation
            break;
        }
        
        featureAmount += amount;
        breakdown.push({ description: sku.feature_name, amount });
      }
    }

    return {
      baseAmount,
      featureAmount,
      totalAmount: baseAmount + featureAmount,
      breakdown
    };
  }
}

export const halobillAPI = new HALObillAPI();