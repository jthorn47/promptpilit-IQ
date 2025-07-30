import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Settings, Lock } from 'lucide-react';
import { permissionsService } from '../services/PermissionsService';
import type { Role, HaaLORole } from '../types';

export const PermissionsDashboard: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    setRoles(permissionsService.getAllRoles());
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Permissions Engine</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
          <CardDescription>System roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{role.displayName}</h3>
                  <Badge variant={role.isSystemRole ? 'default' : 'secondary'}>
                    {role.isSystemRole ? 'System' : 'Custom'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                <p className="text-xs">Permissions: {role.permissions.length}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsDashboard;