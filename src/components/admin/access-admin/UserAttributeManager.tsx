import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit, Save, X, Plus, Trash2 } from 'lucide-react';

interface UserAttribute {
  id: string;
  userId: string;
  userEmail: string;
  attributes: Record<string, any>;
}

export const UserAttributeManager: React.FC = () => {
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserAttribute | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const [users] = useState<UserAttribute[]>([
    {
      id: '1',
      userId: 'user-123',
      userEmail: 'admin@easeworks.com',
      attributes: {
        department: 'engineering',
        job_title: 'Senior Developer',
        is_manager: true,
        assigned_modules: ['vault', 'pulse', 'crm'],
        security_clearance: 4
      }
    },
    {
      id: '2',
      userId: 'user-456',
      userEmail: 'manager@client.com',
      attributes: {
        department: 'hr',
        job_title: 'HR Manager',
        is_manager: true,
        assigned_modules: ['hr', 'training'],
        security_clearance: 2
      }
    }
  ]);

  const handleSelectUser = (user: UserAttribute) => {
    setSelectedUser(user);
    setIsEditing(false);
  };

  const AttributeEditor: React.FC<{ user: UserAttribute }> = ({ user }) => {
    const [formData, setFormData] = useState(user.attributes);

    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Edit User Attributes</CardTitle>
          <CardDescription>
            Modify attributes for {user.userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_manager"
                checked={formData.is_manager || false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_manager: e.target.checked }))}
              />
              <Label htmlFor="is_manager">Is Manager</Label>
            </div>
            <div>
              <Label htmlFor="security_clearance">Security Clearance</Label>
              <Select 
                value={formData.security_clearance?.toString() || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, security_clearance: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="4">Level 4</SelectItem>
                  <SelectItem value="5">Level 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Assigned Modules</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['vault', 'pulse', 'crm', 'payroll', 'hr', 'training'].map((module) => (
                <div key={module} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`module-${module}`}
                    checked={formData.assigned_modules?.includes(module) || false}
                    onChange={(e) => {
                      const modules = formData.assigned_modules || [];
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          assigned_modules: [...modules, module] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          assigned_modules: modules.filter(m => m !== module) 
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
            <Button onClick={() => {
              // Save attributes
              setIsEditing(false);
            }}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">User Attribute Manager</h2>
        <p className="text-muted-foreground">
          Manage user-specific attributes for context-aware permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Search */}
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
            <CardDescription>Search and select a user to manage their attributes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-search">Search by email</Label>
              <div className="flex gap-2">
                <Input
                  id="user-search"
                  placeholder="Enter user email"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Users</Label>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-3 border rounded cursor-pointer hover:bg-muted"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="font-medium">{user.userEmail}</div>
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(user.attributes).length} attributes
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Attributes Display */}
        {selectedUser && !isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Current Attributes
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardTitle>
              <CardDescription>{selectedUser.userEmail}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(selectedUser.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="font-medium">{key.replace('_', ' ')}</span>
                  <div>
                    {Array.isArray(value) ? (
                      <div className="flex gap-1">
                        {value.map((item, index) => (
                          <Badge key={index} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    ) : typeof value === 'boolean' ? (
                      <Badge variant={value ? 'default' : 'secondary'}>
                        {value ? 'Yes' : 'No'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{value}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Attribute Editor */}
      {selectedUser && isEditing && <AttributeEditor user={selectedUser} />}
    </div>
  );
};