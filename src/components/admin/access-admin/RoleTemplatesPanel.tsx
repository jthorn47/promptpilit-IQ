import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EXPECTED_ROLES } from '@/utils/roleValidation';
import { useAuthzService } from '@/hooks/useAuthzService';
import { Edit, Plus, Copy, Trash2, Save, X } from 'lucide-react';

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  defaultModules: string[];
  isCustom: boolean;
}

export const RoleTemplatesPanel: React.FC = () => {
  const { permissions, rolePermissions, loading } = useAuthzService();
  const [editingRole, setEditingRole] = useState<RoleTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Mock role templates - will be replaced with real data
  const [roleTemplates] = useState<RoleTemplate[]>([
    {
      id: '1',
      name: 'super_admin',
      description: 'Full system access - all permissions and modules',
      permissions: ['system:manage', 'users:manage', 'companies:manage', 'reports:view'],
      defaultModules: ['vault', 'pulse', 'crm', 'payroll', 'hr', 'training'],
      isCustom: false
    },
    {
      id: '2',
      name: 'company_admin',
      description: 'Company-wide administration within assigned company',
      permissions: ['users:manage', 'reports:view', 'training:assign'],
      defaultModules: ['training', 'hr', 'reports'],
      isCustom: false
    },
    {
      id: '3',
      name: 'client_admin',
      description: 'Client-specific administration and user management',
      permissions: ['users:view', 'training:view', 'reports:view'],
      defaultModules: ['training', 'reports'],
      isCustom: false
    },
    {
      id: '4',
      name: 'learner',
      description: 'Standard learner access to training and basic features',
      permissions: ['training:view', 'profile:edit'],
      defaultModules: ['training'],
      isCustom: false
    }
  ]);

  const handleEdit = (role: RoleTemplate) => {
    setEditingRole(role);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingRole({
      id: '',
      name: '',
      description: '',
      permissions: [],
      defaultModules: [],
      isCustom: true
    });
    setIsCreating(true);
  };

  const handleClone = (role: RoleTemplate) => {
    setEditingRole({
      ...role,
      id: '',
      name: `${role.name}_copy`,
      isCustom: true
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    // Implementation for saving role
    setEditingRole(null);
    setIsCreating(false);
  };

  const RoleEditor: React.FC<{ role: RoleTemplate }> = ({ role }) => {
    const [formData, setFormData] = useState(role);

    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>{isCreating ? 'Create New Role' : 'Edit Role Template'}</CardTitle>
          <CardDescription>
            Define permissions and default modules for this role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!formData.isCustom}
              />
            </div>
            <div>
              <Label>Role Type</Label>
              <Badge variant={formData.isCustom ? "secondary" : "default"}>
                {formData.isCustom ? 'Custom' : 'System'}
              </Badge>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {permissions.map((perm) => (
                <div key={perm.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`perm-${perm.id}`}
                    checked={formData.permissions.includes(perm.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          permissions: [...prev.permissions, perm.name] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          permissions: prev.permissions.filter(p => p !== perm.name) 
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={`perm-${perm.id}`} className="text-sm">
                    {perm.name} - {perm.description}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Default Modules</Label>
            <div className="grid grid-cols-3 gap-2">
              {['vault', 'pulse', 'crm', 'payroll', 'hr', 'training', 'reports'].map((module) => (
                <div key={module} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`module-${module}`}
                    checked={formData.defaultModules.includes(module)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          defaultModules: [...prev.defaultModules, module] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          defaultModules: prev.defaultModules.filter(m => m !== module) 
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={`module-${module}`} className="text-sm capitalize">
                    {module}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Role
            </Button>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div>Loading role templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Role Templates</h2>
          <p className="text-muted-foreground">Manage role definitions and their default permissions</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Role
        </Button>
      </div>

      {editingRole && <RoleEditor role={editingRole} />}

      <div className="grid gap-4">
        {roleTemplates.map((role) => (
          <Card key={role.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{role.name}</h3>
                    <Badge variant={role.isCustom ? "secondary" : "default"}>
                      {role.isCustom ? 'Custom' : 'System'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs font-medium">Permissions:</span>
                    {role.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs font-medium">Default Modules:</span>
                    {role.defaultModules.map((module) => (
                      <Badge key={module} variant="secondary" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleClone(role)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {role.isCustom && (
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};