import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Key,
  UserCheck,
  Lock,
  Unlock,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserRole {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

const MOCK_PERMISSIONS: Permission[] = [
  { id: "users.read", name: "View Users", description: "Can view user profiles and information", category: "User Management" },
  { id: "users.write", name: "Manage Users", description: "Can create, edit, and delete users", category: "User Management" },
  { id: "roles.read", name: "View Roles", description: "Can view roles and permissions", category: "Role Management" },
  { id: "roles.write", name: "Manage Roles", description: "Can create, edit, and delete roles", category: "Role Management" },
  { id: "companies.read", name: "View Companies", description: "Can view company information", category: "Company Management" },
  { id: "companies.write", name: "Manage Companies", description: "Can create, edit, and delete companies", category: "Company Management" },
  { id: "settings.read", name: "View Settings", description: "Can view system settings", category: "System Administration" },
  { id: "settings.write", name: "Manage Settings", description: "Can modify system settings", category: "System Administration" },
  { id: "audit.read", name: "View Audit Logs", description: "Can view system audit logs", category: "Security" },
  { id: "reports.read", name: "View Reports", description: "Can view system reports", category: "Reporting" },
  { id: "reports.write", name: "Manage Reports", description: "Can create and modify reports", category: "Reporting" },
];

const MOCK_ROLES: Role[] = [
  {
    id: "1",
    name: "Super Administrator",
    description: "Full system access with all permissions",
    permissions: MOCK_PERMISSIONS.map(p => p.id),
    isActive: true,
    userCount: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Company Administrator",
    description: "Company-level administration with user and company management",
    permissions: ["users.read", "users.write", "companies.read", "companies.write", "reports.read"],
    isActive: true,
    userCount: 8,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
  },
  {
    id: "3",
    name: "HR Manager",
    description: "Human resources management with user oversight",
    permissions: ["users.read", "users.write", "reports.read", "companies.read"],
    isActive: true,
    userCount: 5,
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
  },
  {
    id: "4",
    name: "Viewer",
    description: "Read-only access to system information",
    permissions: ["users.read", "companies.read", "reports.read"],
    isActive: true,
    userCount: 12,
    createdAt: "2024-01-25T16:45:00Z",
    updatedAt: "2024-01-25T16:45:00Z",
  },
];

const MOCK_USER_ROLES: UserRole[] = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    userEmail: "john.doe@company.com",
    roleId: "1",
    roleName: "Super Administrator",
    assignedAt: "2024-01-15T10:00:00Z",
    assignedBy: "System",
    isActive: true,
  },
  {
    id: "2",
    userId: "user2",
    userName: "Jane Smith",
    userEmail: "jane.smith@company.com",
    roleId: "2",
    roleName: "Company Administrator",
    assignedAt: "2024-01-16T14:30:00Z",
    assignedBy: "John Doe",
    isActive: true,
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@company.com",
    roleId: "3",
    roleName: "HR Manager",
    assignedAt: "2024-01-20T09:15:00Z",
    assignedBy: "Jane Smith",
    isActive: true,
  },
];

export const HaaloRoles = () => {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [userRoles, setUserRoles] = useState<UserRole[]>(MOCK_USER_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    isActive: true,
  });

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || role.isActive === filterActive;
    return matchesSearch && matchesFilter;
  });

  const groupedPermissions = MOCK_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      isActive: newRole.isActive,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles([...roles, role]);
    setNewRole({ name: "", description: "", permissions: [], isActive: true });
    setIsCreateDialogOpen(false);
    toast.success("Role created successfully");
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    const updatedRoles = roles.map(role =>
      role.id === selectedRole.id
        ? { ...selectedRole, updatedAt: new Date().toISOString() }
        : role
    );

    setRoles(updatedRoles);
    setSelectedRole(null);
    setIsEditDialogOpen(false);
    toast.success("Role updated successfully");
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.userCount > 0) {
      toast.error("Cannot delete role with assigned users");
      return;
    }

    setRoles(roles.filter(r => r.id !== roleId));
    toast.success("Role deleted successfully");
  };

  const handlePermissionToggle = (permissionId: string, role: Role, setter: (role: Role) => void) => {
    const updatedPermissions = role.permissions.includes(permissionId)
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    setter({ ...role, permissions: updatedPermissions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage system roles and permission assignments
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterActive?.toString() || "all"} onValueChange={(value) => 
                  setFilterActive(value === "all" ? null : value === "true")
                }>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {role.userCount}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.userCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Permissions</span>
                      <span className="text-muted-foreground">{role.permissions.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permissionId) => {
                        const permission = MOCK_PERMISSIONS.find(p => p.id === permissionId);
                        return permission ? (
                          <Badge key={permissionId} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Updated {new Date(role.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRoles.map((userRole) => (
                  <div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{userRole.userName}</div>
                      <div className="text-sm text-muted-foreground">{userRole.userEmail}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{userRole.roleName}</Badge>
                      <Badge variant={userRole.isActive ? "default" : "secondary"}>
                        {userRole.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold text-lg">{category}</h3>
                    <div className="grid gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Key className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-muted-foreground">{permission.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">ID: {permission.id}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Enter role description"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="role-active"
                  checked={newRole.isActive}
                  onCheckedChange={(checked) => setNewRole({ ...newRole, isActive: checked })}
                />
                <Label htmlFor="role-active">Active Role</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Permissions</h3>
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-sm">{category}</h4>
                  <div className="grid gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`perm-${permission.id}`}
                          checked={newRole.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewRole({
                                ...newRole,
                                permissions: [...newRole.permissions, permission.id]
                              });
                            } else {
                              setNewRole({
                                ...newRole,
                                permissions: newRole.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`perm-${permission.id}`} className="text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role-name">Role Name *</Label>
                  <Input
                    id="edit-role-name"
                    value={selectedRole.name}
                    onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role-description">Description</Label>
                  <Textarea
                    id="edit-role-description"
                    value={selectedRole.description}
                    onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-role-active"
                    checked={selectedRole.isActive}
                    onCheckedChange={(checked) => setSelectedRole({ ...selectedRole, isActive: checked })}
                  />
                  <Label htmlFor="edit-role-active">Active Role</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Permissions</h3>
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-medium text-sm">{category}</h4>
                    <div className="grid gap-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-perm-${permission.id}`}
                            checked={selectedRole.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id, selectedRole, setSelectedRole)}
                          />
                          <Label htmlFor={`edit-perm-${permission.id}`} className="text-sm">
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole}>Update Role</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HaaloRoles;