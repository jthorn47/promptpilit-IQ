import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, FileText, Settings, Zap, Save, X, Mail } from "lucide-react";
import { ProfileEmailButton } from "@/components/email/ProfileEmailButton";
import { SalesLifecycleStage } from '@/components/SalesFunnelTiles';
import { useToast } from "@/hooks/use-toast";

interface CompanyData {
  id: string;
  company_name: string;
  sales_lifecycle_stage: SalesLifecycleStage;
  subscription_status: string;
  max_employees: number;
  created_at: string;
  last_activity_date?: string;
  has_paying_clients?: boolean;
  paying_clients_count?: number;
  // Add more fields as needed
  ein?: string;
  address?: string;
  website?: string;
  timezone?: string;
  industry?: string;
  
  company_owner?: string;
  bdm?: string;
  recruiter?: string;
  business_description?: string;
  internal_notes?: string;
}

interface CompanyConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  onSave?: (updatedCompany: CompanyData) => void;
}

const lifecycleStages = [
  { value: 'lead_new', label: 'Lead – New' },
  { value: 'prospect_qualified', label: 'Prospect – Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'client_active', label: 'Client – Active' },
  { value: 'client_inactive', label: 'Client – Inactive' },
  { value: 'disqualified_no_fit', label: 'Disqualified / No Fit' },
  // Legacy stages for backwards compatibility
  { value: 'prospect', label: 'Prospect' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'in_onboarding', label: 'Onboarding' },
  { value: 'active_paying_client', label: 'Active Client' },
  { value: 'dormant_churned', label: 'Dormant' },
];


const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
];

const bdmOptions = [
  { value: 'Jeffrey Thorn', label: 'Jeffrey Thorn' },
  { value: 'Matt Riley', label: 'Matt Riley' },
];

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'construction', label: 'Construction' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
];

export const CompanyConfigurationPanel: React.FC<CompanyConfigurationPanelProps> = ({
  isOpen,
  onClose,
  company,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CompanyData>(company);
  const [moduleStates, setModuleStates] = useState({
    risk_assessment: true,
    propgen: false,
    wvpp_wizard: false,
    training: true,
    
    payroll: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Filter out computed fields that shouldn't be sent to the database
      const { has_paying_clients, paying_clients_count, ...dataToSave } = formData;
      await onSave?.(dataToSave);
      
      toast({
        title: "Success",
        description: "Company configuration saved successfully.",
      });
      
      onClose(); // Close the panel after successful save
    } catch (error) {
      console.error('Error in CompanyConfigurationPanel save:', error);
      toast({
        title: "Error",
        description: "Failed to save company configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: keyof CompanyData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleModule = (module: keyof typeof moduleStates) => {
    setModuleStates(prev => ({ ...prev, [module]: !prev[module] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Manage Company: {company.company_name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <ProfileEmailButton
                mode="company"
                companyId={company.id}
                prefilledSubject={`Regarding ${company.company_name}`}
                size="sm"
                variant="outline"
              />
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="stage">Stage/Status</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => updateFormData('company_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_employees">Number of Employees</Label>
                    <Input
                      id="max_employees"
                      type="number"
                      value={formData.max_employees}
                      onChange={(e) => updateFormData('max_employees', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ein">EIN/Tax ID</Label>
                    <Input
                      id="ein"
                      value={formData.ein || ''}
                      onChange={(e) => updateFormData('ein', e.target.value)}
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="Enter full company address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => updateFormData('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Lifecycle & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lifecycle_stage">Sales Lifecycle Stage</Label>
                  <Select 
                    value={formData.sales_lifecycle_stage} 
                    onValueChange={(value) => updateFormData('sales_lifecycle_stage', value as SalesLifecycleStage)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lifecycleStages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subscription_status">Subscription Status</Label>
                  <Select 
                    value={formData.subscription_status} 
                    onValueChange={(value) => updateFormData('subscription_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags & Labels</Label>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">High Priority</Badge>
                    <Badge variant="outline">Enterprise</Badge>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      + Add Tag
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="owners" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Owners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company_owner">Company Owner</Label>
                  <Input
                    id="company_owner"
                    value={formData.company_owner || ''}
                    onChange={(e) => updateFormData('company_owner', e.target.value)}
                    placeholder="Primary account manager"
                  />
                </div>

                <div>
                  <Label htmlFor="bdm">Business Development Manager</Label>
                  <Select value={formData.bdm} onValueChange={(value) => updateFormData('bdm', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BDM" />
                    </SelectTrigger>
                    <SelectContent>
                      {bdmOptions.map((bdm) => (
                        <SelectItem key={bdm.value} value={bdm.value}>
                          {bdm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recruiter">Recruiter</Label>
                  <Input
                    id="recruiter"
                    value={formData.recruiter || ''}
                    onChange={(e) => updateFormData('recruiter', e.target.value)}
                    placeholder="Assigned recruiter"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enabled Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(moduleStates).map(([module, enabled]) => (
                  <div key={module} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{module.replace('_', ' ')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {module === 'risk_assessment' && 'HR Risk Assessment module'}
                        {module === 'propgen' && 'PropGEN proposal generation'}
                        {module === 'wvpp_wizard' && 'Workplace Violence Prevention Plan'}
                        {module === 'training' && 'Learning Management System'}
                        
                        {module === 'payroll' && 'Payroll management system'}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => toggleModule(module as keyof typeof moduleStates)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes & Business Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business_description">Business Description</Label>
                  <Textarea
                    id="business_description"
                    value={formData.business_description || ''}
                    onChange={(e) => updateFormData('business_description', e.target.value)}
                    placeholder="Describe the company's business, industry, and services"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="internal_notes">Internal Notes</Label>
                  <Textarea
                    id="internal_notes"
                    value={formData.internal_notes || ''}
                    onChange={(e) => updateFormData('internal_notes', e.target.value)}
                    placeholder="Private notes for internal team use"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Integrations & System Triggers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Connected Tools</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="outline" className="justify-center">
                        ✅ Supabase
                      </Badge>
                      <Badge variant="outline" className="justify-center">
                        ❌ Zapier
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Active System Triggers</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>HR Risk Assessment → Enable PropGEN</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Proposal Generated → Update to 'Proposal Sent'</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Stage → Client → Activate Onboarding</span>
                        <Badge variant="outline">Inactive</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};