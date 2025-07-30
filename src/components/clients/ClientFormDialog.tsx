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
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Handshake, Settings } from "lucide-react";
import { TagSelector } from "@/components/tags/TagSelector";
import type { Tag } from "@/services/tagService";

const accountManagers = [
  "Kelly Steinacbk",
  "Makenna Thorn", 
  "Vicki Hageman",
  "Denise Sanchez"
];

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientFormData {
  company_name: string;
  service_type: string;
  contract_value: number;
  currency: string;
  status: string;
  onboarding_status: string;
  plan_type: string;
  subscription_status: string;
  notes: string;
  primary_contact_phone: string;
  account_manager: string;
  // PEO specific fields
  employee_count?: number;
  workers_comp_rate?: number;
  benefits_package?: string;
  // ASO specific fields
  current_payroll_provider?: string;
  payroll_frequency?: string;
  benefit_admin_needs?: string;
  // Payroll specific fields
  pay_periods_per_year?: number;
  direct_deposit?: boolean;
  tax_filing_service?: boolean;
  // HRO specific fields
  hr_staff_count?: number;
  compliance_needs?: string;
  training_requirements?: string;
  source: string;
  tags?: Tag[];
}

interface ClientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<boolean>;
  editingClient?: Client | null;
}

const defaultFormData: ClientFormData = {
  company_name: "",
  service_type: "PEO",
  contract_value: 50000,
  currency: "USD",
  status: "active",
  onboarding_status: "pending",
  plan_type: "basic",
  subscription_status: "active",
  notes: "",
  primary_contact_phone: "",
  account_manager: "",
  source: "Manual Deal",
  tags: []
};

export const ClientFormDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingClient 
}: ClientFormDialogProps) => {
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or editing client changes
  useEffect(() => {
    if (editingClient) {
      setFormData({
        company_name: editingClient.company_name,
        service_type: "PEO", // Default for existing clients
        contract_value: editingClient.contract_value || 50000,
        currency: editingClient.currency || "USD",
        status: editingClient.status || "active",
        onboarding_status: editingClient.onboarding_status || "pending",
        plan_type: editingClient.plan_type || "basic",
        subscription_status: editingClient.subscription_status || "active",
        notes: editingClient.notes || "",
        primary_contact_phone: editingClient.primary_contact_phone || "",
        account_manager: editingClient.account_manager || "",
        source: editingClient.source || "Manual Deal",
        tags: [] // TODO: Load existing tags from backend
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [editingClient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingClient ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription>
            {editingClient 
              ? "Update the client information below."
              : "Create a new client record. Clients are revenue-generating organizations."
            }
          </DialogDescription>
          {!editingClient && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-green-800">
                <strong>💰 Client Records:</strong> Only revenue-generating organizations should be in the Clients table. 
                Use the Companies table for prospects and leads.
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

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <div className="flex items-center gap-2">
              <Select 
                value={formData.source} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eCommerce">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      eCommerce
                    </div>
                  </SelectItem>
                  <SelectItem value="Sales">
                    <div className="flex items-center gap-2">
                      <Handshake className="h-4 w-4" />
                      Sales
                    </div>
                  </SelectItem>
                  <SelectItem value="Manual Deal">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Manual Deal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Badge 
                className={
                  formData.source === 'eCommerce' ? 'bg-green-100 text-green-800' :
                  formData.source === 'Sales' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }
              >
                {formData.source}
              </Badge>
            </div>
          </div>

          {/* Service Type */}
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
                <SelectItem value="PEO">PEO (Professional Employer Organization)</SelectItem>
                <SelectItem value="ASO">ASO (Administrative Services Only)</SelectItem>
                <SelectItem value="Payroll">Payroll Services</SelectItem>
                <SelectItem value="HRO">HRO (Human Resources Outsourcing)</SelectItem>
                <SelectItem value="LMS">LMS (Learning Management System)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contract Value */}
          <div className="space-y-2">
            <Label htmlFor="contract_value">Contract Value (USD)</Label>
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

          {/* Status & Conditional Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Client Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Onboarding Status - Only for PEO/ASO/Payroll/HRO */}
            {["PEO", "ASO", "Payroll", "HRO"].includes(formData.service_type) && (
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

            {/* Plan Type - Only for LMS */}
            {formData.service_type === "LMS" && (
              <div className="space-y-2">
                <Label htmlFor="plan_type">LMS Plan Type</Label>
                <Select 
                  value={formData.plan_type} 
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
            )}

            <div className="space-y-2">
              <Label htmlFor="subscription_status">Subscription Status</Label>
              <Select 
                value={formData.subscription_status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_status: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subscription status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
              />
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
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_count: parseInt(e.target.value) || undefined }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_count: parseInt(e.target.value) || undefined }))}
                    placeholder="Number of learners"
                    disabled={isSubmitting}
                  />
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
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagSelector
              selectedTags={formData.tags || []}
              onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Add tags to categorize this client..."
              entityType="client"
              entityId={editingClient?.id || "new"}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this client..."
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
              {isSubmitting ? "Saving..." : (editingClient ? "Update Client" : "Create Client")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};