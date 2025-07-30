import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PermissionDebugger } from '@/components/PermissionDebugger';
import { Search, User, Eye, TestTube } from 'lucide-react';

interface UserDebugResult {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  modules: string[];
  deniedAccess: Array<{
    feature: string;
    reason: string;
  }>;
}

export const DebugAuditView: React.FC = () => {
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [debugResult, setDebugResult] = useState<UserDebugResult | null>(null);

  // Mock users for testing
  const mockUsers = [
    { id: '1', email: 'admin@easeworks.com', name: 'Super Admin' },
    { id: '2', email: 'company@client.com', name: 'Company Admin' },
    { id: '3', email: 'user@client.com', name: 'Regular User' }
  ];

  const handleDebugUser = async (userId: string) => {
    // Mock debug result - will be replaced with real permission engine calls
    const mockResult: UserDebugResult = {
      userId,
      email: mockUsers.find(u => u.id === userId)?.email || '',
      roles: ['company_admin'],
      permissions: ['users:view', 'training:assign', 'reports:view'],
      modules: ['training', 'hr', 'reports'],
      deniedAccess: [
        { feature: 'system:manage', reason: 'Role company_admin does not have system management permissions' },
        { feature: 'vault:access', reason: 'Module vault not assigned to user company' }
      ]
    };
    
    setDebugResult(mockResult);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Debug & Audit View</h2>
        <p className="text-muted-foreground">
          Test user permissions and understand access control decisions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              User Permission Lookup
            </CardTitle>
            <CardDescription>
              Select a user to analyze their current permissions and access rights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-search">Search User</Label>
              <div className="flex gap-2">
                <Input
                  id="user-search"
                  placeholder="Enter email or user ID"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Quick Select</Label>
              <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user to debug" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <Button onClick={() => handleDebugUser(selectedUser)} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Analyze User Permissions
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Permission Test Results */}
        {debugResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Permission Analysis
              </CardTitle>
              <CardDescription>
                Current access rights for {debugResult.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">User Roles</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {debugResult.roles.map((role) => (
                    <Badge key={role} variant="default">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Granted Permissions</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {debugResult.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Accessible Modules</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {debugResult.modules.map((module) => (
                    <Badge key={module} variant="outline">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Denied Access</Label>
                <div className="space-y-2 mt-1">
                  {debugResult.deniedAccess.map((denied, index) => (
                    <div key={index} className="text-sm bg-destructive/10 border border-destructive/20 rounded p-2">
                      <div className="font-medium text-destructive">{denied.feature}</div>
                      <div className="text-xs text-muted-foreground">{denied.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Interactive Permission Debugger */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Permission Debugger</CardTitle>
          <CardDescription>
            Test specific permission and module combinations in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionDebugger />
        </CardContent>
      </Card>
    </div>
  );
};