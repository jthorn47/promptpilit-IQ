import { useState, useEffect } from "react";
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
import { DialogFooter } from "@/components/ui/dialog";
import { isValidEmail, sanitizePhone } from "@/utils/security";
import type { CompanyFormData } from "../CompanyWizardDialog";

const accountManagers = [
  "Kelly Steinacbk",
  "Makenna Thorn", 
  "Vicki Hageman",
  "Denise Sanchez"
];

interface CompanyDetailsStepProps {
  formData: CompanyFormData;
  onSubmit: (data: CompanyFormData) => Promise<boolean>;
  editingCompany?: any | null;
}

export const CompanyDetailsStep = ({
  formData: initialFormData,
  onSubmit,
  editingCompany
}: CompanyDetailsStepProps) => {
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CompanyFormData>>({});

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const validateWebsite = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is allowed (not required)
    
    const trimmed = url.trim().toLowerCase();
    
    // If it contains @ symbol, treat as email
    if (trimmed.includes('@')) {
      return isValidEmail(trimmed);
    }
    
    // Very flexible website validation
    // Allow: company, company.com, www.company.com, company.co.uk, etc.
    // Basically just check that it doesn't have invalid characters
    const invalidChars = /[<>"`'|\\^~\[\]{}]/;
    const hasSpaces = /\s/;
    
    // Reject if it has invalid characters or spaces
    if (invalidChars.test(trimmed) || hasSpaces.test(trimmed)) {
      return false;
    }
    
    // Must have at least one character
    return trimmed.length > 0;
  };

  const formatPhoneAsYouType = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format as user types
    if (limitedDigits.length === 0) return '';
    if (limitedDigits.length <= 3) return `(${limitedDigits}`;
    if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  };

  const formatZipCode = (value: string): string => {
    // Remove all non-digits and limit to 5 digits
    return value.replace(/\D/g, '').slice(0, 5);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Empty is allowed
    
    const sanitized = sanitizePhone(phone);
    // US phone numbers should have exactly 10 digits
    return sanitized.length === 10;
  };

  const formatPhoneDisplay = (phone: string): string => {
    const sanitized = sanitizePhone(phone);
    if (sanitized.length === 10) {
      return `(${sanitized.slice(0, 3)}) ${sanitized.slice(3, 6)}-${sanitized.slice(6)}`;
    }
    return phone;
  };

  const validateForm = () => {
    const newErrors: Partial<CompanyFormData> = {};

    // Required field validation
    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    // Website validation - only validate if there's content
    if (formData.website && formData.website.trim() !== '' && !validateWebsite(formData.website)) {
      if (formData.website.includes('@')) {
        newErrors.website = "Please enter a valid email address";
      } else {
        newErrors.website = "Please enter a valid website (e.g., company.com)";
      }
    }

    // Phone validation for primary contact phone
    if (formData.primary_contact_phone && !validatePhone(formData.primary_contact_phone)) {
      newErrors.primary_contact_phone = "Please enter a valid 10-digit phone number";
    }

    // Phone validation for company phone
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // ZIP code validation (5 digits only)
    if (formData.postal_code && formData.postal_code.length > 0) {
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(formData.postal_code.trim())) {
        newErrors.postal_code = "Please enter a valid 5-digit ZIP code";
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
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <Select 
            value={formData.industry} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Professional Services">Professional Services</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Hospitality">Hospitality</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Non-Profit">Non-Profit</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contract Information - Only show if lifecycle_stage is opportunity or client */}
      {(formData.lifecycle_stage === 'opportunity' || formData.lifecycle_stage === 'client') && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold text-lg">Contract Information</h3>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="contract_value">Estimated Gross Profit</Label>
            <Input
              id="contract_value"
              type="number"
              min="0"
              step="1000"
              value={formData.contract_value === 0 ? '' : formData.contract_value}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ 
                  ...prev, 
                  contract_value: value === '' ? 0 : parseInt(value) || 0 
                }));
              }}
              placeholder="Enter amount in USD"
              disabled={isSubmitting}
            />
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
            placeholder="company.com"
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
            onChange={(e) => {
              const formatted = formatPhoneAsYouType(e.target.value);
              setFormData(prev => ({ ...prev, phone: formatted }));
            }}
            placeholder="(555) 123-4567"
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
            onChange={(e) => {
              const formatted = formatPhoneAsYouType(e.target.value);
              setFormData(prev => ({ ...prev, primary_contact_phone: formatted }));
            }}
            placeholder="(555) 123-4567"
            disabled={isSubmitting}
            className={errors.primary_contact_phone ? "border-destructive" : ""}
          />
          {errors.primary_contact_phone && (
            <p className="text-sm text-destructive">{errors.primary_contact_phone}</p>
          )}
        </div>

        {/* Account Manager - Only show when lifecycle_stage is client */}
        {formData.lifecycle_stage === 'client' && (
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
        )}
      </div>

      {/* Employee Count */}
      <div className="space-y-2">
        <Label htmlFor="employee_count">Employee Count</Label>
        <Input
          id="employee_count"
          type="number"
          min="0"
          value={formData.employee_count}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            employee_count: parseInt(e.target.value) || 0 
          }))}
          disabled={isSubmitting}
        />
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="font-semibold">Address Information</h3>
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="123 Main Street"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="postal_code">ZIP Code</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => {
                const formatted = formatZipCode(e.target.value);
                setFormData(prev => ({ ...prev, postal_code: formatted }));
              }}
              placeholder="12345"
              disabled={isSubmitting}
              className={errors.postal_code ? "border-destructive" : ""}
            />
            {errors.postal_code && (
              <p className="text-sm text-destructive">{errors.postal_code}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about the company..."
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (editingCompany ? "Update Company" : "Create Company")}
        </Button>
      </DialogFooter>
    </form>
  );
};