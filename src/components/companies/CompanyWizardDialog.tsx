import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DomainValidationStep } from "./wizard/DomainValidationStep";
import { DuplicateResolutionStep } from "./wizard/DuplicateResolutionStep";
import { CompanyDetailsStep } from "./wizard/CompanyDetailsStep";
import { useCompanyValidation } from "@/hooks/useCompanyValidation";

export interface CompanyFormData {
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

interface CompanyWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<boolean>;
  editingCompany?: any | null;
}

type WizardStep = 'domain' | 'duplicates' | 'details';

export const CompanyWizardDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingCompany 
}: CompanyWizardDialogProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('domain');
  const [domain, setDomain] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [formData, setFormData] = useState<CompanyFormData | null>(null);

  const { validateCompany, createCompanyWithAudit, isValidating, duplicates, clearDuplicates } = useCompanyValidation();

  // Reset wizard when dialog opens/closes
  useEffect(() => {
    if (isOpen && !editingCompany) {
      setCurrentStep('domain');
      setDomain('');
      setCompanyName('');
      setFormData(null);
      clearDuplicates();
    } else if (editingCompany) {
      // Skip to details step for editing
      setCurrentStep('details');
      setDomain(editingCompany.website || '');
      setCompanyName(editingCompany.company_name || '');
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
    }
  }, [isOpen, editingCompany, clearDuplicates]);

  const handleDomainValidated = (validatedDomain: string, extractedName: string, hasDuplicates: boolean) => {
    setDomain(validatedDomain);
    setCompanyName(extractedName);
    
    if (hasDuplicates) {
      setCurrentStep('duplicates');
    } else {
      // Pre-populate form data and go to details
      setFormData({
        company_name: extractedName,
        service_type: "LMS",
        contract_value: 50000,
        currency: "USD",
        lifecycle_stage: "lead",
        onboarding_status: "pending",
        notes: "",
        primary_contact_phone: "",
        account_manager: "",
        industry: "",
        website: validatedDomain,
        employee_count: 0,
        phone: "",
        address: "",
        city: "",
        state: "",
        postal_code: ""
      });
      setCurrentStep('details');
    }
  };

  const handleSelectExistingCompany = (company: any) => {
    // Close dialog and potentially navigate to existing company
    onClose();
    console.log('Selected existing company:', company);
  };

  const handleCreateNewCompany = () => {
    // Pre-populate form data and go to details
    setFormData({
      company_name: companyName,
      service_type: "LMS",
      contract_value: 50000,
      currency: "USD",
      lifecycle_stage: "lead",
      onboarding_status: "pending",
      notes: "",
      primary_contact_phone: "",
      account_manager: "",
      industry: "",
      website: domain,
      employee_count: 0,
      phone: "",
      address: "",
      city: "",
      state: "",
      postal_code: ""
    });
    setCurrentStep('details');
  };

  const handleFormSubmit = async (data: CompanyFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
    return success;
  };

  const handleBack = () => {
    if (currentStep === 'duplicates') {
      setCurrentStep('domain');
      clearDuplicates();
    } else if (currentStep === 'details') {
      if (duplicates.length > 0) {
        setCurrentStep('duplicates');
      } else {
        setCurrentStep('domain');
      }
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'domain':
        return editingCompany ? "Edit Company" : "Company Website";
      case 'duplicates':
        return "Potential Duplicates Found";
      case 'details':
        return editingCompany ? "Edit Company Details" : "Company Details";
      default:
        return "Add Company";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'domain':
        return editingCompany 
          ? "Update the company information below."
          : "Enter the company's website to check for duplicates and pre-populate information.";
      case 'duplicates':
        return "We found potential duplicates. You can select an existing company or create a new one.";
      case 'details':
        return editingCompany
          ? "Update the company information below."
          : "Complete the company information to create the record.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {currentStep !== 'domain' && !editingCompany && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1">
              <DialogTitle>{getStepTitle()}</DialogTitle>
              <DialogDescription className="mt-1">
                {getStepDescription()}
              </DialogDescription>
            </div>
          </div>
          
          {!editingCompany && (
            <div className="flex items-center gap-2 mt-4">
              <div className={`h-2 w-8 rounded-full ${
                currentStep === 'domain' ? 'bg-primary' : 'bg-muted'
              }`} />
              <div className={`h-2 w-8 rounded-full ${
                currentStep === 'duplicates' ? 'bg-primary' : 'bg-muted'
              }`} />
              <div className={`h-2 w-8 rounded-full ${
                currentStep === 'details' ? 'bg-primary' : 'bg-muted'
              }`} />
            </div>
          )}
        </DialogHeader>

        {currentStep === 'domain' && (
          <DomainValidationStep
            onValidated={handleDomainValidated}
            initialDomain={domain}
            validateCompany={validateCompany}
            isValidating={isValidating}
          />
        )}

        {currentStep === 'duplicates' && (
          <DuplicateResolutionStep
            duplicates={duplicates}
            companyName={companyName}
            domain={domain}
            onSelectExisting={handleSelectExistingCompany}
            onCreateNew={handleCreateNewCompany}
            onBack={() => setCurrentStep('domain')}
          />
        )}

        {currentStep === 'details' && formData && (
          <CompanyDetailsStep
            formData={formData}
            onSubmit={handleFormSubmit}
            editingCompany={editingCompany}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};