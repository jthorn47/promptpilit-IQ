import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ArrowRight, Building, Shield, Loader2 } from "lucide-react";
import { BrandIdentitySelect } from "@/components/common/BrandIdentitySelect";
import { BrandIdentity } from "@/types/brand";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClientActivationWizardProps {
  onActivationComplete?: (clientData: any) => void;
  onCancel?: () => void;
}

interface ActivationFormData {
  companyName: string;
  brandIdentity: BrandIdentity | undefined;
  contactEmail: string;
  contactName: string;
  website?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const ClientActivationWizard: React.FC<ClientActivationWizardProps> = ({
  onActivationComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ActivationFormData>({
    companyName: '',
    brandIdentity: undefined,
    contactEmail: '',
    contactName: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ActivationFormData, value: string | BrandIdentity) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.brandIdentity) {
        newErrors.brandIdentity = 'Brand identity is required';
      }
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'Contact email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address';
      }
      if (!formData.contactName.trim()) {
        newErrors.contactName = 'Contact name is required';
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'Postal code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleActivate = async () => {
    if (!validateStep(2)) {
      return;
    }

    setIsActivating(true);
    try {
      // Create company settings record
      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .insert({
          company_name: formData.companyName,
          brand_identity: formData.brandIdentity,
          website: formData.website || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create client record
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          company_settings_id: companyData.id,
          company_name: formData.companyName,
          brand_identity: formData.brandIdentity,
          status: 'active',
          subscription_status: 'active',
          onboarding_status: 'completed',
          date_won: new Date().toISOString(),
          contract_start_date: new Date().toISOString(),
          source: 'activation_wizard',
          notes: `Activated via Client Activation Wizard on ${new Date().toLocaleDateString()}`
        })
        .select()
        .single();

      if (clientError) throw clientError;

      toast({
        title: "Client Activated Successfully!",
        description: `${formData.companyName} has been activated with ${formData.brandIdentity} brand identity.`,
      });

      onActivationComplete?.(clientData);
    } catch (error: any) {
      console.error('Error activating client:', error);
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const steps = [
    { number: 1, title: "Company Details", description: "Basic company information and brand identity" },
    { number: 2, title: "Contact & Address", description: "Location and contact information" },
    { number: 3, title: "Review & Activate", description: "Review details and complete activation" }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.number ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-20 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>{steps[currentStep - 1].title}</span>
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Company Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <BrandIdentitySelect
                  value={formData.brandIdentity}
                  onValueChange={(value) => handleInputChange('brandIdentity', value)}
                  required={true}
                  error={errors.brandIdentity}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Primary contact name"
                    className={errors.contactName ? 'border-red-500' : ''}
                  />
                  {errors.contactName && (
                    <p className="text-sm text-red-600">{errors.contactName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="contact@company.com"
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-red-600">{errors.contactEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="ZIP Code"
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-red-600">{errors.postalCode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Activate */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Review Client Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Company:</strong> {formData.companyName}</p>
                    <p><strong>Brand Identity:</strong> {formData.brandIdentity}</p>
                    <p><strong>Contact:</strong> {formData.contactName}</p>
                    <p><strong>Email:</strong> {formData.contactEmail}</p>
                  </div>
                  <div>
                    <p><strong>Address:</strong> {formData.address}</p>
                    <p><strong>City:</strong> {formData.city}, {formData.state} {formData.postalCode}</p>
                    <p><strong>Country:</strong> {formData.country}</p>
                    {formData.website && <p><strong>Website:</strong> {formData.website}</p>}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Shield className="h-5 w-5" />
                  <h4 className="font-semibold">Brand Identity Impact</h4>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  This client will use <strong>{formData.brandIdentity}</strong> brand identity for:
                </p>
                <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
                  <li>Email domain routing and notifications</li>
                  <li>UI branding and logo display</li>
                  <li>Template and document styling</li>
                  <li>Dashboard and report filtering</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleActivate} disabled={isActivating}>
                  {isActivating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate Client
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};