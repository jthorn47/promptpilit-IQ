import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Trash2, Shield, UserCheck, UserX, Users, Plus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  profiles: {
    email: string;
    company_id: string | null;
  } | null;
  user_roles: Array<{
    role: string;
    company_id: string | null;
  }>;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('learner');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, company_id');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, company_id');

      if (rolesError) throw rolesError;

      // Try to get auth users data (this might fail in client-side code)
      let authUsers: any[] = [];
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        if (!authError && authData) {
          authUsers = authData.users;
        }
      } catch (authError) {
        console.warn('Could not fetch auth users data:', authError);
      }

      // Combine the data
      const combinedUsers: User[] = (profiles || []).map(profile => {
        const userRolesList = (userRoles || []).filter(role => role.user_id === profile.user_id);
        const authUser = authUsers.find(u => u.id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: profile.email,
          created_at: authUser?.created_at || new Date().toISOString(),
          last_sign_in_at: authUser?.last_sign_in_at || null,
          email_confirmed_at: authUser?.email_confirmed_at || null,
          profiles: {
            email: profile.email,
            company_id: profile.company_id
          },
          user_roles: userRolesList.map(role => ({
            role: role.role,
            company_id: role.company_id
          }))
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    try {
      setDeleting(userId);
      
      // Call the delete function
      const { data, error } = await supabase.rpc('delete_user_completely', {
        target_user_id: userId
      });

      if (error) throw error;

      // Type the response as the function returns JSON
      const result = data as { success: boolean; error?: string; message?: string };

      if (result?.success) {
        toast({
          title: "Success",
          description: `User ${email} has been deleted completely`,
        });
        await fetchUsers(); // Refresh the list
      } else {
        throw new Error(result?.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);

      // Use our database function that properly handles password hashing
      const { data, error } = await supabase.rpc('create_test_account', {
        user_email: newUserEmail,
        user_password: newUserPassword,
        user_role: newUserRole as 'learner' | 'admin' | 'client_admin' | 'super_admin' | 'company_admin',
        company_name: null
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string; existing_user?: boolean };
      if (!result?.success) {
        if (result?.existing_user) {
          throw new Error('An account with this email already exists. Please use a different email address.');
        }
        throw new Error(result?.error || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: `User ${newUserEmail} has been created successfully`,
      });

      // Reset form and close dialog
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('learner');
      setAddUserDialogOpen(false);
      
      // Refresh the user list
      await fetchUsers();

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_roles.some(role => role.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'company_admin':
        return 'default';
      case 'client_admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions across the system
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with the specified role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="client_admin">Client Admin</SelectItem>
                      <SelectItem value="company_admin">Company Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setAddUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createUser}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={fetchUsers}>
            <Users className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.user_roles.some(r => r.role === 'super_admin')).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company Admins</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.user_roles.some(r => r.role === 'company_admin')).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.email_confirmed_at).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {user.email.split('@')[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.email}</h3>
                      {!user.email_confirmed_at && (
                        <Badge variant="outline" className="text-orange-600">
                          Unconfirmed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Roles:</span>
                      {user.user_roles.map((role, index) => (
                        <Badge key={index} variant={getRoleColor(role.role) as any}>
                          {role.role}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                      {user.last_sign_in_at && (
                        <span className="ml-4">
                          Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={deleting === user.id}
                      >
                        {deleting === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete the user "{user.email}"? 
                          This will remove all their data including profile, roles, and authentication records. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUser(user.id, user.email)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};