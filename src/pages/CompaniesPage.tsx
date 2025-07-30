import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CompaniesPage: React.FC = () => {
  const companies = [
    {
      id: 1,
      name: "Luigi's Italian Restaurant",
      status: 'active',
      employees: 45,
      location: 'San Francisco, CA',
      phone: '(415) 555-0123',
      email: 'contact@luigis.com',
      lastActivity: '2024-01-10',
      riskLevel: 'low',
      modules: ['Training', 'Policies', 'Time Tracking']
    },
    {
      id: 2,
      name: 'Tech Innovators Inc',
      status: 'active',
      employees: 234,
      location: 'Austin, TX',
      phone: '(512) 555-0456',
      email: 'hr@techinnovators.com',
      lastActivity: '2024-01-11',
      riskLevel: 'medium',
      modules: ['Training', 'Policies', 'Payroll', 'Benefits']
    },
    {
      id: 3,
      name: 'Green Solutions LLC',
      status: 'pending',
      employees: 12,
      location: 'Portland, OR',
      phone: '(503) 555-0789',
      email: 'info@greensolutions.com',
      lastActivity: '2024-01-09',
      riskLevel: 'high',
      modules: ['Training', 'Policies']
    },
    {
      id: 4,
      name: 'Metro Construction Co',
      status: 'active',
      employees: 89,
      location: 'Denver, CO',
      phone: '(303) 555-0321',
      email: 'admin@metroconstruction.com',
      lastActivity: '2024-01-12',
      riskLevel: 'low',
      modules: ['Training', 'Policies', 'Safety', 'Time Tracking']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <UnifiedLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Companies</h1>
            <p className="text-muted-foreground">Manage your client companies and their settings</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">+2 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.filter(c => c.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">87% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.reduce((sum, c) => sum + c.employees, 0)}</div>
              <p className="text-xs text-muted-foreground">Across all companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.filter(c => c.riskLevel === 'high').length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search companies..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Company Directory</CardTitle>
            <CardDescription>Overview of all managed companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{company.name}</h3>
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                        <AlertCircle className={`h-4 w-4 ${getRiskColor(company.riskLevel)}`} />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {company.employees} employees
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {company.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Last active: {company.lastActivity}
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {company.modules.map((module) => (
                          <Badge key={module} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Company</DropdownMenuItem>
                        <DropdownMenuItem>View Employees</DropdownMenuItem>
                        <DropdownMenuItem>Manage Modules</DropdownMenuItem>
                        <DropdownMenuItem>View Reports</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};

export default CompaniesPage;