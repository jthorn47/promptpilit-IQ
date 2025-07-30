import React, { useState, useEffect } from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { use2FA } from '@/hooks/use2FA';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Smartphone, 
  Key, 
  CheckCircle, 
  XCircle, 
  QrCode,
  Copy,
  Download,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { TwoFactorSetup } from '@/components/2fa/TwoFactorSetup';
import { TwoFactorVerification } from '@/components/2fa/TwoFactorVerification';

interface User2FAStatus {
  id: string;
  email: string;
  isEnabled: boolean;
  method: string;
  lastUsed: string | null;
  backupCodesCount: number;
}

export const TwoFactorManagement: React.FC = () => {
  const [users2FA, setUsers2FA] = useState<User2FAStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();
  const { loading, error, get2FAStatus, disable2FA } = use2FA();

  // Current user's 2FA status
  const [currentUser2FA, setCurrentUser2FA] = useState({
    isEnabled: false,
    hasBackupCodes: false
  });

  useEffect(() => {
    loadCurrentUser2FA();
    loadUsers2FAStatus();
  }, []);

  const loadCurrentUser2FA = async () => {
    try {
      const status = await get2FAStatus();
      setCurrentUser2FA(status);
    } catch (error) {
      console.error('Failed to load current user 2FA status:', error);
    }
  };

  const loadUsers2FAStatus = async () => {
    try {
      setIsLoading(true);
      
      // Get all users with their 2FA settings
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email');

      if (profilesError) throw profilesError;

      const { data: settingsData, error: settingsError } = await supabase
        .from('user_2fa_settings')
        .select('user_id, is_enabled, method, last_used_at, backup_codes');

      if (settingsError) throw settingsError;

      const users: User2FAStatus[] = profilesData?.map(profile => {
        const settings = settingsData?.find(s => s.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.email,
          isEnabled: settings?.is_enabled || false,
          method: settings?.method || 'none',
          lastUsed: settings?.last_used_at || null,
          backupCodesCount: settings?.backup_codes?.length || 0
        };
      }) || [];

      setUsers2FA(users);
    } catch (error) {
      console.error('Failed to load users 2FA status:', error);
      toast({
        title: "Error",
        description: "Failed to load 2FA status for users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASetupSuccess = () => {
    setSetupDialogOpen(false);
    loadCurrentUser2FA();
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been successfully enabled",
    });
  };

  const handleDisable2FA = async () => {
    try {
      const success = await disable2FA();
      if (success) {
        loadCurrentUser2FA();
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    }
  };

  const copyBackupCodes = () => {
    const codes = backupCodes.join('\n');
    navigator.clipboard.writeText(codes);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const codes = backupCodes.join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Backup codes saved as text file",
    });
  };

  const stats = {
    totalUsers: users2FA.length,
    enabled2FA: users2FA.filter(u => u.isEnabled).length,
    disabled2FA: users2FA.filter(u => !u.isEnabled).length
  };

  return (
    <StandardPageLayout
      title="Two-Factor Authentication"
      subtitle="Manage 2FA settings and security for users"
      badge="Security"
    >
      <div className="space-y-6">
        {/* Current User 2FA Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your 2FA Status
            </CardTitle>
            <CardDescription>
              Manage your own two-factor authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentUser2FA.isEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">
                    2FA is {currentUser2FA.isEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser2FA.isEnabled
                      ? `Backup codes available: ${currentUser2FA.hasBackupCodes ? 'Yes' : 'No'}`
                      : 'Enable 2FA to secure your account'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!currentUser2FA.isEnabled ? (
                  <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Enable 2FA
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                          Set up 2FA to add an extra layer of security to your account
                        </DialogDescription>
                      </DialogHeader>
                      <TwoFactorSetup
                        onSuccess={handle2FASetupSuccess}
                        onCancel={() => setSetupDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="destructive" onClick={handleDisable2FA} disabled={loading}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup Codes Dialog */}
        {showBackupCodes && (
          <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Backup Codes
                </DialogTitle>
                <DialogDescription>
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Each backup code can only be used once. Keep them secure and private.
                  </AlertDescription>
                </Alert>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-background rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadBackupCodes} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.enabled2FA}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalUsers > 0 ? Math.round((stats.enabled2FA / stats.totalUsers) * 100) : 0}% adoption rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">2FA Disabled</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.disabled2FA}</div>
                  <p className="text-xs text-muted-foreground">
                    Users without 2FA
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent 2FA Activity</CardTitle>
                <CardDescription>Latest two-factor authentication events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users2FA
                    .filter(u => u.lastUsed)
                    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
                    .slice(0, 5)
                    .map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Last used: {new Date(user.lastUsed!).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {user.method}
                        </Badge>
                      </div>
                    ))}
                  {users2FA.filter(u => u.lastUsed).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No recent 2FA activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User 2FA Status</CardTitle>
                <CardDescription>View and manage 2FA settings for all users</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users2FA.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {user.isEnabled ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{user.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.isEnabled ? (
                                <>
                                  Method: {user.method} • Backup codes: {user.backupCodesCount}
                                  {user.lastUsed && ` • Last used: ${new Date(user.lastUsed).toLocaleDateString()}`}
                                </>
                              ) : (
                                '2FA not enabled'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isEnabled ? "default" : "secondary"}>
                            {user.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System 2FA Settings</CardTitle>
                <CardDescription>Configure global 2FA policies and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    2FA is now <strong>mandatory</strong> for all users. New users must set up 2FA before accessing the system.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-2fa" className="text-base">Require 2FA for Admins</Label>
                      <p className="text-sm text-muted-foreground">
                        Force all admin users to enable 2FA
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-reminder" className="text-base">Backup Code Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Remind users to save backup codes
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageLayout>
  );
};