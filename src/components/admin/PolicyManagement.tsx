import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { useAdvancedPermissions } from '@/hooks/useAdvancedPermissions';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Edit, Trash2, Users, Settings, Eye } from 'lucide-react';

interface PolicyRule {
  id: string;
  feature: string;
  action: string;
  conditions: Record<string, any>;
  description: string;
  isEnabled: boolean;
}

interface UserAttribute {
  id: string;
  userId: string;
  attribute: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array';
}

export const PolicyManagement: React.FC = () => {
  const { toast } = useToast();
  const { canAccessSync } = usePermissionContext();
  const { modules, loading } = useAdvancedPermissions();
  
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Mock data - will be replaced with real API calls
  const [policies] = useState<PolicyRule[]>([
    {
      id: '1',
      feature: 'users',
      action: 'manage',
      conditions: { role: 'company_admin', scope: 'own_company' },
      description: 'Company admins can manage users in their own company',
      isEnabled: true
    },
    {
      id: '2', 
      feature: 'payroll',
      action: 'view',
      conditions: { department: 'hr', module_enabled: 'payroll' },
      description: 'HR department can view payroll data when module is enabled',
      isEnabled: true
    }
  ]);
  
  const [userAttributes] = useState<UserAttribute[]>([
    {
      id: '1',
      userId: 'user-123',
      attribute: 'department',
      value: 'hr',
      type: 'string'
    },
    {
      id: '2',
      userId: 'user-123', 
      attribute: 'security_clearance',
      value: 3,
      type: 'number'
    }
  ]);

  const handleCreatePolicy = () => {
    setIsCreating(true);
    setSelectedPolicy(null);
  };

  const handleEditPolicy = (policy: PolicyRule) => {
    setSelectedPolicy(policy);
    setIsCreating(false);
  };

  const handleSavePolicy = (policyData: any) => {
    // Parse conditions JSON string back to object
    try {
      const parsedData = {
        ...policyData,
        conditions: typeof policyData.conditions === 'string' 
          ? JSON.parse(policyData.conditions) 
          : policyData.conditions
      };
      
      // Implementation for saving policy
      toast({
        title: "Policy Saved",
        description: "Permission policy has been updated successfully.",
      });
      setIsCreating(false);
      setSelectedPolicy(null);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check the conditions format.",
        variant: "destructive"
      });
    }
  };

  const PolicyEditor: React.FC<{ policy?: PolicyRule; onSave: (data: any) => void }> = ({ 
    policy, 
    onSave 
  }) => {
    const [formData, setFormData] = useState({
      feature: policy?.feature || '',
      action: policy?.action || '',
      description: policy?.description || '',
      conditions: JSON.stringify(policy?.conditions || {}, null, 2),
      isEnabled: policy?.isEnabled ?? true
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>{policy ? 'Edit Policy' : 'Create New Policy'}</CardTitle>
          <CardDescription>
            Define permission rules with feature, action, and conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="feature">Feature</Label>
              <Input
                id="feature"
                value={formData.feature}
                onChange={(e) => setFormData(prev => ({ ...prev, feature: e.target.value }))}
                placeholder="e.g., users, payroll, reports"
              />
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Select 
                value={formData.action} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="manage">Manage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this policy allows"
            />
          </div>
          
          <div>
            <Label htmlFor="conditions">Conditions (JSON)</Label>
            <Textarea
              id="conditions"
              value={formData.conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
              placeholder='{"role": "admin", "department": "hr"}'
              className="font-mono text-sm"
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
            />
            <Label htmlFor="enabled">Policy Enabled</Label>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)}>
              Save Policy
            </Button>
            <Button variant="outline" onClick={() => setSelectedPolicy(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PermissionGuard requiredPermission="system:manage" fallback={
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Access denied - System management required</p>
      </div>
    }>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Policy Management</h1>
            <p className="text-muted-foreground">Manage permission policies and user attributes</p>
          </div>
          <Button onClick={handleCreatePolicy}>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>

        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="policies">Permission Policies</TabsTrigger>
            <TabsTrigger value="attributes">User Attributes</TabsTrigger>
            <TabsTrigger value="modules">Module Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-4">
            {(isCreating || selectedPolicy) && (
              <PolicyEditor policy={selectedPolicy} onSave={handleSavePolicy} />
            )}
            
            <div className="grid gap-4">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={policy.isEnabled ? "default" : "secondary"}>
                            {policy.feature}:{policy.action}
                          </Badge>
                          {!policy.isEnabled && <Badge variant="outline">Disabled</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                        <div className="text-xs font-mono bg-muted p-2 rounded">
                          {JSON.stringify(policy.conditions)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditPolicy(policy)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Attributes</CardTitle>
                <CardDescription>
                  Manage custom attributes for context-aware permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAttributes.map((attr) => (
                    <div key={attr.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{attr.attribute}</div>
                        <div className="text-sm text-muted-foreground">
                          {typeof attr.value === 'object' ? JSON.stringify(attr.value) : String(attr.value)}
                        </div>
                      </div>
                      <Badge variant="outline">{attr.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Management</CardTitle>
                <CardDescription>
                  Manage module assignments and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading modules...</p>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <div key={module.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{module.name}</div>
                          <div className="text-sm text-muted-foreground">{module.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Category: {module.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={module.isEnabled ? "default" : "secondary"}>
                            {module.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                          {module.requiredRole && (
                            <Badge variant="outline">Requires: {module.requiredRole}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
};