import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText, MapPin } from 'lucide-react';

interface CompanyInfoStepProps {
  data: any;
  onUpdate: (section: string, data: any) => void;
  onCommentaryUpdate: (commentary: string) => void;
}

export const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  data,
  onUpdate,
  onCommentaryUpdate,
}) => {
  const companyInfo = data.companyInfo || {};

  const handleChange = (field: string, value: string) => {
    const updatedInfo = { ...companyInfo, [field]: value };
    onUpdate('companyInfo', updatedInfo);
    
    // Update HALO commentary based on input
    if (field === 'ein' && value.length === 9) {
      onCommentaryUpdate('EIN format looks good! Let me validate this with IRS records.');
    } else if (field === 'industry' && value) {
      onCommentaryUpdate(`Great choice! ${value} industry has specific compliance requirements I'll help you navigate.`);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    const currentAddress = companyInfo.businessAddress || {};
    const updatedAddress = { ...currentAddress, [field]: value };
    onUpdate('companyInfo', { ...companyInfo, businessAddress: updatedAddress });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="legalCompanyName">Legal Company Name *</Label>
              <Input
                id="legalCompanyName"
                value={companyInfo.legalCompanyName || ''}
                onChange={(e) => handleChange('legalCompanyName', e.target.value)}
                placeholder="Enter exact legal name"
              />
            </div>

            <div>
              <Label htmlFor="ein">Federal EIN *</Label>
              <Input
                id="ein"
                value={companyInfo.ein || ''}
                onChange={(e) => handleChange('ein', e.target.value)}
                placeholder="XX-XXXXXXX"
                maxLength={10}
              />
            </div>

            <div>
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select
                value={companyInfo.entityType || ''}
                onValueChange={(value) => handleChange('entityType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                  <SelectItem value="C-Corp">C Corporation</SelectItem>
                  <SelectItem value="S-Corp">S Corporation</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="Nonprofit">Nonprofit Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={companyInfo.industry || ''}
                onValueChange={(value) => handleChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Food Service">Food Service</SelectItem>
                  <SelectItem value="Financial Services">Financial Services</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="naicsCode">NAICS Code (Optional)</Label>
              <Input
                id="naicsCode"
                value={companyInfo.naicsCode || ''}
                onChange={(e) => handleChange('naicsCode', e.target.value)}
                placeholder="6-digit NAICS code"
                maxLength={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Business Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={companyInfo.businessAddress?.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="suite">Suite/Unit (Optional)</Label>
              <Input
                id="suite"
                value={companyInfo.businessAddress?.suite || ''}
                onChange={(e) => handleAddressChange('suite', e.target.value)}
                placeholder="Suite 100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={companyInfo.businessAddress?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={companyInfo.businessAddress?.state || ''}
                  onValueChange={(value) => handleAddressChange('state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    {/* Add more states as needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={companyInfo.businessAddress?.zipCode || ''}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                placeholder="12345"
                maxLength={10}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Messages */}
      {companyInfo.ein && companyInfo.ein.length === 10 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <FileText className="w-4 h-4" />
            <span className="font-medium">HALO Validation</span>
          </div>
          <p className="text-green-700 mt-1">EIN format is valid. Ready to verify with IRS records.</p>
        </div>
      )}

      {companyInfo.industry === 'Construction' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FileText className="w-4 h-4" />
            <span className="font-medium">HALO Alert</span>
          </div>
          <p className="text-yellow-700 mt-1">
            Construction industry requires additional workers' compensation and safety compliance. 
            I'll help you set up the necessary coverage.
          </p>
        </div>
      )}
    </div>
  );
};