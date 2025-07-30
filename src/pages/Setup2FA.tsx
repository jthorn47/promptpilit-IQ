import { TwoFactorSetup } from '@/components/2fa/TwoFactorSetup';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Setup2FA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSetupSuccess = () => {
    // After successful 2FA setup, redirect to verification
    navigate('/verify-2fa');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Two-Factor Authentication Required</h1>
          <p className="text-muted-foreground">
            To continue using the system, you must enable two-factor authentication for your account.
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            2FA is mandatory for all users. This adds an extra layer of security to protect your account and company data.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Set Up Two-Factor Authentication</CardTitle>
            <CardDescription>
              Use an authenticator app to generate time-based codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorSetup
              onSuccess={handleSetupSuccess}
              onCancel={() => {}} // No cancel option since 2FA is required
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup2FA;