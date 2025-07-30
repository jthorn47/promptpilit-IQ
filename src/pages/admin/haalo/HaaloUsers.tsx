import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck,
  UserX,
  Shield,
  Eye,
  Settings
} from "lucide-react";

const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@acme.com",
    company: "Acme Corporation",
    role: "Company Admin",
    status: "active",
    lastLogin: "2024-01-18",
    avatar: null
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@techstart.com",
    company: "TechStart Inc.",
    role: "Employee",
    status: "active",
    lastLogin: "2024-01-17",
    avatar: null
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "m.chen@global.com",
    company: "Global Industries",
    role: "HR Manager",
    status: "inactive",
    lastLogin: "2024-01-10",
    avatar: null
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@localbiz.com",
    company: "Local Business Co.",
    role: "Owner",
    status: "pending",
    lastLogin: "Never",
    avatar: null
  }
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'inactive':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getRoleIcon = (role: string) => {
  if (role.includes('Admin') || role.includes('Owner')) {
    return <Shield className="h-4 w-4 text-blue-500" />;
  }
  return <Users className="h-4 w-4 text-gray-500" />;
};

export const HaaloUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions across all companies
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
                <p className="text-2xl font-bold">12,847</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">11,542</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">523</p>
              </div>
              <Settings className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600">782</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{user.company}</span>
                      <span>{user.role}</span>
                      <span>Last login: {user.lastLogin}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={getStatusBadgeVariant(user.status) as any}>
                    {user.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HaaloUsers;