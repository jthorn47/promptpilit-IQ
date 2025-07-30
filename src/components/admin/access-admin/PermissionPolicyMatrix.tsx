import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Shield, Eye, Edit } from 'lucide-react';

interface PolicyRule {
  id: string;
  feature: string;
  action: string;
  roles: string[];
  attributeConditions: Record<string, any>;
  isEnabled: boolean;
  description: string;
}

export const PermissionPolicyMatrix: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyRule[]>([
    {
      id: '1',
      feature: 'users',
      action: 'manage',
      roles: ['super_admin', 'company_admin'],
      attributeConditions: { scope: 'own_company' },
      isEnabled: true,
      description: 'Company admins can manage users in their own company'
    },
    {
      id: '2',
      feature: 'vault',
      action: 'access',
      roles: ['super_admin'],
      attributeConditions: { assigned_modules: 'vault', security_clearance: '>=3' },
      isEnabled: true,
      description: 'Access to vault requires module assignment and security clearance level 3+'
    },
    {
      id: '3',
      feature: 'payroll',
      action: 'view',
      roles: ['company_admin'],
      attributeConditions: { department: ['hr', 'finance'], assigned_modules: 'payroll' },
      isEnabled: true,
      description: 'HR and Finance can view payroll data when module is enabled'
    },
    {
      id: '4',
      feature: 'reports',
      action: 'generate',
      roles: ['company_admin', 'client_admin'],
      attributeConditions: { is_manager: true },
      isEnabled: true,
      description: 'Managers can generate reports'
    }
  ]);

  const [editingPolicy, setEditingPolicy] = useState<PolicyRule | null>(null);

  const modules = ['vault', 'pulse', 'crm', 'payroll', 'hr', 'training', 'reports'];
  const features = ['users', 'vault', 'payroll', 'reports', 'crm', 'training', 'system'];
  const actions = ['view', 'create', 'edit', 'delete', 'manage', 'access', 'generate'];

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p => 
      p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
    ));
  };

  const PolicyEditor: React.FC<{ policy: PolicyRule }> = ({ policy }) => {
    const [formData, setFormData] = useState(policy);

    return (
      <Card className="border-primary mb-6">
        <CardHeader>
          <CardTitle>Edit Permission Policy</CardTitle>
          <CardDescription>
            Modify the policy rules for {policy.feature}:{policy.action}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Feature</Label>
              <select
                value={formData.feature}
                onChange={(e) => setFormData(prev => ({ ...prev, feature: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                {features.map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Action</Label>
              <select
                value={formData.action}
                onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Allowed Roles</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['super_admin', 'company_admin', 'client_admin', 'learner'].map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`role-${role}`}
                    checked={formData.roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          roles: [...prev.roles, role] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          roles: prev.roles.filter(r => r !== role) 
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={`role-${role}`} className="text-sm">
                    {role}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Attribute Conditions (JSON)</Label>
            <Textarea
              value={JSON.stringify(formData.attributeConditions, null, 2)}
              onChange={(e) => {
                try {
                  const conditions = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, attributeConditions: conditions }));
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="font-mono text-sm"
              rows={4}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => {
              setPolicies(policies.map(p => p.id === formData.id ? formData : p));
              setEditingPolicy(null);
            }}>
              Save Policy
            </Button>
            <Button variant="outline" onClick={() => setEditingPolicy(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Permission Policy Matrix</h2>
        <p className="text-muted-foreground">
          Configure role-based and attribute-based access control policies
        </p>
      </div>

      {editingPolicy && <PolicyEditor policy={editingPolicy} />}

      {/* Module Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Module Access Matrix
          </CardTitle>
          <CardDescription>
            Overview of which roles have access to each module by default
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Module</th>
                  <th className="text-center p-2 border-b">Super Admin</th>
                  <th className="text-center p-2 border-b">Company Admin</th>
                  <th className="text-center p-2 border-b">Client Admin</th>
                  <th className="text-center p-2 border-b">Learner</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module} className="border-b">
                    <td className="p-2 font-medium capitalize">{module}</td>
                    <td className="text-center p-2">
                      <Badge variant="default">✓</Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge variant={['training', 'hr', 'reports'].includes(module) ? 'default' : 'outline'}>
                        {['training', 'hr', 'reports'].includes(module) ? '✓' : '○'}
                      </Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge variant={['training', 'reports'].includes(module) ? 'default' : 'outline'}>
                        {['training', 'reports'].includes(module) ? '✓' : '○'}
                      </Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge variant={module === 'training' ? 'default' : 'outline'}>
                        {module === 'training' ? '✓' : '○'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Active Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Active Permission Policies
          </CardTitle>
          <CardDescription>
            Detailed access control policies with role and attribute conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {policy.feature}:{policy.action}
                      </Badge>
                      <Switch
                        checked={policy.isEnabled}
                        onCheckedChange={() => togglePolicy(policy.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {policy.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {policy.description}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setEditingPolicy(policy)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Allowed Roles:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {policy.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Attribute Conditions:</Label>
                    <div className="text-xs font-mono bg-muted p-2 rounded mt-1">
                      {JSON.stringify(policy.attributeConditions)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};