import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePermissionEngine } from '@/hooks/usePermissionEngine';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Bug, Shield, User, Database } from 'lucide-react';

export const PermissionDebugger: React.FC = () => {
  const { user, userRole, userRoles } = useAuth();
  const { 
    canAccessSync, 
    hasModuleAccess,
    assignedModules,
    loading,
    permissionsLoaded
  } = usePermissionEngine();
  
  const [testFeature, setTestFeature] = useState('users');
  const [testAction, setTestAction] = useState('view');
  const [testModule, setTestModule] = useState('training');

  const handleTestPermission = () => {
    const result = canAccessSync(testFeature, testAction);
    console.log(`🧪 Permission Test: ${testFeature}:${testAction} = ${result}`);
  };

  const handleTestModule = () => {
    const result = hasModuleAccess(testModule);
    console.log(`🧪 Module Test: ${testModule} = ${result}`);
  };

  return (
    <PermissionGuard requiredPermission="system:debug" fallback={
      <div className="text-center py-8">
        <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Access denied - Debug permissions required</p>
      </div>
    }>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Permission Debugger</h1>
          <p className="text-muted-foreground">Debug and test permission engine functionality</p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>User ID:</strong> {user?.id}</div>
            <div><strong>Primary Role:</strong> <Badge>{userRole}</Badge></div>
            <div><strong>All Roles:</strong> {userRoles.map(role => (
              <Badge key={role} variant="outline" className="mr-1">{role}</Badge>
            ))}</div>
            <div><strong>Permissions Loaded:</strong> {permissionsLoaded ? '✅' : '❌'}</div>
            <div><strong>Loading:</strong> {loading ? '⏳' : '✅'}</div>
          </CardContent>
        </Card>

        {/* Permission Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permission Testing
            </CardTitle>
            <CardDescription>Test specific feature and action combinations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="feature">Feature</Label>
                <Input
                  id="feature"
                  value={testFeature}
                  onChange={(e) => setTestFeature(e.target.value)}
                  placeholder="e.g., users, payroll, reports"
                />
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  value={testAction}
                  onChange={(e) => setTestAction(e.target.value)}
                  placeholder="e.g., view, create, edit, delete"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTestPermission}>
                Test Permission
              </Button>
              <div className="flex items-center">
                Result: {canAccessSync(testFeature, testAction) ? (
                  <Badge className="ml-2">✅ Allowed</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">❌ Denied</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Module Testing
            </CardTitle>
            <CardDescription>Test module access permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="module">Module</Label>
              <Input
                id="module"
                value={testModule}
                onChange={(e) => setTestModule(e.target.value)}
                placeholder="e.g., training, payroll, hr"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTestModule}>
                Test Module Access
              </Button>
              <div className="flex items-center">
                Result: {hasModuleAccess(testModule) ? (
                  <Badge className="ml-2">✅ Has Access</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">❌ No Access</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Permissions</CardTitle>
            <CardDescription>All permissions assigned to current user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Use browser console to see permission checks in real-time
              </p>
              <div className="text-xs font-mono bg-muted p-2 rounded">
                Open DevTools Console and test permissions above to see results
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Modules</CardTitle>
            <CardDescription>Modules available to current user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignedModules.length > 0 ? (
                assignedModules.map((module, index) => (
                  <Badge key={index} variant="outline">
                    {module}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No modules assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};