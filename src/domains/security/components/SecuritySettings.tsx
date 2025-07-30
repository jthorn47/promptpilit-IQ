import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSecurityPolicies } from '../hooks/useSecurityPolicies';
import { use2FA } from '@/hooks/use2FA';
import { TwoFactorSetup } from '@/components/2fa/TwoFactorSetup';
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const SecuritySettings = () => {
  const { policies, loading, togglePolicy } = useSecurityPolicies();
  const { loading: twoFALoading, get2FAStatus, disable2FA } = use2FA();
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [hasBackupCodes, setHasBackupCodes] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    const status = await get2FAStatus();
    setIs2FAEnabled(status.isEnabled);
    setHasBackupCodes(status.hasBackupCodes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleTogglePolicy = async (policyId: string) => {
    const result = await togglePolicy(policyId);
    if (result.error) {
      console.error('Failed to toggle policy:', result.error);
    }
  };

  const handle2FAToggle = async () => {
    if (is2FAEnabled) {
      const success = await disable2FA();
      if (success) {
        setIs2FAEnabled(false);
        setHasBackupCodes(false);
        toast.success('2FA has been disabled');
      }
    } else {
      setShow2FASetup(true);
    }
  };

  const handle2FASetupSuccess = () => {
    setShow2FASetup(false);
    setIs2FAEnabled(true);
    setHasBackupCodes(true);
    toast.success('2FA has been enabled successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Configure security policies and system-wide security settings
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Policies</CardTitle>
          <CardDescription>
            Manage active security policies and their enforcement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">{policy.name}</h4>
                <p className="text-sm text-muted-foreground">{policy.description}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{policy.policy_type}</Badge>
                  <Badge className={policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {policy.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={policy.is_active}
                onCheckedChange={() => handleTogglePolicy(policy.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  {is2FAEnabled && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {is2FAEnabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Secure your account with Google Authenticator or similar apps'
                  }
                </p>
                {is2FAEnabled && hasBackupCodes && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Backup codes are available
                  </p>
                )}
              </div>
              <Switch 
                checked={is2FAEnabled}
                onCheckedChange={handle2FAToggle}
                disabled={twoFALoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
            <CardDescription>
              Enable or disable security features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">IP Whitelist</h4>
                <p className="text-sm text-muted-foreground">Restrict access to approved IPs</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Audit Logging</h4>
                <p className="text-sm text-muted-foreground">Log all user activities</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automatic Backups</h4>
                <p className="text-sm text-muted-foreground">Daily encrypted backups</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Actions</CardTitle>
            <CardDescription>
              Perform security-related maintenance tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              Force Password Reset for All Users
            </Button>
            <Button className="w-full" variant="outline">
              Rotate API Keys
            </Button>
            <Button className="w-full" variant="outline">
              Clear All Sessions
            </Button>
            <Button className="w-full" variant="outline">
              Generate Security Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="sm:max-w-lg p-0">
          <TwoFactorSetup
            onSuccess={handle2FASetupSuccess}
            onCancel={() => setShow2FASetup(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};