import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Smartphone, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import { use2FA } from '@/hooks/use2FA';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorVerificationProps {
  onSuccess: () => void;
  onBack?: () => void;
  userMethod?: 'totp' | 'email'; // Pass user's preferred method
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onSuccess,
  onBack,
  userMethod = 'totp'
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  
  const { verifyCode, loading: totpLoading, error: totpError } = use2FA();
  const { sendLoginCode, verifyEmailCode, loading: emailLoading, error: emailError } = useEmailAuth();
  const { toast } = useToast();
  
  const loading = totpLoading || emailLoading;
  const error = totpError || emailError;

  // Auto-send email code for email method users
  useEffect(() => {
    if (userMethod === 'email' && !emailCodeSent) {
      handleSendEmailCode();
    }
  }, [userMethod, emailCodeSent]);

  const handleSendEmailCode = async () => {
    const result = await sendLoginCode();
    if (result?.success) {
      setEmailCodeSent(true);
      toast({
        title: "Code Sent",
        description: "Check your email for the login code.",
      });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attemptCount >= 5) {
      return;
    }

    const codeToVerify = useBackupCode ? backupCode : verificationCode;
    
    if (!codeToVerify || codeToVerify.length < 6) {
      return;
    }

    let result;
    
    if (userMethod === 'email') {
      // Use email verification
      result = await verifyEmailCode(codeToVerify, false);
    } else {
      // Use TOTP verification
      result = await verifyCode(
        codeToVerify,
        true, // isLogin
        useBackupCode ? codeToVerify : null
      );
    }

    if (result?.success) {
      onSuccess();
    } else {
      setAttemptCount(prev => prev + 1);
      setVerificationCode('');
      setBackupCode('');
    }
  };

  const getTitle = () => {
    if (userMethod === 'email') {
      return 'Enter Email Login Code';
    }
    return useBackupCode ? 'Enter Backup Code' : 'Two-Factor Authentication';
  };

  const getDescription = () => {
    if (userMethod === 'email') {
      return 'Enter the 6-digit code sent to your email';
    }
    return useBackupCode 
      ? 'Enter one of your backup codes' 
      : 'Enter the 6-digit code from your authenticator app';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center justify-center gap-2 mb-2">
            {userMethod === 'email' ? (
              <Mail className="h-6 w-6 text-primary" />
            ) : (
              <Shield className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Email method - simple input */}
          {userMethod === 'email' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-code">Email Code</Label>
                <Input
                  id="email-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={loading || attemptCount >= 5}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {attemptCount >= 5 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Too many failed attempts. Please contact support.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || verificationCode.length !== 6 || attemptCount >= 5}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSendEmailCode}
                  disabled={loading}
                >
                  Resend Code
                </Button>
              </div>
            </form>
          )}

          {/* TOTP method - tabs for authenticator and backup codes */}
          {userMethod === 'totp' && (
            <Tabs value={useBackupCode ? 'backup' : 'authenticator'} onValueChange={(value) => {
              setUseBackupCode(value === 'backup');
              setVerificationCode('');
              setBackupCode('');
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="authenticator" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  App
                </TabsTrigger>
                <TabsTrigger value="backup" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Backup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="authenticator" className="space-y-4">
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="auth-code">Authenticator Code</Label>
                    <Input
                      id="auth-code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                        setVerificationCode(value);
                      }}
                      maxLength={6}
                      className="text-center text-lg font-mono tracking-widest"
                      disabled={loading || attemptCount >= 5}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || verificationCode.length !== 6 || attemptCount >= 5}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="backup" className="space-y-4">
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-code">Backup Code</Label>
                    <Input
                      id="backup-code"
                      type="text"
                      placeholder="Enter backup code"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                      className="text-center font-mono"
                      disabled={loading || attemptCount >= 5}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || backupCode.length < 6 || attemptCount >= 5}
                  >
                    {loading ? 'Verifying...' : 'Verify Backup Code'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {error && userMethod === 'totp' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {attemptCount >= 5 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Too many failed attempts. Please contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};