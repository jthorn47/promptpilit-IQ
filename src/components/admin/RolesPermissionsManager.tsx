import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApiPermissions, Permission } from '@/hooks/useApiPermissions';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield, Users, Loader2 } from 'lucide-react';

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
  { value: 'company_admin', label: 'Company Admin', description: 'Company management access' },
  { value: 'admin', label: 'Admin', description: 'Easeworks employee access' },
  { value: 'learner', label: 'Learner', description: 'Training access only' },
];

const RESOURCES = ['users', 'documents', 'training', 'ai_content', 'company', 'analytics', 'reports', 'system', 'audit'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'manage', 'assign', 'publish'];

export const RolesPermissionsManager = () => {
  console.log('🔍 RolesPermissionsManager: Component rendering...');
  const { permissions, rolePermissions, loading, assignPermissionToRole, removePermissionFromRole, createPermission, updatePermission, deletePermission } = useApiPermissions();
  console.log('🔍 RolesPermissionsManager: Hook data:', { permissions: permissions.length, rolePermissions: rolePermissions.length, loading });
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    resource: '',
    action: ''
  });

  const getRolePermissions = (role: string) => {
    return rolePermissions.filter(rp => rp.role === role);
  };

  const isPermissionAssigned = (role: string, permissionId: string) => {
    return rolePermissions.some(rp => rp.role === role && rp.permission_id === permissionId);
  };

  const handleTogglePermission = async (role: string, permissionId: string, isAssigned: boolean) => {
    if (isAssigned) {
      const result = await removePermissionFromRole(role, permissionId);
      if (result.success) {
        toast({ title: 'Permission removed successfully' });
      } else {
        toast({ title: 'Error removing permission', variant: 'destructive' });
      }
    } else {
      const result = await assignPermissionToRole(role, permissionId);
      if (result.success) {
        toast({ title: 'Permission assigned successfully' });
      } else {
        toast({ title: 'Error assigning permission', variant: 'destructive' });
      }
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createPermission(newPermission);
    if (result.success) {
      toast({ title: 'Permission created successfully' });
      setIsCreateModalOpen(false);
      setNewPermission({ name: '', description: '', resource: '', action: '' });
    } else {
      toast({ title: 'Error creating permission', variant: 'destructive' });
    }
  };

  const handleUpdatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermission) return;
    
    const result = await updatePermission(editingPermission.id, {
      name: editingPermission.name,
      description: editingPermission.description,
      resource: editingPermission.resource,
      action: editingPermission.action
    });
    
    if (result.success) {
      toast({ title: 'Permission updated successfully' });
      setEditingPermission(null);
    } else {
      toast({ title: 'Error updating permission', variant: 'destructive' });
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      const result = await deletePermission(id);
      if (result.success) {
        toast({ title: 'Permission deleted successfully' });
      } else {
        toast({ title: 'Error deleting permission', variant: 'destructive' });
      }
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  console.log('🔍 RolesPermissionsManager: Rendering with loading:', loading);
  
  if (loading) {
    console.log('🔍 RolesPermissionsManager: Showing loading state');
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and system permissions</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>Add a new permission to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div>
                <Label htmlFor="name">Permission Name</Label>
                <Input
                  id="name"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  placeholder="e.g., users.create"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  placeholder="Brief description of the permission"
                />
              </div>
              <div>
                <Label htmlFor="resource">Resource</Label>
                <Select value={newPermission.resource} onValueChange={(value) => setNewPermission({ ...newPermission, resource: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map(resource => (
                      <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Select value={newPermission.action} onValueChange={(value) => setNewPermission({ ...newPermission, action: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Permission</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permission Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Permissions</CardTitle>
              <CardDescription>Assign permissions to different user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="space-y-2">
                      <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {resource} Permissions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resourcePermissions.map(permission => {
                          const isAssigned = isPermissionAssigned(selectedRole, permission.id);
                          return (
                            <Card key={permission.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-muted-foreground">{permission.description}</div>
                                  <Badge variant="outline" className="mt-1">
                                    {permission.action}
                                  </Badge>
                                </div>
                                <Switch
                                  checked={isAssigned}
                                  onCheckedChange={(checked) => handleTogglePermission(selectedRole, permission.id, isAssigned)}
                                />
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>Manage system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Assigned Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(permission => {
                    const assignedRoles = rolePermissions
                      .filter(rp => rp.permission_id === permission.id)
                      .map(rp => rp.role);
                    
                    return (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{permission.resource}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.action}</Badge>
                        </TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {assignedRoles.map(role => (
                              <Badge key={role} variant="default" className="text-xs">
                                {ROLES.find(r => r.value === role)?.label || role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPermission(permission)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePermission(permission.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Permission Dialog */}
      <Dialog open={editingPermission !== null} onOpenChange={() => setEditingPermission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission details</DialogDescription>
          </DialogHeader>
          {editingPermission && (
            <form onSubmit={handleUpdatePermission} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Permission Name</Label>
                <Input
                  id="edit-name"
                  value={editingPermission.name}
                  onChange={(e) => setEditingPermission({ ...editingPermission, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingPermission.description || ''}
                  onChange={(e) => setEditingPermission({ ...editingPermission, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-resource">Resource</Label>
                <Select
                  value={editingPermission.resource}
                  onValueChange={(value) => setEditingPermission({ ...editingPermission, resource: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map(resource => (
                      <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-action">Action</Label>
                <Select
                  value={editingPermission.action}
                  onValueChange={(value) => setEditingPermission({ ...editingPermission, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Update Permission</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};