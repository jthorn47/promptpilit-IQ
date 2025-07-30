import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Eye, 
  Building2,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'standard' | 'viewer';
export type Department = 'hr' | 'finance' | 'operations' | 'sales' | 'it' | 'legal';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  lastActive: string;
  signaturePermission: 'edit' | 'view' | 'none';
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@company.com',
    role: 'admin',
    department: 'hr',
    lastActive: '2024-01-15',
    signaturePermission: 'edit'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'standard',
    department: 'finance',
    lastActive: '2024-01-14',
    signaturePermission: 'view'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@company.com',
    role: 'viewer',
    department: 'operations',
    lastActive: '2024-01-13',
    signaturePermission: 'none'
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily@company.com',
    role: 'standard',
    department: 'sales',
    lastActive: '2024-01-12',
    signaturePermission: 'edit'
  }
];

const departments: { value: Department; label: string }[] = [
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
  { value: 'it', label: 'IT' },
  { value: 'legal', label: 'Legal' }
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
    toast.success('User updated successfully');
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'lastActive'>) => {
    const user: User = {
      ...newUser,
      id: Date.now().toString(),
      lastActive: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, user]);
    setShowAddUser(false);
    toast.success('User added successfully');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'standard': return <Users className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: Department) => {
    const colors = {
      hr: 'bg-purple-100 text-purple-800',
      finance: 'bg-green-100 text-green-800',
      operations: 'bg-orange-100 text-orange-800',
      sales: 'bg-pink-100 text-pink-800',
      it: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-yellow-100 text-yellow-800'
    };
    return colors[department];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles, departments, and signature permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Label htmlFor="department">Department</Label>
            <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value as Department | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <AddUserForm onSubmit={handleAddUser} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Signature Permission</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getRoleColor(user.role)}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getDepartmentColor(user.department)}>
                      <Building2 className="w-3 h-3 mr-1" />
                      {departments.find(d => d.value === user.department)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.signaturePermission === 'edit' ? 'default' : 'secondary'}>
                      {user.signaturePermission === 'edit' ? 'Edit' : 
                       user.signaturePermission === 'view' ? 'View' : 'None'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User: {user.name}</DialogTitle>
                        </DialogHeader>
                        <EditUserForm 
                          user={user} 
                          onSubmit={(updates) => handleUpdateUser(user.id, updates)} 
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AddUserForm({ onSubmit }: { onSubmit: (user: Omit<User, 'id' | 'lastActive'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'standard' as UserRole,
    department: 'hr' as Department,
    signaturePermission: 'view' as 'edit' | 'view' | 'none'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      email: '',
      role: 'standard',
      department: 'hr',
      signaturePermission: 'view'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value as Department }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="signaturePermission">Signature Permission</Label>
        <Select value={formData.signaturePermission} onValueChange={(value) => setFormData(prev => ({ ...prev, signaturePermission: value as 'edit' | 'view' | 'none' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edit">Edit</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Add User</Button>
    </form>
  );
}

function EditUserForm({ user, onSubmit }: { user: User; onSubmit: (updates: Partial<User>) => void }) {
  const [formData, setFormData] = useState({
    role: user.role,
    department: user.department,
    signaturePermission: user.signaturePermission
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value as Department }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="signaturePermission">Signature Permission</Label>
        <Select value={formData.signaturePermission} onValueChange={(value) => setFormData(prev => ({ ...prev, signaturePermission: value as 'edit' | 'view' | 'none' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edit">Edit</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Update User</Button>
    </form>
  );
}