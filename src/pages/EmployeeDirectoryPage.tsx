import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  Settings,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const EmployeeDirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const departments = [
    { name: 'Engineering', count: 45, color: 'bg-blue-500' },
    { name: 'Marketing', count: 23, color: 'bg-green-500' },
    { name: 'Sales', count: 31, color: 'bg-purple-500' },
    { name: 'HR', count: 12, color: 'bg-orange-500' },
    { name: 'Finance', count: 18, color: 'bg-red-500' },
    { name: 'Operations', count: 27, color: 'bg-indigo-500' }
  ];

  const employees = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7b64b83?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Marketing Director',
      department: 'Marketing',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'Sales Manager',
      department: 'Sales',
      email: 'emily.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'David Kumar',
      title: 'Product Manager',
      department: 'Engineering',
      email: 'david.kumar@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      title: 'HR Business Partner',
      department: 'HR',
      email: 'lisa.thompson@company.com',
      phone: '+1 (555) 567-8901',
      location: 'Chicago, IL',
      status: 'On Leave',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 6,
      name: 'Robert Wilson',
      title: 'Financial Analyst',
      department: 'Finance',
      email: 'robert.wilson@company.com',
      phone: '+1 (555) 678-9012',
      location: 'Boston, MA',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face'
    }
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-4 px-4 space-y-6 max-w-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage and view all company employees
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-green-600">+12 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">91% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Hires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-green-600">This quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees by name, title, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Departments Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>Employee distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departments.map((dept) => (
              <div key={dept.name} className="text-center">
                <div className={`w-16 h-16 mx-auto ${dept.color} rounded-full flex items-center justify-center text-white mb-2`}>
                  <Building2 className="h-6 w-6" />
                </div>
                <p className="font-medium">{dept.name}</p>
                <p className="text-sm text-muted-foreground">{dept.count} employees</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>
                {filteredEmployees.length} of {employees.length} employees
              </CardDescription>
            </div>
            <Button variant="outline">
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{employee.name}</h3>
                      <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{employee.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {employee.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {employee.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Plus className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Add Employee</CardTitle>
            <CardDescription>Add a new employee to the directory</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Add New Employee
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Bulk Import</CardTitle>
            <CardDescription>Import multiple employees from CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Import CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Settings className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Directory Settings</CardTitle>
            <CardDescription>Configure directory display options</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDirectoryPage;