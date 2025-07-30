export interface PricingModel {
  id: string;
  company_id?: string;
  name: string;
  model_type: 'per_check' | 'per_employee' | 'flat_fee' | 'hybrid';
  base_rate: number;
  per_check_rate?: number;
  per_employee_rate?: number;
  minimum_fee?: number;
  maximum_fee?: number;
  is_active: boolean;
  effective_date: string;
  expires_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureSku {
  id: string;
  sku_code: string;
  feature_name: string;
  description?: string;
  pricing_type: 'one_time' | 'monthly' | 'per_use' | 'per_employee';
  unit_price: number;
  billing_trigger: 'activation' | 'usage' | 'monthly' | 'quarterly' | 'annually';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientSubscription {
  id: string;
  client_id: string;
  pricing_model_id?: string;
  status: 'active' | 'suspended' | 'cancelled' | 'pending';
  billing_frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'annually';
  next_billing_date: string;
  grace_period_days: number;
  auto_cutoff_enabled: boolean;
  cutoff_grace_days: number;
  created_at: string;
  updated_at: string;
  pricing_model?: PricingModel;
  client?: {
    id: string;
    company_name: string;
  };
}

export interface Invoice {
  id: string;
  client_id: string;
  subscription_id?: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  billing_period_start: string;
  billing_period_end: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  paid_date?: string;
  payment_method?: 'ach' | 'credit_card' | 'wire' | 'check';
  payment_reference?: string;
  late_fee_amount: number;
  pdf_url?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    company_name: string;
  };
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  feature_sku_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  usage_period_start?: string;
  usage_period_end?: string;
  metadata?: Record<string, any>;
  created_at: string;
  feature_sku?: FeatureSku;
}

export interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  payment_method: 'ach' | 'credit_card' | 'wire' | 'check' | 'manual';
  processor: 'stripe' | 'modern_treasury' | 'manual';
  processor_payment_id?: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  failure_reason?: string;
  processed_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  partner_name: string;
  partner_type: 'broker' | 'referral' | 'reseller' | 'implementation';
  commission_rate: number;
  payment_schedule: 'weekly' | 'monthly' | 'quarterly';
  minimum_payout: number;
  contact_email: string;
  tax_id?: string;
  payment_method: 'ach' | 'wire' | 'check';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  partner_id: string;
  client_id: string;
  invoice_id: string;
  commission_period_start: string;
  commission_period_end: string;
  revenue_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  paid_date?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
  partner?: Partner;
  client?: {
    id: string;
    company_name: string;
  };
}

export interface RevenueMetric {
  id: string;
  metric_date: string;
  metric_type: 'daily_revenue' | 'monthly_recurring' | 'annual_recurring' | 'churn_rate' | 'new_revenue';
  amount: number;
  client_count?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BillingAlert {
  id: string;
  alert_type: 'missed_billing' | 'payment_failure' | 'high_usage' | 'commission_due' | 'revenue_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  client_id?: string;
  invoice_id?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  client_id: string;
  feature_sku_id: string;
  usage_date: string;
  usage_type: string;
  quantity: number;
  metadata?: Record<string, any>;
  billable_amount?: number;
  processed: boolean;
  created_at: string;
  feature_sku?: FeatureSku;
  client?: {
    id: string;
    company_name: string;
  };
}