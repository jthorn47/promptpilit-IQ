import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Building2, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProposalsPage: React.FC = () => {
  const proposals = [
    {
      id: 1,
      title: "Annual HR Services - Luigi's Italian Restaurant",
      company: "Luigi's Italian Restaurant",
      value: 45000,
      status: 'pending',
      createdDate: '2024-01-08',
      dueDate: '2024-01-20',
      stage: 'review',
      assignedTo: 'Sarah Johnson',
      modules: ['Training', 'Policies', 'Time Tracking'],
      progress: 75
    },
    {
      id: 2,
      title: 'Comprehensive HR Package - Tech Innovators Inc',
      company: 'Tech Innovators Inc',
      value: 125000,
      status: 'approved',
      createdDate: '2024-01-05',
      dueDate: '2024-01-15',
      stage: 'signed',
      assignedTo: 'Mike Chen',
      modules: ['Training', 'Policies', 'Payroll', 'Benefits'],
      progress: 100
    },
    {
      id: 3,
      title: 'Basic Training Package - Green Solutions LLC',
      company: 'Green Solutions LLC',
      value: 15000,
      status: 'draft',
      createdDate: '2024-01-10',
      dueDate: '2024-01-25',
      stage: 'preparation',
      assignedTo: 'Lisa Rodriguez',
      modules: ['Training', 'Policies'],
      progress: 30
    },
    {
      id: 4,
      title: 'Safety & Compliance - Metro Construction Co',
      company: 'Metro Construction Co',
      value: 75000,
      status: 'pending',
      createdDate: '2024-01-06',
      dueDate: '2024-01-18',
      stage: 'negotiation',
      assignedTo: 'David Kim',
      modules: ['Training', 'Policies', 'Safety', 'Time Tracking'],
      progress: 60
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'review':
      case 'negotiation': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalValue = proposals.reduce((sum, p) => sum + p.value, 0);
  const approvedValue = proposals.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.value, 0);

  return (
    <UnifiedLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Proposals</h1>
            <p className="text-muted-foreground">Manage client proposals and contracts</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposals.length}</div>
              <p className="text-xs text-muted-foreground">Active pipeline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Combined proposal value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${approvedValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{Math.round((approvedValue / totalValue) * 100)}% conversion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposals.filter(p => p.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search proposals..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Proposals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Proposal Pipeline</CardTitle>
            <CardDescription>Track all client proposals and their progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getStageIcon(proposal.stage)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{proposal.title}</h3>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-2">
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {proposal.company}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${proposal.value.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {proposal.dueDate}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {proposal.modules.map((module) => (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Progress: {proposal.progress}%
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${proposal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
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
                        <DropdownMenuItem>Edit Proposal</DropdownMenuItem>
                        <DropdownMenuItem>Send to Client</DropdownMenuItem>
                        <DropdownMenuItem>Clone Proposal</DropdownMenuItem>
                        <DropdownMenuItem>Generate PDF</DropdownMenuItem>
                        <DropdownMenuItem>View History</DropdownMenuItem>
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

export default ProposalsPage;