import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  Users,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RetroPayRun {
  id: string;
  name: string;
  reason: string;
  status: 'draft' | 'processed' | 'cancelled';
  processDate: string;
  employeeCount: number;
  grossAmount: number;
  netAmount: number;
  createdBy: string;
  createdAt: string;
}

const mockRuns: RetroPayRun[] = [
  {
    id: '1',
    name: 'Q4 2024 Performance Bonuses',
    reason: 'bonus',
    status: 'processed',
    processDate: '2024-01-15',
    employeeCount: 12,
    grossAmount: 15000,
    netAmount: 11250,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10'
  },
  {
    id: '2', 
    name: 'December Overtime Correction',
    reason: 'overtime_adjustment',
    status: 'processed',
    processDate: '2024-01-08',
    employeeCount: 3,
    grossAmount: 2150,
    netAmount: 1612.50,
    createdBy: 'Mike Chen',
    createdAt: '2024-01-05'
  },
  {
    id: '3',
    name: 'Holiday Pay Adjustment',
    reason: 'missed_hours',
    status: 'draft',
    processDate: '',
    employeeCount: 8,
    grossAmount: 3200,
    netAmount: 2400,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-03'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'processed':
      return <Badge variant="default" className="bg-green-100 text-green-800">Processed</Badge>;
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getReasonLabel = (reason: string) => {
  const reasonMap: { [key: string]: string } = {
    'bonus': 'Bonus Payment',
    'missed_hours': 'Missed Hours',
    'correction': 'Payroll Correction',
    'overtime_adjustment': 'Overtime Adjustment',
    'other': 'Other'
  };
  return reasonMap[reason] || reason;
};

export const RetroPayHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');

  const filteredRuns = mockRuns.filter(run => {
    const matchesSearch = run.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || run.reason === reasonFilter;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  const totalProcessed = mockRuns.filter(run => run.status === 'processed').length;
  const totalGrossAmount = mockRuns
    .filter(run => run.status === 'processed')
    .reduce((sum, run) => sum + run.grossAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{mockRuns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Processed Runs</p>
                <p className="text-2xl font-bold">{totalProcessed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${totalGrossAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Off-Cycle Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search runs by name or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="bonus">Bonus Payment</SelectItem>
                <SelectItem value="missed_hours">Missed Hours</SelectItem>
                <SelectItem value="correction">Payroll Correction</SelectItem>
                <SelectItem value="overtime_adjustment">Overtime Adjustment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* History Table */}
          <div className="space-y-4">
            {filteredRuns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No off-cycle runs found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredRuns.map((run) => (
                <Card key={run.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{run.name}</h3>
                          {getStatusBadge(run.status)}
                          <Badge variant="outline" className="text-xs">
                            {getReasonLabel(run.reason)}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{run.employeeCount} employees</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>${run.grossAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{run.processDate || 'Not processed'}</span>
                          </div>
                          <div>
                            Created by {run.createdBy}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download Report
                          </DropdownMenuItem>
                          {run.status === 'draft' && (
                            <>
                              <DropdownMenuItem className="flex items-center gap-2">
                                Edit Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                                Cancel Draft
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};