import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload, Calendar, Users, FileText, Shield, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadField } from "./FileUploadField";
import { MultiSelectField } from "./MultiSelectField";

// Type definitions
interface OnboardingFormData {
  // Universal fields
  company_name: string;
  dba_name: string;
  fein: string;
  entity_type: string;
  website: string;
  company_logo_url: string;
  main_business_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  industry_type: string;
  number_of_employees: number | null;
  states_of_operation: string[];
  primary_contact: {
    name: string;
    email: string;
    phone: string;
  };
  assigned_account_manager: string;
  client_status: string;
  service_start_date: string;
  notes: string;
  service_types: string[];
  
  // Service-specific data
  peo_data: any;
  aso_data: any;
  payroll_data: any;
  hro_data: any;
  lms_data: any;
}

interface ClientOnboardingFormProps {
  clientId?: string;
  onComplete?: () => void;
}

const defaultFormData: OnboardingFormData = {
  company_name: "",
  dba_name: "",
  fein: "",
  entity_type: "",
  website: "",
  company_logo_url: "",
  main_business_address: {
    street: "",
    city: "",
    state: "",
    zip: ""
  },
  industry_type: "",
  number_of_employees: null,
  states_of_operation: [],
  primary_contact: {
    name: "",
    email: "",
    phone: ""
  },
  assigned_account_manager: "",
  client_status: "pending",
  service_start_date: "",
  notes: "",
  service_types: [],
  peo_data: {},
  aso_data: {},
  payroll_data: {},
  hro_data: {},
  lms_data: {}
};

const entityTypes = [
  "LLC", "Corporation", "S-Corp", "Partnership", 
  "Sole Proprietorship", "Non-Profit", "Other"
];

const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const accountManagers = [
  "Kelly Steinacbk",
  "Makenna Thorn", 
  "Vicki Hageman",
  "Denise Sanchez"
];

const payrollFrequencies = [
  "Weekly", "Bi-Weekly", "Semi-Monthly", "Monthly"
];

const lmsTrainings = [
  "SB 553 (Workplace Violence Prevention)",
  "Anti-Money Laundering (AML)",
  "Sexual Harassment Prevention",
  "Diversity & Inclusion",
  "Safety Training",
  "Compliance Training",
  "Custom Training"
];

const industryTypes = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail",
  "Construction",
  "Professional Services",
  "Education",
  "Non-profit",
  "Government",
  "Other"
];

export const ClientOnboardingForm = ({ clientId, onComplete }: ClientOnboardingFormProps) => {
  const [formData, setFormData] = useState<OnboardingFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load existing client data when component mounts
  useEffect(() => {
    const loadClientData = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading client data for:', clientId);
        const { data: client, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) {
          console.error('Error loading client:', error);
          toast({
            title: "Error loading client",
            description: "Could not load client data",
            variant: "destructive"
          });
          return;
        }

        if (client) {
          // Pre-populate form with client data
          setFormData(prev => ({
            ...prev,
            company_name: client.company_name || "",
            primary_contact: {
              name: client.key_contacts?.[0]?.name || "",
              email: client.key_contacts?.[0]?.email || "",
              phone: client.key_contacts?.[0]?.phone || ""
            },
            service_types: Array.isArray(client.services_purchased) 
              ? client.services_purchased.filter(item => typeof item === 'string') as string[]
              : [],
            client_status: client.status || "pending",
            notes: client.notes || ""
          }));
        }
      } catch (error) {
        console.error('Failed to load client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [clientId, toast]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof OnboardingFormData],
        [field]: value
      }
    }));
  };

  const updateServiceData = (serviceType: string, field: string, value: any) => {
    const serviceKey = `${serviceType.toLowerCase()}_data`;
    setFormData(prev => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey as keyof OnboardingFormData],
        [field]: value
      }
    }));
  };

  const handleServiceTypeChange = (serviceType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      service_types: checked 
        ? [...prev.service_types, serviceType]
        : prev.service_types.filter(type => type !== serviceType)
    }));
  };

  const handleFileUpload = async (documentType: string, serviceType: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${clientId || 'temp'}/${serviceType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store file reference
      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: [...(prev[documentType] || []), file]
      }));

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`
      });

      return filePath;
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsSubmitting(true);

    try {
      const submitData = {
        client_id: clientId,
        ...formData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };
      
      console.log('Submitting data to database:', submitData);

      const { data, error } = await supabase
        .from('client_onboarding_profiles')
        .insert(submitData)
        .select()
        .single();

      console.log('Database response:', { data, error });

      if (error) throw error;

      toast({
        title: "Onboarding profile created",
        description: "Client onboarding profile has been successfully created."
      });

      onComplete?.();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error creating profile",
        description: `There was an error creating the onboarding profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Universal Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => updateFormData('company_name', e.target.value)}
                placeholder="Enter company name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dba_name">DBA Name</Label>
              <Input
                id="dba_name"
                value={formData.dba_name}
                onChange={(e) => updateFormData('dba_name', e.target.value)}
                placeholder="Doing Business As"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fein">FEIN *</Label>
              <Input
                id="fein"
                value={formData.fein}
                onChange={(e) => updateFormData('fein', e.target.value)}
                placeholder="XX-XXXXXXX"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity_type">Entity Type *</Label>
              <Select 
                value={formData.entity_type} 
                onValueChange={(value) => updateFormData('entity_type', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://www.company.com"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <FileUploadField
                label=""
                documentType="company_logo"
                serviceType="universal"
                onFileUpload={async (documentType, serviceType, file) => {
                  const filePath = await handleFileUpload(documentType, serviceType, file);
                  if (filePath) {
                    updateFormData('company_logo_url', filePath);
                  }
                  return filePath;
                }}
                acceptedTypes=".png,.jpg,.jpeg,.svg"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Business Address */}
          <div className="space-y-4">
            <Label>Main Business Address *</Label>
            <div className="space-y-2">
              <Input
                value={formData.main_business_address.street}
                onChange={(e) => updateNestedFormData('main_business_address', 'street', e.target.value)}
                placeholder="Street Address"
                required
                disabled={isSubmitting}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={formData.main_business_address.city}
                  onChange={(e) => updateNestedFormData('main_business_address', 'city', e.target.value)}
                  placeholder="City"
                  required
                  disabled={isSubmitting}
                />
                <Select 
                  value={formData.main_business_address.state} 
                  onValueChange={(value) => updateNestedFormData('main_business_address', 'state', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {usStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.main_business_address.zip}
                  onChange={(e) => updateNestedFormData('main_business_address', 'zip', e.target.value)}
                  placeholder="ZIP Code"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry_type">Industry Type</Label>
              <Select 
                value={formData.industry_type} 
                onValueChange={(value) => updateFormData('industry_type', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry type" />
                </SelectTrigger>
                <SelectContent>
                  {industryTypes.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number_of_employees">Number of Employees *</Label>
              <Input
                id="number_of_employees"
                type="number"
                min="1"
                value={formData.number_of_employees || ''}
                onChange={(e) => updateFormData('number_of_employees', parseInt(e.target.value) || null)}
                placeholder="Enter number of employees"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>States of Operation *</Label>
            <MultiSelectField
              options={usStates}
              value={formData.states_of_operation}
              onChange={(states) => updateFormData('states_of_operation', states)}
              placeholder="Select states where you operate"
              disabled={isSubmitting}
            />
          </div>

          {/* Primary Contact */}
          <div className="space-y-4">
            <Label>Primary Contact *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={formData.primary_contact.name}
                onChange={(e) => updateNestedFormData('primary_contact', 'name', e.target.value)}
                placeholder="Contact Name"
                required
                disabled={isSubmitting}
              />
              <Input
                type="email"
                value={formData.primary_contact.email}
                onChange={(e) => updateNestedFormData('primary_contact', 'email', e.target.value)}
                placeholder="Email Address"
                required
                disabled={isSubmitting}
              />
              <Input
                value={formData.primary_contact.phone}
                onChange={(e) => updateNestedFormData('primary_contact', 'phone', e.target.value)}
                placeholder="Phone Number"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_account_manager">Assigned Account Manager *</Label>
              <Select 
                value={formData.assigned_account_manager} 
                onValueChange={(value) => updateFormData('assigned_account_manager', value)}
                disabled={isSubmitting}
                required
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
            <div className="space-y-2">
              <Label htmlFor="client_status">Client Status</Label>
              <Select 
                value={formData.client_status} 
                onValueChange={(value) => updateFormData('client_status', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_start_date">Service Start Date *</Label>
              <Input
                id="service_start_date"
                type="date"
                value={formData.service_start_date}
                onChange={(e) => updateFormData('service_start_date', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Additional notes about this client..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Types Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Service Types *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["PEO", "ASO", "Payroll", "HRO", "LMS"].map(serviceType => (
              <div key={serviceType} className="flex items-center space-x-2">
                <Checkbox
                  id={serviceType}
                  checked={formData.service_types.includes(serviceType)}
                  onCheckedChange={(checked) => handleServiceTypeChange(serviceType, checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor={serviceType}>{serviceType}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Service-Specific Fields */}
      {/* PEO Fields */}
      {formData.service_types.includes("PEO") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              PEO Specific Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payroll Frequency</Label>
                <Select 
                  value={formData.peo_data.payroll_frequency || ''} 
                  onValueChange={(value) => updateServiceData('PEO', 'payroll_frequency', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrollFrequencies.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ex-Mod (Experience Modifier)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.peo_data.ex_mod || ''}
                  onChange={(e) => updateServiceData('PEO', 'ex_mod', parseFloat(e.target.value) || null)}
                  placeholder="e.g., 1.25"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Workers' Comp Classification Codes</Label>
              <Textarea
                value={formData.peo_data.workers_comp_codes || ''}
                onChange={(e) => updateServiceData('PEO', 'workers_comp_codes', e.target.value)}
                placeholder="List classification codes and descriptions"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Safety/OSHA Contact Information</Label>
              <Input
                value={formData.peo_data.safety_contact || ''}
                onChange={(e) => updateServiceData('PEO', 'safety_contact', e.target.value)}
                placeholder="Name, email, phone"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Benefits Offered</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["Medical", "Dental", "Vision", "401(k)", "Life Insurance", "Disability"].map(benefit => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`peo-${benefit}`}
                      checked={formData.peo_data.benefits_offered?.includes(benefit) || false}
                      onCheckedChange={(checked) => {
                        const current = formData.peo_data.benefits_offered || [];
                        const updated = checked 
                          ? [...current, benefit]
                          : current.filter((b: string) => b !== benefit);
                        updateServiceData('PEO', 'benefits_offered', updated);
                      }}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`peo-${benefit}`} className="text-sm">{benefit}</Label>
                  </div>
                ))}
              </div>
            </div>

            <FileUploadField
              label="Employee Census (CSV)"
              documentType="employee_census"
              serviceType="PEO"
              onFileUpload={handleFileUpload}
              acceptedTypes=".csv,.xlsx,.xls"
              disabled={isSubmitting}
            />

            <FileUploadField
              label="Client Signed Service Agreement"
              documentType="service_agreement"
              serviceType="PEO"
              onFileUpload={handleFileUpload}
              acceptedTypes=".pdf,.doc,.docx"
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Continue with other service types... */}

      {/* ASO Fields */}
      {formData.service_types.includes("ASO") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              ASO Specific Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>HR Services Provided</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Compliance", "Benefits Admin", "Employee Relations", "Recruiting", "Training", "Performance Management"].map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={`aso-${service}`}
                      checked={formData.aso_data.hr_services?.includes(service) || false}
                      onCheckedChange={(checked) => {
                        const current = formData.aso_data.hr_services || [];
                        const updated = checked 
                          ? [...current, service]
                          : current.filter((s: string) => s !== service);
                        updateServiceData('ASO', 'hr_services', updated);
                      }}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`aso-${service}`} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>HR Point of Contact</Label>
              <Input
                value={formData.aso_data.hr_contact || ''}
                onChange={(e) => updateServiceData('ASO', 'hr_contact', e.target.value)}
                placeholder="Name, email, phone"
                disabled={isSubmitting}
              />
            </div>

            <FileUploadField
              label="Active Employee Roster (CSV)"
              documentType="employee_roster"
              serviceType="ASO"
              onFileUpload={handleFileUpload}
              acceptedTypes=".csv,.xlsx,.xls"
              disabled={isSubmitting}
            />

            <FileUploadField
              label="Employee Handbook"
              documentType="handbook"
              serviceType="ASO"
              onFileUpload={handleFileUpload}
              acceptedTypes=".pdf,.doc,.docx"
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Payroll Fields */}
      {formData.service_types.includes("Payroll") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Payroll Specific Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pay Groups / Schedules</Label>
              <Textarea
                value={formData.payroll_data.pay_groups || ''}
                onChange={(e) => updateServiceData('Payroll', 'pay_groups', e.target.value)}
                placeholder="Describe different pay groups and their schedules"
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pay Type Mix</Label>
                <Select 
                  value={formData.payroll_data.pay_type_mix || ''} 
                  onValueChange={(value) => updateServiceData('Payroll', 'pay_type_mix', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary pay type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="piece_rate">Piece Rate</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Direct Deposit Setup</Label>
                <Select 
                  value={formData.payroll_data.direct_deposit?.toString() || ''} 
                  onValueChange={(value) => updateServiceData('Payroll', 'direct_deposit', value === 'true')}
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
              <Label>Timekeeping Integration</Label>
              <Select 
                value={formData.payroll_data.timekeeping_integration || ''} 
                onValueChange={(value) => updateServiceData('Payroll', 'timekeeping_integration', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timekeeping method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="swipeclock">SwipeClock</SelectItem>
                  <SelectItem value="kronos">Kronos</SelectItem>
                  <SelectItem value="adp">ADP</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FileUploadField
              label="Signed Payroll Authorization Form"
              documentType="payroll_authorization"
              serviceType="Payroll"
              onFileUpload={handleFileUpload}
              acceptedTypes=".pdf,.doc,.docx"
              disabled={isSubmitting}
              required
            />
          </CardContent>
        </Card>
      )}

      {/* HRO Fields */}
      {formData.service_types.includes("HRO") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              HRO Specific Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned HR Consultant</Label>
                <Input
                  value={formData.hro_data.hr_consultant || ''}
                  onChange={(e) => updateServiceData('HRO', 'hr_consultant', e.target.value)}
                  placeholder="Consultant name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Legal/Labor Attorney</Label>
                <Input
                  value={formData.hro_data.legal_attorney || ''}
                  onChange={(e) => updateServiceData('HRO', 'legal_attorney', e.target.value)}
                  placeholder="Attorney name and firm"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Compliance Services Needed</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Recruiting", "Handbook Development", "Training Programs", "HR Audits", "Policy Development", "Investigation Support"].map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hro-${service}`}
                      checked={formData.hro_data.compliance_services?.includes(service) || false}
                      onCheckedChange={(checked) => {
                        const current = formData.hro_data.compliance_services || [];
                        const updated = checked 
                          ? [...current, service]
                          : current.filter((s: string) => s !== service);
                        updateServiceData('HRO', 'compliance_services', updated);
                      }}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`hro-${service}`} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Union Workforce</Label>
              <Select 
                value={formData.hro_data.union_workforce?.toString() || ''} 
                onValueChange={(value) => updateServiceData('HRO', 'union_workforce', value === 'true')}
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

            <FileUploadField
              label="Disciplinary History File"
              documentType="disciplinary_history"
              serviceType="HRO"
              onFileUpload={handleFileUpload}
              acceptedTypes=".pdf,.doc,.docx"
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* LMS Fields */}
      {formData.service_types.includes("LMS") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              LMS Specific Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary LMS Admin Name</Label>
                <Input
                  value={formData.lms_data.admin_name || ''}
                  onChange={(e) => updateServiceData('LMS', 'admin_name', e.target.value)}
                  placeholder="Administrator name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary LMS Admin Email</Label>
                <Input
                  type="email"
                  value={formData.lms_data.admin_email || ''}
                  onChange={(e) => updateServiceData('LMS', 'admin_email', e.target.value)}
                  placeholder="admin@company.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Number of Seats Purchased</Label>
              <Input
                type="number"
                min="1"
                value={formData.lms_data.seats_purchased || ''}
                onChange={(e) => updateServiceData('LMS', 'seats_purchased', parseInt(e.target.value) || null)}
                placeholder="Number of learner seats"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Trainings Purchased</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {lmsTrainings.map(training => (
                  <div key={training} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lms-${training}`}
                      checked={formData.lms_data.trainings_purchased?.includes(training) || false}
                      onCheckedChange={(checked) => {
                        const current = formData.lms_data.trainings_purchased || [];
                        const updated = checked 
                          ? [...current, training]
                          : current.filter((t: string) => t !== training);
                        updateServiceData('LMS', 'trainings_purchased', updated);
                      }}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`lms-${training}`} className="text-sm">{training}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Branding Required</Label>
              <Select 
                value={formData.lms_data.custom_branding?.toString() || ''} 
                onValueChange={(value) => updateServiceData('LMS', 'custom_branding', value === 'true')}
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

            {formData.lms_data.custom_branding && (
              <FileUploadField
                label="Company Logo"
                documentType="company_logo"
                serviceType="LMS"
                onFileUpload={handleFileUpload}
                acceptedTypes=".png,.jpg,.jpeg,.svg"
                disabled={isSubmitting}
              />
            )}

            <div className="space-y-2">
              <Label>LMS Domain Access</Label>
              <Select 
                value={formData.lms_data.domain_access || ''} 
                onValueChange={(value) => updateServiceData('LMS', 'domain_access', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sso">Single Sign-On (SSO)</SelectItem>
                  <SelectItem value="subdomain">Custom Subdomain</SelectItem>
                  <SelectItem value="shared_link">Shared Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Support Contact Email</Label>
                <Input
                  type="email"
                  value={formData.lms_data.support_email || ''}
                  onChange={(e) => updateServiceData('LMS', 'support_email', e.target.value)}
                  placeholder="support@company.com"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Billing Contact Email</Label>
                <Input
                  type="email"
                  value={formData.lms_data.billing_email || ''}
                  onChange={(e) => updateServiceData('LMS', 'billing_email', e.target.value)}
                  placeholder="billing@company.com (if different)"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Save as Draft
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.company_name.trim()}
          onClick={() => console.log('Submit button clicked, company_name:', formData.company_name, 'disabled:', isSubmitting || !formData.company_name.trim())}
        >
          {isSubmitting ? "Creating..." : "Create Onboarding Profile"}
        </Button>
      </div>
    </form>
  );
};
