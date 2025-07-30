import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, FileText, Upload } from 'lucide-react';

interface ClientFormData {
  legal_name: string;
  dba_name: string;
  industry: string;
  employee_count: string;
  ex_mod_rate: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  notes: string;
}

const industries = [
  'Manufacturing', 'Construction', 'Healthcare', 'Retail', 'Technology',
  'Food Service', 'Logistics', 'Professional Services', 'Education', 'Other'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function ClientSubmissionForm() {
  const [loading, setLoading] = useState(false);
  const [creditApp, setCreditApp] = useState<File | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    legal_name: '',
    dba_name: '',
    industry: '',
    employee_count: '',
    ex_mod_rate: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    notes: ''
  });

  const { toast } = useToast();

  const uploadCreditApplication = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/credit_apps/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('staffing-documents')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let creditApplicationUrl = '';
      if (creditApp) {
        creditApplicationUrl = await uploadCreditApplication(creditApp, user.id);
      }

      const { error } = await supabase
        .from('staffing_clients')
        .insert({
          ...formData,
          employee_count: parseInt(formData.employee_count) || 0,
          ex_mod_rate: parseFloat(formData.ex_mod_rate) || null,
          credit_application_url: creditApplicationUrl,
          submitted_by: user.id
        });

      if (error) throw error;

      // Log the submission in approval history
      await supabase
        .from('client_approval_history')
        .insert({
          client_id: (await supabase
            .from('staffing_clients')
            .select('id')
            .eq('submitted_by', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          ).data?.id,
          action: 'submitted',
          performed_by: user.id,
          new_status: 'pending',
          notes: 'Client submitted for approval'
        });

      toast({
        title: "Client Submitted",
        description: "Client has been submitted for admin approval."
      });

      // Reset form
      setFormData({
        legal_name: '', dba_name: '', industry: '', employee_count: '',
        ex_mod_rate: '', address: '', city: '', state: '', zip_code: '',
        primary_contact_name: '', primary_contact_email: '', primary_contact_phone: '',
        notes: ''
      });
      setCreditApp(null);

    } catch (error: any) {
      console.error('Error submitting client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit client",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Submit New Client</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Submit a new client for approval and onboarding
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Legal Company Name *</Label>
                  <Input
                    id="legal_name"
                    value={formData.legal_name}
                    onChange={(e) => updateFormData('legal_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dba_name">DBA Name</Label>
                  <Input
                    id="dba_name"
                    value={formData.dba_name}
                    onChange={(e) => updateFormData('dba_name', e.target.value)}
                    placeholder="Doing Business As (if different)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select onValueChange={(value) => updateFormData('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_count">Number of Employees *</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    min="1"
                    value={formData.employee_count}
                    onChange={(e) => updateFormData('employee_count', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ex_mod_rate">Experience Modification Rate</Label>
                  <Input
                    id="ex_mod_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ex_mod_rate}
                    onChange={(e) => updateFormData('ex_mod_rate', e.target.value)}
                    placeholder="e.g., 1.00"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select onValueChange={(value) => updateFormData('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => updateFormData('zip_code', e.target.value)}
                    pattern="[0-9]{5}(-[0-9]{4})?"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Primary Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_name">Contact Name</Label>
                  <Input
                    id="primary_contact_name"
                    value={formData.primary_contact_name}
                    onChange={(e) => updateFormData('primary_contact_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_contact_email">Contact Email</Label>
                  <Input
                    id="primary_contact_email"
                    type="email"
                    value={formData.primary_contact_email}
                    onChange={(e) => updateFormData('primary_contact_email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_contact_phone">Contact Phone</Label>
                  <Input
                    id="primary_contact_phone"
                    type="tel"
                    value={formData.primary_contact_phone}
                    onChange={(e) => updateFormData('primary_contact_phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Credit Application Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Credit Application
              </h3>
              <div className="space-y-2">
                <Label>Upload Credit Application</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCreditApp(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                {creditApp && (
                  <p className="text-sm text-green-600">✓ {creditApp.name}</p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Any additional information about this client..."
                rows={3}
              />
            </div>

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={loading || !formData.legal_name || !formData.industry || !formData.employee_count}
                className="px-8 py-3 text-lg"
              >
                {loading ? 'Submitting...' : 'Submit Client for Approval'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}