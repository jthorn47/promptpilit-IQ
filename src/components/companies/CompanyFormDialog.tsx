import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isValidEmail, sanitizePhone } from "@/utils/security";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyValidation } from "@/hooks/useCompanyValidation";
import { DuplicateWarning } from "@/components/company/DuplicateWarning";

const accountManagers = [
  "Kelly Steinacbk",
  "Makenna Thorn", 
  "Vicki Hageman",
  "Denise Sanchez"
];

interface CompanyFormData {
  company_name: string;
  service_type: string;
  contract_value: number;
  currency: string;
  lifecycle_stage: string;
  onboarding_status: string;
  notes: string;
  primary_contact_phone: string;
  account_manager: string;
  industry: string;
  website: string;
  employee_count: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  // Service-specific fields
  workers_comp_rate?: number;
  benefits_package?: string;
  current_payroll_provider?: string;
  payroll_frequency?: string;
  benefit_admin_needs?: string;
  pay_periods_per_year?: number;
  direct_deposit?: boolean;
  tax_filing_service?: boolean;
  hr_staff_count?: number;
  compliance_needs?: string;
  training_requirements?: string;
  plan_type?: string;
}

interface CompanyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<boolean>;
  editingCompany?: any | null;
}

const defaultFormData: CompanyFormData = {
  company_name: "",
  service_type: "LMS",
  contract_value: 50000,
  currency: "USD",
  lifecycle_stage: "lead",
  onboarding_status: "pending",
  notes: "",
  primary_contact_phone: "",
  account_manager: "",
  industry: "",
  website: "",
  employee_count: 0,
  phone: "",
  address: "",
  city: "",
  state: "",
  postal_code: ""
};

export const CompanyFormDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingCompany 
}: CompanyFormDialogProps) => {
  const [formData, setFormData] = useState<CompanyFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CompanyFormData>>({});
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  
  // Use the validation hook
  const { validateCompany, createCompanyWithAudit, isValidating, duplicates, clearDuplicates } = useCompanyValidation();

  // Reset form when dialog opens/closes or editing company changes
  useEffect(() => {
    if (editingCompany) {
      setFormData({
        company_name: editingCompany.company_name || "",
        service_type: editingCompany.service_type || "LMS",
        contract_value: editingCompany.contract_value || 50000,
        currency: editingCompany.currency || "USD",
        lifecycle_stage: editingCompany.lifecycle_stage || "lead",
        onboarding_status: editingCompany.onboarding_status || "pending",
        notes: editingCompany.notes || "",
        primary_contact_phone: editingCompany.primary_contact_phone || "",
        account_manager: editingCompany.account_manager || "",
        industry: editingCompany.industry || "",
        website: editingCompany.website || "",
        employee_count: editingCompany.employee_count || 0,
        phone: editingCompany.phone || "",
        address: editingCompany.address || "",
        city: editingCompany.city || "",
        state: editingCompany.state || "",
        postal_code: editingCompany.postal_code || ""
      });
    } else {
      setFormData(defaultFormData);
    }
    setShowDuplicateWarning(false);
    clearDuplicates();
  }, [editingCompany, isOpen, clearDuplicates]);

  const validateForm = () => {
    const newErrors: Partial<CompanyFormData> = {};

    // Email validation for website (if it looks like an email)
    if (formData.website && formData.website.includes('@') && !isValidEmail(formData.website)) {
      newErrors.website = "Please enter a valid email or website URL";
    }

    // Phone validation for primary contact phone
    if (formData.primary_contact_phone && formData.primary_contact_phone.length > 0) {
      const sanitized = sanitizePhone(formData.primary_contact_phone);
      if (sanitized.length < 10) {
        newErrors.primary_contact_phone = "Please enter a valid phone number (at least 10 digits)";
      }
    }

    // Phone validation for company phone
    if (formData.phone && formData.phone.length > 0) {
      const sanitized = sanitizePhone(formData.phone);
      if (sanitized.length < 10) {
        newErrors.phone = "Please enter a valid phone number (at least 10 digits)";
      }
    }

    // ZIP code validation (US format)
    if (formData.postal_code && formData.postal_code.length > 0) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formData.postal_code.trim())) {
        newErrors.postal_code = "Please enter a valid ZIP code (12345 or 12345-6789)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for duplicates before submitting (only for new companies)
      if (!editingCompany) {
        const validationResult = await validateCompany(formData.company_name, formData.website);
        
        if (!validationResult.isValid && validationResult.duplicates.length > 0) {
          setShowDuplicateWarning(true);
          setIsSubmitting(false);
          return;
        }
      }

      const success = await onSubmit(formData);
      if (success) {
        setErrors({});
        onClose();
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWithDuplicateOverride = async () => {
    setIsSubmitting(true);
    
    try {
      // Use the audit-enabled creation function
      const { data, error } = await createCompanyWithAudit(formData, true);
      
      if (error) {
        console.error('Error creating company:', error);
        return;
      }

      // Call the original onSubmit handler with success
      const success = await onSubmit(formData);
      if (success) {
        setErrors({});
        setShowDuplicateWarning(false);
        onClose();
      }
    } catch (error) {
      console.error('Company creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExistingCompany = (company: any) => {
    // Close the dialog and potentially navigate to the existing company
    setShowDuplicateWarning(false);
    onClose();
    // You could add navigation logic here if needed
    console.log('Selected existing company:', company);
  };

  const handleCancelDuplicateWarning = () => {
    setShowDuplicateWarning(false);
    clearDuplicates();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {showDuplicateWarning ? (
          <DuplicateWarning
            duplicates={duplicates}
            onSelectExisting={handleSelectExistingCompany}
            onCreateNew={handleCreateWithDuplicateOverride}
            onCancel={handleCancelDuplicateWarning}
            isCreating={isSubmitting}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Edit Company" : "Add New Company"}
              </DialogTitle>
              <DialogDescription>
                {editingCompany 
                  ? "Update the company information below."
                  : "Enter company details to create a new record. Companies are for prospects and leads. When deals close, they automatically become clients."
                }
              </DialogDescription>
              {!editingCompany && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    <strong>💡 New Workflow:</strong> Companies represent prospects in your sales pipeline. 
                    When you close a deal as "Won", the company automatically migrates to the Clients table with proper source tracking.
                  </p>
                </div>
              )}
            </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Enter company name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Service Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type *</Label>
            <Select 
              value={formData.service_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LMS">LMS (Learning Management System)</SelectItem>
                <SelectItem value="PEO">PEO (Professional Employer Organization)</SelectItem>
                <SelectItem value="ASO">ASO (Administrative Services Only)</SelectItem>
                <SelectItem value="Payroll">Payroll Services</SelectItem>
                <SelectItem value="HRO">HRO (Human Resources Outsourcing)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lifecycle_stage">Lifecycle Stage *</Label>
              <Select 
                value={formData.lifecycle_stage} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lifecycle_stage: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Technology, Healthcare"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Contract Information - Only show if lifecycle_stage is opportunity or client */}
          {(formData.lifecycle_stage === 'opportunity' || formData.lifecycle_stage === 'client') && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">Contract Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_value">Contract Value</Label>
                  <Input
                    id="contract_value"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.contract_value}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contract_value: parseInt(e.target.value) || 0 
                    }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Onboarding Status - Only show if lifecycle_stage is client */}
              {formData.lifecycle_stage === 'client' && (
                <div className="space-y-2">
                  <Label htmlFor="onboarding_status">Onboarding Status</Label>
                  <Select 
                    value={formData.onboarding_status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, onboarding_status: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select onboarding status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Contact Information and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://company.com"
                disabled={isSubmitting}
                className={errors.website ? "border-destructive" : ""}
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Company Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_contact_phone">Primary Contact Phone</Label>
              <Input
                id="primary_contact_phone"
                value={formData.primary_contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
                className={errors.primary_contact_phone ? "border-destructive" : ""}
              />
              {errors.primary_contact_phone && (
                <p className="text-sm text-destructive">{errors.primary_contact_phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_manager">Account Manager</Label>
              <Select 
                value={formData.account_manager} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, account_manager: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account manager" />
                </SelectTrigger>
                <SelectContent>
                  {accountManagers.map(manager => (
                    <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              placeholder="12345 or 12345-6789"
              disabled={isSubmitting}
              className={errors.postal_code ? "border-destructive" : ""}
            />
            {errors.postal_code && (
              <p className="text-sm text-destructive">{errors.postal_code}</p>
            )}
          </div>

          {/* Service-Specific Fields */}
          {formData.service_type === "PEO" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">PEO Specific Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_count">Employee Count</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    min="1"
                    value={formData.employee_count || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_count: parseInt(e.target.value) || 0 }))}
                    placeholder="Number of employees"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workers_comp_rate">Workers' Comp Rate (%)</Label>
                  <Input
                    id="workers_comp_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.workers_comp_rate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, workers_comp_rate: parseFloat(e.target.value) || undefined }))}
                    placeholder="Rate percentage"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits_package">Benefits Package</Label>
                <Textarea
                  id="benefits_package"
                  value={formData.benefits_package || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, benefits_package: e.target.value }))}
                  placeholder="Describe benefits package requirements"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {formData.service_type === "ASO" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">ASO Specific Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_payroll_provider">Current Payroll Provider</Label>
                  <Input
                    id="current_payroll_provider"
                    value={formData.current_payroll_provider || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_payroll_provider: e.target.value }))}
                    placeholder="Current provider name"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payroll_frequency">Payroll Frequency</Label>
                  <Select 
                    value={formData.payroll_frequency || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payroll_frequency: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefit_admin_needs">Benefit Administration Needs</Label>
                <Textarea
                  id="benefit_admin_needs"
                  value={formData.benefit_admin_needs || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, benefit_admin_needs: e.target.value }))}
                  placeholder="Describe benefit administration requirements"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {formData.service_type === "Payroll" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">Payroll Service Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay_periods_per_year">Pay Periods Per Year</Label>
                  <Input
                    id="pay_periods_per_year"
                    type="number"
                    min="12"
                    max="52"
                    value={formData.pay_periods_per_year || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, pay_periods_per_year: parseInt(e.target.value) || undefined }))}
                    placeholder="e.g., 26 for bi-weekly"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direct_deposit">Direct Deposit Required</Label>
                  <Select 
                    value={formData.direct_deposit?.toString() || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, direct_deposit: value === 'true' }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_filing_service">Tax Filing Service</Label>
                <Select 
                  value={formData.tax_filing_service?.toString() || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tax_filing_service: value === 'true' }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes, include tax filing</SelectItem>
                    <SelectItem value="false">No, separate service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.service_type === "HRO" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">HRO Specific Information</h3>
              <div className="space-y-2">
                <Label htmlFor="hr_staff_count">Current HR Staff Count</Label>
                <Input
                  id="hr_staff_count"
                  type="number"
                  min="0"
                  value={formData.hr_staff_count || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hr_staff_count: parseInt(e.target.value) || undefined }))}
                  placeholder="Number of current HR staff"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_needs">Compliance Needs</Label>
                <Textarea
                  id="compliance_needs"
                  value={formData.compliance_needs || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, compliance_needs: e.target.value }))}
                  placeholder="Describe specific compliance requirements (OSHA, DOL, etc.)"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="training_requirements">Training Requirements</Label>
                <Textarea
                  id="training_requirements"
                  value={formData.training_requirements || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, training_requirements: e.target.value }))}
                  placeholder="Describe employee training needs"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {formData.service_type === "LMS" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">LMS Specific Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_count">Number of Learners</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    min="1"
                    value={formData.employee_count || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_count: parseInt(e.target.value) || 0 }))}
                    placeholder="Number of learners"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_type">LMS Plan Type</Label>
                  <Select 
                    value={formData.plan_type || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="easier">Easier</SelectItem>
                      <SelectItem value="easiest">Easiest</SelectItem>
                      <SelectItem value="plan_only">Plan Only</SelectItem>
                      <SelectItem value="custom_video">Custom Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="training_requirements">Training Focus Areas</Label>
                <Input
                  id="training_requirements"
                  value={formData.training_requirements || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, training_requirements: e.target.value }))}
                  placeholder="e.g., Safety, Compliance, Skills"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this company..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.company_name.trim()}
            >
              {isSubmitting ? "Saving..." : (editingCompany ? "Update Company" : "Create Company")}
            </Button>
          </DialogFooter>
         </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};