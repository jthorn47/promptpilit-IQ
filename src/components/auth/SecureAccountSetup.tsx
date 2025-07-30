import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Mail, Info } from 'lucide-react';
import { TwoFactorSetup } from '@/components/2fa/TwoFactorSetup';

interface SecureAccountSetupProps {
  onSetupComplete?: () => void;
}

const SecureAccountSetup: React.FC<SecureAccountSetupProps> = ({
  onSetupComplete
}) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'email' | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const handleMethodSelect = (method: 'totp' | 'email') => {
    setSelectedMethod(method);
    setShowSetup(true);
  };

  const handleSetupSuccess = () => {
    if (onSetupComplete) {
      onSetupComplete();
    } else {
      navigate('/');
    }
  };

  if (showSetup && selectedMethod === 'totp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Set Up Authenticator App
              </CardTitle>
              <CardDescription>
                Configure your authenticator app for secure login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TwoFactorSetup
                onSuccess={handleSetupSuccess}
                onCancel={() => setShowSetup(false)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showSetup && selectedMethod === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Login Codes Enabled
              </CardTitle>
              <CardDescription>
                You'll receive a secure login code via email for each login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Email authentication is now enabled. You'll receive a 6-digit code 
                  via email each time you log in.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleSetupSuccess} className="w-full">
                Complete Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Secure Your Account</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to log in securely. This step is required for all users.
          </p>
        </div>

        <div className="space-y-4">
          <Card className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => handleMethodSelect('totp')}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Smartphone className="h-8 w-8 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Use Authenticator App</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Generate secure codes with apps like Google Authenticator, Authy, or 1Password
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">✓ Works offline</p>
                    <p className="text-xs text-muted-foreground">✓ Most secure option</p>
                    <p className="text-xs text-muted-foreground">✓ Backup codes provided</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => handleMethodSelect('email')}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-8 w-8 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Receive Email Login Codes</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Get a secure 6-digit code sent to your email for each login
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">✓ Simple to use</p>
                    <p className="text-xs text-muted-foreground">✓ No app required</p>
                    <p className="text-xs text-muted-foreground">✓ Codes expire in 10 minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security is mandatory.</strong> You must choose one of these methods 
            to access the system. This protects your account and company data.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default SecureAccountSetup;