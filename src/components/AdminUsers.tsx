import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, Shield, Mail, Calendar, Plus, Building, GraduationCap, UserCog, Edit, Trash2, MoreHorizontal, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import { sanitizeText, isValidEmail } from "@/utils/security";
import { usePermissionContext } from "@/contexts/PermissionContext";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  role: string;
  company_id: string | null;
}

interface ProfileWithRoles extends Profile {
  user_roles: UserRole[];
}

export const AdminUsers = () => {
  const { token: csrfToken } = useCSRFToken();
  const { canManageUsers, loading: permLoading } = usePermissionContext();
  const [profiles, setProfiles] = useState<ProfileWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    recentSignups: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<ProfileWithRoles | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ProfileWithRoles | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<ProfileWithRoles | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "super_admin" as "super_admin" | "company_admin" | "learner" | "admin",
    companyId: "",
  });
  const [editUser, setEditUser] = useState({
    email: "",
    role: "learner" as "super_admin" | "company_admin" | "learner" | "admin",
    companyId: "",
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('id, company_name')
        .order('company_name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Then get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) {
        throw rolesError;
      }

      // Combine data
      const profilesWithRoles = (profilesData || []).map(profile => ({
        ...profile,
        user_roles: (rolesData || []).filter(role => role.user_id === profile.user_id)
      }));

      setProfiles(profilesWithRoles);
      
      // Calculate stats
      const total = profilesWithRoles?.length || 0;
      const admins = profilesWithRoles?.filter(profile => 
        profile.user_roles?.some(role => role.role === 'super_admin' || role.role === 'company_admin')
      ).length || 0;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentSignups = profilesWithRoles?.filter(profile => 
        new Date(profile.created_at) > oneWeekAgo
      ).length || 0;

      setStats({ total, admins, recentSignups });
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    // Validate and sanitize inputs
    const sanitizedEmail = sanitizeText(newUser.email);
    const sanitizedPassword = sanitizeText(newUser.password);
    
    if (!sanitizedEmail || !sanitizedPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      // For super admin users, use database function to avoid rate limits
      if (newUser.role === 'super_admin') {
        const { data, error } = await supabase.rpc('create_super_admin_user', {
          user_email: sanitizedEmail,
          user_password: sanitizedPassword
        });

        if (error) throw error;

        const result = data as { success: boolean; error?: string; message?: string };
        
        if (result?.success) {
          toast({
            title: "Success",
            description: "Super admin user created successfully (no email confirmation required)",
          });
        } else {
          throw new Error(result?.error || 'Failed to create super admin user');
        }
      } else {
        // For other roles, use normal signup with email confirmation
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: sanitizedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { 
              csrf_token: csrfToken,
              role: newUser.role 
            }
          }
        });

        if (error) {
          throw error;
        }

        // Create role for the new user
        if (data.user) {
          const roleData: any = {
            user_id: data.user.id,
            role: newUser.role
          };

          // Add company_id if role requires it and company is selected
          if ((newUser.role === 'company_admin' || newUser.role === 'learner') && newUser.companyId) {
            roleData.company_id = newUser.companyId;
          }

          const { error: roleError } = await supabase
            .from('user_roles')
            .insert(roleData);

          if (roleError) {
            console.error('Error creating user role:', roleError);
          }
        }

        toast({
          title: "Success",
          description: "User created successfully - they will need to confirm their email",
        });
      }

      setIsDialogOpen(false);
      setNewUser({ email: "", password: "", role: "super_admin", companyId: "" });
      fetchProfiles(); // Refresh the list
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Handle specific email rate limit error
      if (error.message?.includes('email rate limit exceeded')) {
        toast({
          title: "Email Rate Limit",
          description: "Supabase email rate limit exceeded. Try again in a few minutes or create super admin users instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create user",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (user: ProfileWithRoles) => {
    setEditingUser(user);
    setEditUser({
      email: user.email,
      role: user.user_roles[0]?.role as any || "learner",
      companyId: user.user_roles[0]?.company_id || "",
    });
    setIsEditDialogOpen(true);
  };

  const updateUser = async () => {
    if (!editingUser) return;

    const sanitizedEmail = sanitizeText(editUser.email);
    
    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      // Update profile email
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: sanitizedEmail })
        .eq('user_id', editingUser.user_id);

      if (profileError) throw profileError;

      // Update user roles
      // First, delete existing roles for this user
      const { error: deleteRoleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.user_id);

      if (deleteRoleError) throw deleteRoleError;

      // Then create new role
      const roleData: any = {
        user_id: editingUser.user_id,
        role: editUser.role
      };

      if ((editUser.role === 'company_admin' || editUser.role === 'learner') && editUser.companyId) {
        roleData.company_id = editUser.companyId;
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (roleError) throw roleError;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchProfiles();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openDeleteDialog = (user: ProfileWithRoles) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const openResetPasswordDialog = (user: ProfileWithRoles) => {
    setUserToResetPassword(user);
    setNewPassword("");
    setIsResetPasswordDialogOpen(true);
  };

  const resetUserPassword = async () => {
    if (!userToResetPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResettingPassword(true);

      const { data, error } = await supabase.rpc('admin_reset_user_password', {
        target_user_id: userToResetPassword.user_id,
        new_password: newPassword
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result?.success) {
        toast({
          title: "Success",
          description: `Password reset successfully for ${userToResetPassword.email}`,
        });
        setIsResetPasswordDialogOpen(false);
        setUserToResetPassword(null);
        setNewPassword("");
      } else {
        throw new Error(result?.error || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Use the database function to completely delete the user
      const { data, error } = await supabase.rpc('delete_user_completely', {
        target_user_id: userToDelete.user_id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result?.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchProfiles();
      } else {
        throw new Error(result?.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Check permission before rendering
  if (permLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <div className="text-center py-8">Loading permissions...</div>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <div className="text-center py-8">
          <p>You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeVariant = (roles: UserRole[]) => {
    const hasRole = (role: string) => roles.some(r => r.role === role);
    
    if (hasRole('super_admin')) return 'default';
    if (hasRole('company_admin')) return 'secondary';
    if (hasRole('learner')) return 'outline';
    return 'outline';
  };

  const getRoleDisplayText = (roles: UserRole[]) => {
    const roleNames = roles.map(role => {
      switch(role.role) {
        case 'super_admin': return 'Super Admin';
        case 'company_admin': return 'Company Admin';
        case 'learner': return 'Learner';
        case 'admin': return 'Admin';
        default: return role.role;
      }
    });
    return roleNames.join(', ') || 'No roles';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <div className="text-center py-8">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. They will receive an email confirmation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as any, companyId: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Super Admin</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="company_admin">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Company Admin</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="learner">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>Learner</span>
                        </div>
                      </SelectItem>
                  <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <UserCog className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newUser.role === 'company_admin' || newUser.role === 'learner') && (
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Select value={newUser.companyId} onValueChange={(value) => setNewUser({ ...newUser, companyId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createUser} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentSignups}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(profile.user_roles)}>
                      {getRoleDisplayText(profile.user_roles)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(profile.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(profile)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetPasswordDialog(profile)}>
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(profile)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and roles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value as any, companyId: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Super Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="company_admin">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Company Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="learner">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Learner</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <UserCog className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(editUser.role === 'company_admin' || editUser.role === 'learner') && (
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Select value={editUser.companyId} onValueChange={(value) => setEditUser({ ...editUser, companyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateUser} disabled={isCreating}>
              {isCreating ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{userToResetPassword?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (minimum 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                The user will be able to sign in immediately with this new password.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={resetUserPassword} disabled={isResettingPassword}>
              {isResettingPassword ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for <strong>{userToDelete?.email}</strong> and remove all associated data.
              {userToDelete?.user_roles.some(role => role.role === 'super_admin') && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                  ⚠️ Warning: You are about to delete a Super Admin user!
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};