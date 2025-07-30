import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessibleFormField, AccessibleTextareaField, AccessibleCheckboxField } from '@/components/AccessibleForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyLegalSetupProps {
  sessionId: string;
  sectionId: string;
  sectionData: any;
  userRole: 'client_admin' | 'onboarding_manager';
  onProgressUpdate: (progress: number, data?: any) => void;
}

export const CompanyLegalSetup: React.FC<CompanyLegalSetupProps> = ({
  sessionId,
  sectionId,
  sectionData,
  userRole,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ein: '',
    suta_number: '',
    company_name: '',
    company_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States'
    },
    primary_contact: {
      name: '',
      email: '',
      phone: '',
      title: ''
    },
    csa_signed: false,
    csa_signed_date: '',
    questions: ''
  });

  useEffect(() => {
    if (sectionData) {
      setFormData({ ...formData, ...sectionData });
    }
  }, [sectionData]);

  const calculateProgress = () => {
    const requiredFields = [
      formData.ein,
      formData.company_name,
      formData.company_address.street,
      formData.company_address.city,
      formData.company_address.state,
      formData.company_address.zip,
      formData.primary_contact.name,
      formData.primary_contact.email,
      formData.csa_signed
    ];

    const completedFields = requiredFields.filter(field => 
      typeof field === 'boolean' ? field : field && field.trim() !== ''
    ).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const handleSave = async () => {
    try {
      const progress = calculateProgress();
      await onProgressUpdate(progress, formData);
      
      toast({
        title: "Progress Saved",
        description: `Section progress: ${progress}%`
      });
    } catch (error: any) {
      toast({
        title: "Error Saving",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmitQuestion = async () => {
    if (!formData.questions.trim()) return;

    try {
      const { error } = await supabase
        .from('peo_onboarding_messages')
        .insert({
          session_id: sessionId,
          section_id: sectionId,
          subject: 'Company & Legal Setup Question',
          message: formData.questions,
          sent_to_role: 'onboarding_manager',
          priority: 'normal'
        });

      if (error) throw error;

      toast({
        title: "Question Submitted",
        description: "Your question has been sent to the onboarding manager."
      });

      setFormData({ ...formData, questions: '' });
    } catch (error: any) {
      toast({
        title: "Error Submitting Question",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={(value) => setFormData({ ...formData, company_name: value })}
              required
            />
            <AccessibleFormField
              label="Federal EIN"
              name="ein"
              value={formData.ein}
              onChange={(value) => setFormData({ ...formData, ein: value })}
              placeholder="XX-XXXXXXX"
              required
            />
          </div>
          
          <AccessibleFormField
            label="SUTA Number"
            name="suta_number"
            value={formData.suta_number}
            onChange={(value) => setFormData({ ...formData, suta_number: value })}
            description="State unemployment tax account number"
          />
        </CardContent>
      </Card>

      {/* Company Address */}
      <Card>
        <CardHeader>
          <CardTitle>Company Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccessibleFormField
            label="Street Address"
            name="street"
            value={formData.company_address.street}
            onChange={(value) => setFormData({
              ...formData,
              company_address: { ...formData.company_address, street: value }
            })}
            required
          />
          
          <div className="grid grid-cols-3 gap-4">
            <AccessibleFormField
              label="City"
              name="city"
              value={formData.company_address.city}
              onChange={(value) => setFormData({
                ...formData,
                company_address: { ...formData.company_address, city: value }
              })}
              required
            />
            <AccessibleFormField
              label="State"
              name="state"
              value={formData.company_address.state}
              onChange={(value) => setFormData({
                ...formData,
                company_address: { ...formData.company_address, state: value }
              })}
              required
            />
            <AccessibleFormField
              label="ZIP Code"
              name="zip"
              value={formData.company_address.zip}
              onChange={(value) => setFormData({
                ...formData,
                company_address: { ...formData.company_address, zip: value }
              })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Contact Name"
              name="contact_name"
              value={formData.primary_contact.name}
              onChange={(value) => setFormData({
                ...formData,
                primary_contact: { ...formData.primary_contact, name: value }
              })}
              required
            />
            <AccessibleFormField
              label="Title"
              name="contact_title"
              value={formData.primary_contact.title}
              onChange={(value) => setFormData({
                ...formData,
                primary_contact: { ...formData.primary_contact, title: value }
              })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Email"
              name="contact_email"
              type="email"
              value={formData.primary_contact.email}
              onChange={(value) => setFormData({
                ...formData,
                primary_contact: { ...formData.primary_contact, email: value }
              })}
              required
            />
            <AccessibleFormField
              label="Phone"
              name="contact_phone"
              type="tel"
              value={formData.primary_contact.phone}
              onChange={(value) => setFormData({
                ...formData,
                primary_contact: { ...formData.primary_contact, phone: value }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* CSA Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle>Client Service Agreement (CSA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccessibleCheckboxField
            label="CSA has been signed and executed"
            name="csa_signed"
            checked={formData.csa_signed}
            onChange={(checked) => setFormData({ ...formData, csa_signed: checked })}
            description="Confirm that the Client Service Agreement from the Blueprint stage has been completed"
            required
          />
          
          {formData.csa_signed && (
            <AccessibleFormField
              label="CSA Signature Date"
              name="csa_signed_date"
              type="date"
              value={formData.csa_signed_date}
              onChange={(value) => setFormData({ ...formData, csa_signed_date: value })}
            />
          )}
        </CardContent>
      </Card>

      {/* Questions/Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Questions or Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccessibleTextareaField
            label="Message for Onboarding Manager"
            name="questions"
            value={formData.questions}
            onChange={(value) => setFormData({ ...formData, questions: value })}
            placeholder="Ask any questions about the company setup process..."
            rows={4}
          />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleSubmitQuestion}
              disabled={!formData.questions.trim()}
            >
              Send Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Actions */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            Progress: {calculateProgress()}%
          </Badge>
          <span className="text-sm text-muted-foreground">
            Complete all required fields to proceed to the next section
          </span>
        </div>
        <Button onClick={handleSave}>
          Save Progress
        </Button>
      </div>
    </div>
  );
};