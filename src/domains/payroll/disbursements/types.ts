export interface DisbursementVendor {
  id: string;
  vendor_name: string;
  vendor_type: 'tax_agency' | 'garnishment_agency' | 'benefit_provider' | 'chargeback_vendor';
  company_id: string;
  is_active: boolean;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorType: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  routingNumber: string;
  dueDate: string;
  paymentDetails: any;
  status: string;
}

export interface PayrollTaxPayment extends VendorPayment {
  taxPeriod: {
    start: string;
    end: string;
  };
  taxBreakdown: any;
  filingFrequency: string;
}

export interface GarnishmentPayment extends VendorPayment {
  employeeGarnishments: Array<{
    employeeId: string;
    amount: number;
    deductionType: string;
    description: string;
  }>;
  caseNumbers: string[];
  remittanceInfo: any;
}

export interface BenefitPayment extends VendorPayment {
  employeeBenefits: Array<{
    employeeId: string;
    amount: number;
    benefitType: string;
    isPreTax: boolean;
  }>;
  benefitTypes: string[];
  enrollmentPeriod: {
    start: string;
    end: string;
  };
}

export interface ChargebackPayment extends VendorPayment {
  chargebackReasons: string[];
  totalChargebacks: number;
  chargebackFees: number;
}