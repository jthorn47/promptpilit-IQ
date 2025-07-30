import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Shield,
  Eye,
  Edit,
  UserPlus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'support' | 'compliance' | 'finance' | 'exec' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  companiesAccess: number;
  haloTraining: boolean;
  twoFAEnabled: boolean;
  createdDate: string;
  permissions: string[];
}

export const UserPermissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Mock admin user data
  const adminUsers: AdminUser[] = [
    {
      id: 'user_001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@haloworks.com',
      role: 'super_admin',
      status: 'active',
      lastLogin: '2024-01-16 10:30',
      companiesAccess: 247,
      haloTraining: true,
      twoFAEnabled: true,
      createdDate: '2023-01-15',
      permissions: ['all_access', 'user_management', 'system_config']
    },
    {
      id: 'user_002',
      name: 'Mike Chen',
      email: 'mike.chen@haloworks.com',
      role: 'finance',
      status: 'active',
      lastLogin: '2024-01-16 09:15',
      companiesAccess: 125,
      haloTraining: true,
      twoFAEnabled: true,
      createdDate: '2023-03-22',
      permissions: ['funding_management', 'tax_filing', 'financial_reports']
    },
    {
      id: 'user_003',
      name: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@haloworks.com',
      role: 'compliance',
      status: 'active',
      lastLogin: '2024-01-15 16:45',
      companiesAccess: 89,
      haloTraining: true,
      twoFAEnabled: false,
      createdDate: '2023-06-10',
      permissions: ['compliance_review', 'alert_management', 'audit_access']
    },
    {
      id: 'user_004',
      name: 'David Kim',
      email: 'david.kim@haloworks.com',
      role: 'support',
      status: 'active',
      lastLogin: '2024-01-16 08:00',
      companiesAccess: 45,
      haloTraining: false,
      twoFAEnabled: true,
      createdDate: '2023-11-03',
      permissions: ['client_support', 'basic_reports', 'ticket_management']
    },
    {
      id: 'user_005',
      name: 'Emma Thompson',
      email: 'emma.thompson@haloworks.com',
      role: 'exec',
      status: 'active',
      lastLogin: '2024-01-15 14:20',
      companiesAccess: 247,
      haloTraining: true,
      twoFAEnabled: true,
      createdDate: '2022-08-15',
      permissions: ['executive_dashboard', 'all_reports', 'strategic_oversight']
    }
  ];

  const getRoleBadge = (role: AdminUser['role']) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      exec: 'bg-purple-100 text-purple-800',
      finance: 'bg-green-100 text-green-800',
      compliance: 'bg-blue-100 text-blue-800',
      support: 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={colors[role]}>{role.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate summary stats
  const totalUsers = adminUsers.length;
  const activeUsers = adminUsers.filter(u => u.status === 'active').length;
  const usersWithoutHALO = adminUsers.filter(u => !u.haloTraining).length;
  const usersWithout2FA = adminUsers.filter(u => !u.twoFAEnabled).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Admin Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missing HALO Training</p>
                <p className="text-2xl font-bold text-yellow-600">{usersWithoutHALO}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No 2FA</p>
                <p className="text-2xl font-bold text-red-600">{usersWithout2FA}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Role: {roleFilter === 'all' ? 'All' : roleFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setRoleFilter('all')}>All Roles</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('super_admin')}>Super Admin</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('exec')}>Executive</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('finance')}>Finance</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('compliance')}>Compliance</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('support')}>Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin User Management ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Company Access</TableHead>
                <TableHead>HALO Training</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{user.companiesAccess}</span>
                      <span className="text-xs text-muted-foreground">companies</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={user.haloTraining} disabled />
                      {user.haloTraining ? (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={user.twoFAEnabled} disabled />
                      {user.twoFAEnabled ? (
                        <Shield className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{user.lastLogin}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Assign Companies
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Manage 2FA
                        </DropdownMenuItem>
                        {!user.haloTraining && (
                          <DropdownMenuItem>
                            Enroll in HALO Training
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          View Login History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Suspend User
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

      {/* Role Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Role Templates & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Support Role</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Client support tickets</li>
                <li>• Basic reports access</li>
                <li>• Limited company scope</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Compliance Role</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Alert management</li>
                <li>• Audit trail access</li>
                <li>• Compliance reviews</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Finance Role</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Funding management</li>
                <li>• Tax filing access</li>
                <li>• Financial reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};