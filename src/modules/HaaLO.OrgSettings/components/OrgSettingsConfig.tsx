import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building, Globe, Palette, DollarSign, Upload, Loader2, Shield } from "lucide-react";
import { useOrgSettings } from "../state/useOrgSettings";
import { BrandIdentitySelect } from "@/components/common/BrandIdentitySelect";
import { BrandIdentity } from "@/types/brand";
import { useAuth } from "@/contexts/AuthContext";

export const OrgSettingsConfig = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { userRoles } = useAuth();
  
  const {
    settings,
    loading,
    saving,
    updateSettings,
    uploadLogo
  } = useOrgSettings(clientId || '');
  
  // Check if user is super admin (can edit brand identity)
  const isSuperAdmin = userRoles?.includes('super_admin');
  const isActivatedClient = settings?.created_at; // Simple check if client is activated

  const [formData, setFormData] = useState({
    legal_business_name: settings?.legal_business_name || '',
    ein: settings?.ein || '',
    address_line_1: settings?.address_line_1 || '',
    address_line_2: settings?.address_line_2 || '',
    city: settings?.city || '',
    state: settings?.state || '',
    postal_code: settings?.postal_code || '',
    country: settings?.country || 'US',
    phone: settings?.phone || '',
    email: settings?.email || '',
    website: settings?.website || '',
    time_zone: settings?.time_zone || 'America/Los_Angeles',
    locale: settings?.locale || 'en-US',
    primary_color: settings?.primary_color || '#3b82f6',
    default_pay_frequency: settings?.default_pay_frequency || 'bi-weekly',
    brand_identity: settings?.brand_identity as BrandIdentity | undefined
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        legal_business_name: settings.legal_business_name || '',
        ein: settings.ein || '',
        address_line_1: settings.address_line_1 || '',
        address_line_2: settings.address_line_2 || '',
        city: settings.city || '',
        state: settings.state || '',
        postal_code: settings.postal_code || '',
        country: settings.country || 'US',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        time_zone: settings.time_zone || 'America/Los_Angeles',
        locale: settings.locale || 'en-US',
        primary_color: settings.primary_color || '#3b82f6',
        default_pay_frequency: settings.default_pay_frequency || 'bi-weekly',
        brand_identity: settings.brand_identity as BrandIdentity | undefined
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      await uploadLogo(file);
    }
  };

  const handleSave = async () => {
    await updateSettings(formData);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground">Configure your organization's information and preferences</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Organization Information</span>
            </CardTitle>
            <CardDescription>
              Basic company information and legal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal_business_name">Legal Business Name</Label>
              <Input
                id="legal_business_name"
                value={formData.legal_business_name}
                onChange={(e) => handleInputChange('legal_business_name', e.target.value)}
                placeholder="Enter legal business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
              <Input
                id="ein"
                value={formData.ein}
                onChange={(e) => handleInputChange('ein', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="address_line_1">Address Line 1</Label>
              <Input
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                placeholder="Street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
              <Input
                id="address_line_2"
                value={formData.address_line_2}
                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                placeholder="Suite, apartment, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="ZIP Code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="MX">Mexico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
            <CardDescription>
              Contact details and web presence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.company.com"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="time_zone">Time Zone</Label>
              <Select value={formData.time_zone} onValueChange={(value) => handleInputChange('time_zone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Locale</Label>
              <Select value={formData.locale} onValueChange={(value) => handleInputChange('locale', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-CA">English (Canada)</SelectItem>
                  <SelectItem value="es-US">Spanish (US)</SelectItem>
                  <SelectItem value="fr-CA">French (Canada)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Brand Identity & System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Brand Identity & System Settings</span>
            </CardTitle>
            <CardDescription>
              System-wide brand configuration for email domains and UI theming
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BrandIdentitySelect
              value={formData.brand_identity}
              onValueChange={(value) => handleInputChange('brand_identity', value)}
              disabled={!isSuperAdmin && !!isActivatedClient}
              required={true}
            />
            {!isSuperAdmin && isActivatedClient && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Brand identity can only be changed by Super Admins after client activation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Branding</span>
            </CardTitle>
            <CardDescription>
              Company logo and brand colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex items-center space-x-4">
                {settings?.logo_url && (
                  <img 
                    src={settings.logo_url} 
                    alt="Company logo" 
                    className="w-16 h-16 object-contain border rounded"
                  />
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a logo file (PNG, JPG, SVG)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Brand Color</Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pay Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Default Pay Settings</span>
            </CardTitle>
            <CardDescription>
              Default payroll configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_pay_frequency">Default Pay Frequency</Label>
              <Select 
                value={formData.default_pay_frequency} 
                onValueChange={(value) => handleInputChange('default_pay_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};