import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, AlertTriangle } from 'lucide-react';

interface TaxAccountsStepProps {
  data: any;
  onUpdate: (section: string, data: any) => void;
  onCommentaryUpdate: (commentary: string) => void;
}

export const TaxAccountsStep: React.FC<TaxAccountsStepProps> = ({
  data,
  onUpdate,
  onCommentaryUpdate,
}) => {
  const taxAccounts = data.taxAccounts || {};

  const handleChange = (field: string, value: string) => {
    const updatedAccounts = { ...taxAccounts, [field]: value };
    onUpdate('taxAccounts', updatedAccounts);
    
    if (field === 'federalEin' && value) {
      onCommentaryUpdate('Federal EIN captured. Let me check state requirements for your location.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tax Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="federalEin">Federal EIN *</Label>
            <Input
              id="federalEin"
              value={taxAccounts.federalEin || ''}
              onChange={(e) => handleChange('federalEin', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </div>

          <div>
            <Label htmlFor="stateWithholdingAccount">State Withholding Account Number</Label>
            <Input
              id="stateWithholdingAccount"
              value={taxAccounts.stateWithholdingAccount || ''}
              onChange={(e) => handleChange('stateWithholdingAccount', e.target.value)}
              placeholder="State-specific format"
            />
          </div>

          <div>
            <Label htmlFor="stateUnemploymentId">State Unemployment (SUTA) ID</Label>
            <Input
              id="stateUnemploymentId"
              value={taxAccounts.stateUnemploymentId || ''}
              onChange={(e) => handleChange('stateUnemploymentId', e.target.value)}
              placeholder="SUTA ID number"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Power of Attorney Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload signed Power of Attorney documents for tax filing authorization
            </p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload POA Documents
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">HALO Recommendation</span>
        </div>
        <p className="text-blue-700 mt-1">
          Some state registrations can take 2-3 weeks. I'll help identify any missing accounts and guide you through the registration process.
        </p>
      </div>
    </div>
  );
};