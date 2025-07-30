import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateQRCode } from '@/utils/qrCodeGenerator';
import { use2FA } from '@/hooks/use2FA';
import { Shield, Download, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorSetupProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorSetup = ({ onSuccess, onCancel }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  
  const { loading, error, generateSecret, verifyCode } = use2FA();

  useEffect(() => {
    initializeSetup();
  }, []);

  const initializeSetup = async () => {
    const data = await generateSecret();
    if (data) {
      setSecret(data.secret);
      const qrCodeUrl = await generateQRCode(data.otpauthUrl);
      setQrCode(qrCodeUrl);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    const result = await verifyCode(verificationCode);
    if (result?.success) {
      if (result.backupCodes) {
        setBackupCodes(result.backupCodes);
        setStep('backup');
      } else {
        toast.success('2FA enabled successfully!');
        onSuccess();
      }
    }
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  if (step === 'qr') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Or enter this secret manually:</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={showSecret ? secret : '••••••••••••••••'}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySecret}
                  disabled={secretCopied}
                >
                  {secretCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => setStep('verify')} 
              className="flex-1"
              disabled={!qrCode}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Verify Your Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the 6-digit code from your authenticator app
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('qr')} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleVerify} 
              className="flex-1"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Activate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'backup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">2FA Enabled Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center py-1">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Each backup code can only be used once. Store them securely!
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={downloadBackupCodes}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onSuccess} className="flex-1">
              Complete Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};