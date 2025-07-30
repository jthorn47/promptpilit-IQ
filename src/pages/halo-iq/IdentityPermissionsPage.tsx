import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Lock, Users, Shield, Settings, UserPlus, Key } from 'lucide-react';

export const IdentityPermissionsPage: React.FC = () => {
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'HR Manager',
      status: 'active',
      lastLogin: '2 hours ago',
      permissions: ['read', 'write', 'delete']
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Employee',
      status: 'active',
      lastLogin: '1 day ago',
      permissions: ['read']
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Admin',
      status: 'inactive',
      lastLogin: '1 week ago',
      permissions: ['read', 'write', 'delete', 'admin']
    }
  ];

  const roles = [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access',
      userCount: 2,
      permissions: ['all']
    },
    {
      id: 2,
      name: 'HR Manager',
      description: 'HR operations management',
      userCount: 5,
      permissions: ['hr_read', 'hr_write', 'reports']
    },
    {
      id: 3,
      name: 'Employee',
      description: 'Basic employee access',
      userCount: 150,
      permissions: ['profile_read', 'profile_write']
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  return (
    <StandardPageLayout
      title="Identity & Permissions"
      subtitle="User identity management and access control"
      headerActions={
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Last login: {user.lastLogin}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={user.status === 'active'} />
                    <Button size="sm" variant="outline">
                      <Key className="h-4 w-4 mr-1" />
                      Permissions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Roles & Permissions</span>
                </CardTitle>
                <CardDescription>Configure role-based access control</CardDescription>
              </div>
              <Button variant="outline">
                <Lock className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Users:</span>
                        <span className="font-medium">{role.userCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Permissions:</span>
                        <span className="font-medium">{role.permissions.length}</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
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
      </div>
    </StandardPageLayout>
  );
};