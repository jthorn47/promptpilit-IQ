
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Key,
  MoreHorizontal,
  Mail
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// Valid roles that exist in the database app_role enum
const VALID_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'learner', label: 'Employee/Learner' },
  { value: 'admin', label: 'Admin' },
  { value: 'client_admin', label: 'Client Admin' }
] as const;

type ValidRole = typeof VALID_ROLES[number]['value'];

interface NewUserForm {
  email: string;
  role: ValidRole;
  companyName: string;
}

export const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: '',
    role: 'learner',
    companyName: 'Test Company'
  });

  // TODO: Replace with actual API call
  const [users] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2025-01-20'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2025-01-19'
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      role: 'Employee',
      status: 'Pending',
      lastLogin: 'Never'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUserForm.email) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(newUserForm.email)) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!newUserForm.role) {
      toast({
        title: "Validation Error",
        description: "Role is required",
        variant: "destructive"
      });
      return;
    }

    // Verify role is valid
    const isValidRole = VALID_ROLES.some(role => role.value === newUserForm.role);
    if (!isValidRole) {
      logger.auth.error('Invalid role attempted', { role: newUserForm.role, validRoles: VALID_ROLES.map(r => r.value) });
      toast({
        title: "Validation Error",
        description: `Invalid role: ${newUserForm.role}. Please select a valid role.`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      logger.auth.info('Creating new test user', { 
        email: newUserForm.email, 
        role: newUserForm.role, 
        companyName: newUserForm.companyName 
      });

      // Call the create_test_account function with proper error handling
      const { data, error } = await supabase.rpc('create_test_account', {
        user_email: newUserForm.email,
        user_password: 'test123', // Standard test password
        user_role: newUserForm.role,
        company_name: newUserForm.companyName
      });

      if (error) {
        logger.auth.error('Supabase RPC error when creating user', error, { 
          userForm: newUserForm,
          errorCode: error.code,
          errorMessage: error.message 
        });
        
        toast({
          title: "Database Error",
          description: `Failed to create user: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Handle the response from the function
      if (data && typeof data === 'object') {
        const response = data as { 
          success?: boolean; 
          user_id?: string; 
          debug_info?: any; 
          error?: string; 
          existing_user?: boolean;
        };
        
        if (response.success) {
          logger.auth.info('User created successfully', { 
            email: newUserForm.email, 
            userId: response.user_id,
            debugInfo: response.debug_info 
          });
          
          toast({
            title: "Success",
            description: `User ${newUserForm.email} created successfully! Password: test123`,
            variant: "default"
          });
          
          // Reset form and close dialog
          setNewUserForm({
            email: '',
            role: 'learner',
            companyName: 'Test Company'
          });
          setIsDialogOpen(false);
        } else {
          logger.auth.error('User creation failed', { 
            error: response.error, 
            userForm: newUserForm,
            debugInfo: response.debug_info 
          });
          
          toast({
            title: "User Creation Failed",
            description: response.error || "Unknown error occurred",
            variant: "destructive"
          });
        }
      } else {
        logger.auth.error('Unexpected response format from create_test_account', { 
          data, 
          userForm: newUserForm 
        });
        
        toast({
          title: "Unexpected Error",
          description: "Received unexpected response from server",
          variant: "destructive"
        });
      }

    } catch (error) {
      logger.auth.error('Exception when creating user', error, { userForm: newUserForm });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Management
        </CardTitle>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new test user account. The password will be set to "test123".
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isCreating}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={newUserForm.role} 
                  onValueChange={(value) => setNewUserForm(prev => ({ ...prev, role: value as ValidRole }))}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Test Company"
                  value={newUserForm.companyName}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, companyName: e.target.value }))}
                  disabled={isCreating}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateUser}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)} variant="secondary">
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Invite
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
