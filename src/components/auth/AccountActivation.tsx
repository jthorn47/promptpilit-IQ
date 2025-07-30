import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccountActivationProps {
  email: string;
  onActivationSuccess: () => void;
}

export const AccountActivation: React.FC<AccountActivationProps> = ({
  email,
  onActivationSuccess
}) => {
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const { toast } = useToast();

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationCode || activationCode.length !== 6) {
      setError('Please enter a valid 6-digit activation code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: { 
          code: activationCode,
          isActivation: true
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Account Activated",
          description: "Your account has been successfully activated!",
        });
        onActivationSuccess();
      } else {
        setError('Invalid or expired activation code');
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('Failed to activate account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-activation-email', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Code Sent",
        description: "A new activation code has been sent to your email.",
      });
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend activation code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Activate Your Account</h1>
          <p className="text-muted-foreground">
            We've sent a 6-digit activation code to <strong>{email}</strong>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Activation Code</CardTitle>
            <CardDescription>
              Check your email and enter the 6-digit code below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activation-code">Activation Code</Label>
                <Input
                  id="activation-code"
                  type="text"
                  placeholder="000000"
                  value={activationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setActivationCode(value);
                  }}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || activationCode.length !== 6}
              >
                {loading ? 'Activating...' : 'Activate Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            After activation, you'll choose your preferred secure login method.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};