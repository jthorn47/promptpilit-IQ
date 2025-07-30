import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Upload, Shield } from 'lucide-react';

interface BankingStepProps {
  data: any;
  onUpdate: (section: string, data: any) => void;
  onCommentaryUpdate: (commentary: string) => void;
}

export const BankingStep: React.FC<BankingStepProps> = ({
  data,
  onUpdate,
  onCommentaryUpdate,
}) => {
  const banking = data.banking || {};

  const handleChange = (field: string, value: string | boolean) => {
    const updatedBanking = { ...banking, [field]: value };
    onUpdate('banking', updatedBanking);
    
    if (field === 'routingNumber' && typeof value === 'string' && value.length === 9) {
      onCommentaryUpdate('Routing number format looks good! Let me validate this with banking records.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bankAccountHolder">Account Holder Name *</Label>
            <Input
              id="bankAccountHolder"
              value={banking.bankAccountHolder || ''}
              onChange={(e) => handleChange('bankAccountHolder', e.target.value)}
              placeholder="Exact name on bank account"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routingNumber">Routing Number *</Label>
              <Input
                id="routingNumber"
                value={banking.routingNumber || ''}
                onChange={(e) => handleChange('routingNumber', e.target.value)}
                placeholder="9-digit routing number"
                maxLength={9}
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={banking.accountNumber || ''}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="Account number"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="achAuthorized"
              checked={banking.achAuthorized || false}
              onCheckedChange={(checked) => handleChange('achAuthorized', checked)}
            />
            <Label htmlFor="achAuthorized">
              I authorize ACH transactions for payroll funding and tax payments *
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Verification Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload a voided check or official bank letter to verify account details
            </p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Security Notice</span>
        </div>
        <p className="text-green-700 mt-1">
          All banking information is encrypted and stored securely. We use bank-level security protocols to protect your data.
        </p>
      </div>
    </div>
  );
};