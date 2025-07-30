import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessibleFormField, AccessibleSelectField } from '@/components/AccessibleForm';
import { Shield, Upload, Check, AlertTriangle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BankingWorkersCompSetupProps {
  sessionId: string;
  sectionId: string;
  sectionData: any;
  userRole: 'client_admin' | 'onboarding_manager';
  onProgressUpdate: (progress: number, data?: any) => void;
}

export const BankingWorkersCompSetup: React.FC<BankingWorkersCompSetupProps> = ({
  sessionId,
  sectionId,
  sectionData,
  userRole,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [bankingInfo, setBankingInfo] = useState({
    bank_name: '',
    routing_number: '',
    account_number: '',
    account_type: '',
    confirm_account_number: ''
  });
  const [voidedCheck, setVoidedCheck] = useState<File | null>(null);
  const [achSigned, setAchSigned] = useState(false);
  const [wcDeclaration, setWcDeclaration] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'processing' | 'verified'>('pending');
  const [isLocked, setIsLocked] = useState(false);

  const accountTypeOptions = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' }
  ];

  const calculateProgress = () => {
    let progress = 0;
    
    // Banking info completed: 50%
    if (bankingInfo.bank_name && bankingInfo.routing_number && 
        bankingInfo.account_number && bankingInfo.account_type &&
        bankingInfo.account_number === bankingInfo.confirm_account_number) {
      progress += 50;
    }
    
    // Voided check uploaded: 25%
    if (voidedCheck) progress += 25;
    
    // ACH authorization signed: 25%
    if (achSigned) progress += 25;
    
    return progress;
  };

  const handleVoidedCheckUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVoidedCheck(file);
      toast({
        title: "Voided Check Uploaded",
        description: "Your voided check has been uploaded successfully."
      });
      onProgressUpdate(calculateProgress());
    }
  };

  const validateBankingInfo = () => {
    if (bankingInfo.account_number !== bankingInfo.confirm_account_number) {
      toast({
        title: "Account Numbers Don't Match",
        description: "Please ensure both account numbers are identical.",
        variant: "destructive"
      });
      return false;
    }

    if (bankingInfo.routing_number.length !== 9) {
      toast({
        title: "Invalid Routing Number",
        description: "Routing number must be 9 digits.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const startTwoStepValidation = () => {
    if (!validateBankingInfo()) return;

    setValidationStatus('processing');
    
    // Simulate validation process
    setTimeout(() => {
      setValidationStatus('verified');
      toast({
        title: "Banking Information Verified",
        description: "Your banking information has been successfully validated."
      });
      onProgressUpdate(calculateProgress());
    }, 3000);
  };

  const lockForPayroll = () => {
    setIsLocked(true);
    toast({
      title: "Section Locked",
      description: "Banking information is now locked for payroll usage."
    });
  };

  return (
    <div className="space-y-6">
      {/* Workers' Compensation Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Workers' Compensation Coverage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Coverage Handled by Easeworks</h4>
                <p className="text-sm text-green-700 mt-1">
                  Easeworks will handle all Workers' Compensation setup and coverage for your employees. 
                  No action required from your side.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">Optional: Upload Declaration Page</h5>
            <p className="text-sm text-muted-foreground">
              If you have an existing Workers' Comp declaration page you'd like us to reference, you can upload it below.
            </p>
            
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setWcDeclaration(file);
                    toast({
                      title: "Declaration Page Uploaded",
                      description: "Workers' Comp declaration page uploaded successfully."
                    });
                  }
                }}
                className="hidden"
                id="wc-declaration-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="wc-declaration-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Declaration Page
                </label>
              </Button>
              
              {wcDeclaration && (
                <Badge variant="default">
                  <Check className="h-3 w-3 mr-1" />
                  {wcDeclaration.name}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Funding Bank Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Secure Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  All banking information is encrypted and securely stored. This account will be used for payroll funding only.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Bank Name"
              name="bank_name"
              value={bankingInfo.bank_name}
              onChange={(value) => {
                setBankingInfo({ ...bankingInfo, bank_name: value });
                onProgressUpdate(calculateProgress());
              }}
              required
            />
            
            <AccessibleSelectField
              label="Account Type"
              name="account_type"
              value={bankingInfo.account_type}
              onChange={(value) => {
                setBankingInfo({ ...bankingInfo, account_type: value });
                onProgressUpdate(calculateProgress());
              }}
              options={accountTypeOptions}
              placeholder="Select account type"
              required
            />
          </div>

          <AccessibleFormField
            label="Routing Number"
            name="routing_number"
            value={bankingInfo.routing_number}
            onChange={(value) => {
              setBankingInfo({ ...bankingInfo, routing_number: value });
              onProgressUpdate(calculateProgress());
            }}
            placeholder="9-digit routing number"
            maxLength={9}
            required
          />

          <AccessibleFormField
            label="Account Number"
            name="account_number"
            value={bankingInfo.account_number}
            onChange={(value) => {
              setBankingInfo({ ...bankingInfo, account_number: value });
              onProgressUpdate(calculateProgress());
            }}
            required
          />

          <AccessibleFormField
            label="Confirm Account Number"
            name="confirm_account_number"
            value={bankingInfo.confirm_account_number}
            onChange={(value) => {
              setBankingInfo({ ...bankingInfo, confirm_account_number: value });
              onProgressUpdate(calculateProgress());
            }}
            required
          />
        </CardContent>
      </Card>

      {/* Voided Check Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Voided Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Upload a clear image or scan of a voided check for the account specified above.
          </p>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <h4 className="font-medium mb-2">Upload Voided Check</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleVoidedCheckUpload}
              className="hidden"
              id="voided-check-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="voided-check-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </div>

          {voidedCheck && (
            <div className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{voidedCheck.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(voidedCheck.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACH Authorization */}
      <Card>
        <CardHeader>
          <CardTitle>ACH Authorization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-2">ACH Authorization Agreement</h4>
            <p className="text-sm text-muted-foreground mb-4">
              By signing this authorization, you give Easeworks permission to initiate ACH debits 
              from the specified account for payroll funding purposes.
            </p>
            
            <div className="space-y-2 text-sm">
              <p><strong>Account Holder:</strong> {bankingInfo.bank_name || 'Not specified'}</p>
              <p><strong>Account Type:</strong> {bankingInfo.account_type || 'Not specified'}</p>
              <p><strong>Account Number:</strong> ****{bankingInfo.account_number.slice(-4)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="ach_authorization"
              checked={achSigned}
              onChange={(e) => {
                setAchSigned(e.target.checked);
                onProgressUpdate(calculateProgress());
              }}
              className="rounded"
            />
            <label htmlFor="ach_authorization" className="text-sm">
              I authorize Easeworks to initiate ACH debits from the specified account for payroll funding.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Step Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationStatus === 'pending' && (
            <div>
              <p className="text-muted-foreground mb-4">
                Verify your banking information before proceeding. This will initiate a secure validation process.
              </p>
              <Button 
                onClick={startTwoStepValidation}
                disabled={!bankingInfo.bank_name || !bankingInfo.routing_number || !bankingInfo.account_number || !achSigned}
                className="w-full"
              >
                Start Validation Process
              </Button>
            </div>
          )}

          {validationStatus === 'processing' && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Validating banking information...</p>
            </div>
          )}

          {validationStatus === 'verified' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Banking information verified successfully</span>
              </div>
              
              {!isLocked && userRole === 'onboarding_manager' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-green-800">Ready to Lock for Payroll</h5>
                      <p className="text-sm text-green-700">Lock this section to enable payroll processing.</p>
                    </div>
                    <Button onClick={lockForPayroll}>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock for Payroll
                    </Button>
                  </div>
                </div>
              )}
              
              {isLocked && (
                <div className="p-4 bg-gray-100 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-800">Section Locked for Payroll Usage</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};