import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  MoreVertical,
  Settings,
  UserCheck,
  UserX,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Admin',
    department: 'IT',
    status: 'active',
    permissions: ['read', 'write', 'delete', 'admin'],
    lastLogin: '2024-01-15 14:30'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    role: 'Manager',
    department: 'HR',
    status: 'active',
    permissions: ['read', 'write'],
    lastLogin: '2024-01-15 09:15'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    role: 'Employee',
    department: 'Finance',
    status: 'inactive',
    permissions: ['read'],
    lastLogin: '2024-01-10 16:45'
  }
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: ['read', 'write', 'delete', 'admin', 'configure'],
    userCount: 2
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Department management access',
    permissions: ['read', 'write', 'manage_team'],
    userCount: 8
  },
  {
    id: '3',
    name: 'Employee',
    description: 'Standard user access',
    permissions: ['read'],
    userCount: 45
  }
];

const availablePermissions = [
  { id: 'read', name: 'Read', description: 'View documents and data' },
  { id: 'write', name: 'Write', description: 'Create and edit content' },
  { id: 'delete', name: 'Delete', description: 'Remove documents and data' },
  { id: 'admin', name: 'Admin', description: 'Administrative functions' },
  { id: 'configure', name: 'Configure', description: 'System configuration' },
  { id: 'manage_team', name: 'Manage Team', description: 'Team management' }
];

export const AccessControlModal: React.FC<AccessControlModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserStatusToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast({
      title: "User Status Updated",
      description: `User has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
    });
  };

  const handlePermissionChange = (permission: string, granted: boolean) => {
    toast({
      title: "Permission Updated",
      description: `Permission ${permission} has been ${granted ? 'granted' : 'revoked'}.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">{/* Added overflow-y-auto for scrolling */}
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Access Control Management</span>
          </DialogTitle>
          <DialogDescription>
            Manage user permissions and access controls across your organization
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users & Permissions</TabsTrigger>
            <TabsTrigger value="roles">Roles Management</TabsTrigger>
            <TabsTrigger value="audit">Access Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User List */}
              <div className="space-y-4">
                <h3 className="font-medium">Users ({filteredUsers.length})</h3>
                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedUser?.id === user.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.department} • {user.role}</p>
                        </div>
                        <Switch
                          checked={user.status === 'active'}
                          onCheckedChange={() => handleUserStatusToggle(user.id, user.status)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <h3 className="font-medium">User Details</h3>
                {selectedUser ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedUser.name}</CardTitle>
                          <CardDescription>{selectedUser.email}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Role</Label>
                          <p className="font-medium">{selectedUser.role}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Department</Label>
                          <p className="font-medium">{selectedUser.department}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Status</Label>
                          <Badge className={`text-xs ${getStatusColor(selectedUser.status)}`}>
                            {selectedUser.status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Last Login</Label>
                          <p className="font-medium">{selectedUser.lastLogin}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-3 block">Permissions</Label>
                        <div className="space-y-2">
                          {availablePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{permission.name}</p>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                              <Switch
                                checked={selectedUser.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => handlePermissionChange(permission.name, checked)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a user to view details</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Role Management</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockRoles.map((role) => (
                <Card key={role.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-medium">{role.userCount}</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Access Audit Trail</h3>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Audit
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Access Events</CardTitle>
                <CardDescription>Monitor user access and permission changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '2024-01-15 14:30', user: 'John Smith', action: 'Login successful', status: 'success' },
                    { time: '2024-01-15 14:15', user: 'Admin', action: 'Permission granted to Sarah Johnson', status: 'info' },
                    { time: '2024-01-15 13:45', user: 'Sarah Johnson', action: 'Failed login attempt', status: 'warning' },
                    { time: '2024-01-15 13:30', user: 'Mike Davis', action: 'Account suspended', status: 'error' },
                  ].map((event, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        event.status === 'success' ? 'bg-green-500' :
                        event.status === 'info' ? 'bg-blue-500' :
                        event.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-muted-foreground">{event.user} • {event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};