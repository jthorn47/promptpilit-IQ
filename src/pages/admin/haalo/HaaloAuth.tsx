import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Shield, 
  Key, 
  Users, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Smartphone,
  Mail,
  Database,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuthSession {
  id: string;
  user_id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  last_activity: string;
}

interface AuthPolicy {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  policy_type: 'password' | 'session' | 'mfa' | 'oauth';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface OAuthProvider {
  id: string;
  name: string;
  provider_type: string;
  is_enabled: boolean;
  client_id: string;
  client_secret: string;
  redirect_url: string;
  scopes: string[];
  config: Record<string, any>;
}

const HaaloAuth: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for different sections
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [policies, setPolicies] = useState<AuthPolicy[]>([]);
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  
  // Dialog states
  const [policyDialog, setPolicyDialog] = useState(false);
  const [oauthDialog, setOauthDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Stats
  const [authStats, setAuthStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    failedLogins: 0,
    enabledPolicies: 0
  });

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSessions(),
        loadPolicies(),
        loadOAuthProviders(),
        loadApiKeys(),
        loadAuthStats()
      ]);
    } catch (error) {
      console.error('Error loading auth data:', error);
      toast.error('Failed to load authentication data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    // Mock data for now - replace with actual API call
    setSessions([
      {
        id: '1',
        user_id: 'user_1',
        user_email: 'admin@company.com',
        ip_address: '192.168.1.100',
        user_agent: 'Chrome/120.0.0.0',
        created_at: '2024-01-15T10:00:00Z',
        expires_at: '2024-01-16T10:00:00Z',
        is_active: true,
        last_activity: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        user_id: 'user_2',
        user_email: 'user@company.com',
        ip_address: '10.0.0.50',
        user_agent: 'Safari/17.0',
        created_at: '2024-01-15T09:00:00Z',
        expires_at: '2024-01-16T09:00:00Z',
        is_active: false,
        last_activity: '2024-01-15T12:00:00Z'
      }
    ]);
  };

  const loadPolicies = async () => {
    // Mock data for now - replace with actual API call
    setPolicies([
      {
        id: '1',
        name: 'Strong Password Policy',
        description: 'Requires complex passwords with minimum 12 characters',
        is_enabled: true,
        policy_type: 'password',
        settings: { minLength: 12, requireSpecialChars: true, requireNumbers: true },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z'
      },
      {
        id: '2',
        name: 'Session Timeout',
        description: 'Automatically logout users after 24 hours of inactivity',
        is_enabled: true,
        policy_type: 'session',
        settings: { timeoutHours: 24, rememberMe: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z'
      },
      {
        id: '3',
        name: 'Multi-Factor Authentication',
        description: 'Require 2FA for all admin users',
        is_enabled: false,
        policy_type: 'mfa',
        settings: { requiredRoles: ['super_admin', 'company_admin'], methods: ['totp', 'sms'] },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]);
  };

  const loadOAuthProviders = async () => {
    // Mock data for now - replace with actual API call
    setOauthProviders([
      {
        id: '1',
        name: 'Google',
        provider_type: 'google',
        is_enabled: true,
        client_id: 'google_client_id',
        client_secret: '***hidden***',
        redirect_url: 'https://app.haalo.com/auth/callback/google',
        scopes: ['openid', 'email', 'profile'],
        config: {}
      },
      {
        id: '2',
        name: 'Microsoft',
        provider_type: 'microsoft',
        is_enabled: false,
        client_id: 'microsoft_client_id',
        client_secret: '***hidden***',
        redirect_url: 'https://app.haalo.com/auth/callback/microsoft',
        scopes: ['openid', 'email', 'profile'],
        config: {}
      }
    ]);
  };

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setApiKeys([]);
    }
  };

  const loadAuthStats = async () => {
    // Mock stats - replace with actual queries
    setAuthStats({
      totalUsers: 1247,
      activeSessions: 89,
      failedLogins: 12,
      enabledPolicies: 2
    });
  };

  const handlePolicyToggle = async (policyId: string, enabled: boolean) => {
    try {
      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, is_enabled: enabled } : p
      ));
      toast.success(`Policy ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update policy');
    }
  };

  const handleSessionTerminate = async (sessionId: string) => {
    try {
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, is_active: false } : s
      ));
      toast.success('Session terminated successfully');
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authentication & Security</h1>
          <p className="text-muted-foreground">
            Manage authentication policies, sessions, and security settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadAuthData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{authStats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{authStats.activeSessions}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins (24h)</p>
                <p className="text-2xl font-bold">{authStats.failedLogins}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Policies</p>
                <p className="text-2xl font-bold">{authStats.enabledPolicies}/{policies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="oauth">OAuth Providers</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Authentication Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${session.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium">{session.user_email}</p>
                          <p className="text-sm text-muted-foreground">{session.ip_address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatTimeAgo(session.last_activity)}</p>
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Policy Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${policy.is_enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          <p className="text-sm text-muted-foreground">{policy.description}</p>
                        </div>
                      </div>
                      <Badge variant={policy.is_enabled ? "default" : "secondary"}>
                        {policy.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>
                Monitor and manage user authentication sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.user_email}</TableCell>
                      <TableCell>{session.ip_address}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{session.user_agent}</TableCell>
                      <TableCell>{formatDate(session.created_at)}</TableCell>
                      <TableCell>{formatTimeAgo(session.last_activity)}</TableCell>
                      <TableCell>
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {session.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSessionTerminate(session.id)}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Terminate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Security Policies</CardTitle>
                <CardDescription>
                  Configure authentication and security policies
                </CardDescription>
              </div>
              <Button onClick={() => setPolicyDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={policy.is_enabled}
                        onCheckedChange={(enabled) => handlePolicyToggle(policy.id, enabled)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{policy.name}</h3>
                          <Badge variant="outline">{policy.policy_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteDialog(policy.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>OAuth Providers</CardTitle>
                <CardDescription>
                  Configure external authentication providers
                </CardDescription>
              </div>
              <Button onClick={() => setOauthDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {oauthProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Globe className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{provider.name}</h3>
                            <p className="text-sm text-muted-foreground">{provider.provider_type}</p>
                          </div>
                        </div>
                        <Switch
                          checked={provider.is_enabled}
                          onCheckedChange={(enabled) => {
                            setOauthProviders(prev => prev.map(p => 
                              p.id === provider.id ? { ...p, is_enabled: enabled } : p
                            ));
                          }}
                        />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Client ID:</span> {provider.client_id}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>{' '}
                          <Badge variant={provider.is_enabled ? "default" : "secondary"}>
                            {provider.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Manage API keys for system integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Preview</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono">{key.key_preview}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {key.permissions?.slice(0, 2).map((permission: string) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {key.permissions?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{key.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {key.last_used_at ? formatTimeAgo(key.last_used_at) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HaaloAuth;