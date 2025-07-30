import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Download,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { PIPForm } from './PIPForm';
import { PIPViewer } from './PIPViewer';

// Mock data for demonstration
const mockPIPs = [
  {
    id: '1',
    employeeName: 'John Smith',
    employeeId: 'EMP001',
    position: 'Outside Sales Representative',
    department: 'Sales',
    supervisor: 'Sarah Johnson',
    hireDate: new Date('2022-03-15'),
    pipStartDate: new Date('2024-01-15'),
    pipEndDate: new Date('2024-04-15'),
    reviewDate: new Date('2024-02-15'),
    performanceIssues: ['Below sales targets', 'Poor prospecting activity', 'Inadequate client follow-up'],
    specificConcerns: 'John has consistently missed his monthly sales targets for the past 3 months. His prospecting activity has been significantly below expectations (averaging 20 calls/week vs. target of 50). Several clients have mentioned lack of follow-up communication.',
    currentSalesPerformance: {
      monthlySales: 45000,
      quarterlyGoal: 180000,
      conversionRate: 12.5,
      prospectingActivity: 20
    },
    improvementGoals: [
      {
        id: '1',
        goal: 'Increase monthly sales to meet target',
        measurable: 'Achieve $60,000 in monthly sales',
        timeline: 'By March 31, 2024',
        resources: 'Sales training program, CRM system access'
      },
      {
        id: '2',
        goal: 'Improve prospecting activity',
        measurable: 'Make minimum 50 calls per week',
        timeline: 'Starting immediately',
        resources: 'Lead generation tools, call scripts'
      }
    ],
    trainingRequired: ['Sales techniques training', 'CRM system training', 'Time management'],
    mentorship: true,
    additionalSupport: 'Weekly one-on-one meetings with supervisor, access to sales coach',
    consequencesOfFailure: 'Failure to meet the goals outlined in this PIP may result in further disciplinary action, up to and including termination of employment.',
    status: 'active' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    employeeName: 'Maria Rodriguez',
    employeeId: 'EMP002',
    position: 'Outside Sales Representative',
    department: 'Sales',
    supervisor: 'Mike Davis',
    hireDate: new Date('2021-08-10'),
    pipStartDate: new Date('2023-11-01'),
    pipEndDate: new Date('2024-01-31'),
    reviewDate: new Date('2023-12-01'),
    performanceIssues: ['Missed appointments', 'Unprofessional communication'],
    specificConcerns: 'Maria has missed several important client appointments without proper notice. Her communication style has been reported as unprofessional by multiple clients.',
    currentSalesPerformance: {
      monthlySales: 55000,
      quarterlyGoal: 180000,
      conversionRate: 18.2,
      prospectingActivity: 45
    },
    improvementGoals: [
      {
        id: '1',
        goal: 'Improve appointment attendance',
        measurable: '100% attendance rate for scheduled appointments',
        timeline: 'Immediate improvement required',
        resources: 'Calendar management training, mobile scheduling app'
      }
    ],
    trainingRequired: ['Communication skills', 'Customer service excellence'],
    mentorship: false,
    additionalSupport: 'Professional development workshops',
    consequencesOfFailure: 'Failure to meet the goals outlined in this PIP may result in further disciplinary action, up to and including termination of employment.',
    status: 'completed' as const,
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-01-31')
  }
];

export const PIPDashboard: React.FC = () => {
  const [pips, setPips] = useState(mockPIPs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPIP, setSelectedPIP] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPIP, setEditingPIP] = useState<any>(null);

  const filteredPIPs = pips.filter(pip => {
    const matchesSearch = pip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pip.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'extended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'extended':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreatePIP = (data: any) => {
    const newPIP = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPips([...pips, newPIP]);
    setShowForm(false);
  };

  const handleUpdatePIP = (data: any) => {
    setPips(pips.map(pip => 
      pip.id === editingPIP.id 
        ? { ...data, id: editingPIP.id, createdAt: editingPIP.createdAt, updatedAt: new Date() }
        : pip
    ));
    setEditingPIP(null);
    setShowForm(false);
  };

  const handleEditPIP = (pip: any) => {
    setEditingPIP(pip);
    setShowForm(true);
  };

  const handleViewPIP = (pip: any) => {
    setSelectedPIP(pip);
  };

  const handleDownloadPIP = (pip: any) => {
    // In a real application, this would generate and download a PDF
    console.log('Downloading PIP for:', pip.employeeName);
  };

  const stats = {
    total: pips.length,
    active: pips.filter(p => p.status === 'active').length,
    completed: pips.filter(p => p.status === 'completed').length,
    draft: pips.length - pips.filter(p => p.status === 'active').length - pips.filter(p => p.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Improvement Plans</h1>
          <p className="text-muted-foreground">Manage employee performance improvement plans</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New PIP
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total PIPs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active PIPs</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft PIPs</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIPs List */}
      <div className="grid gap-4">
        {filteredPIPs.map((pip) => (
          <Card key={pip.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{pip.employeeName}</h3>
                    <Badge className={getStatusColor(pip.status)}>
                      {getStatusIcon(pip.status)}
                      <span className="ml-1">{pip.status.charAt(0).toUpperCase() + pip.status.slice(1)}</span>
                    </Badge>
                    {pip.status === 'active' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getDaysRemaining(pip.pipEndDate)} days left
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{pip.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Supervisor</p>
                      <p className="font-medium">{pip.supervisor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PIP Period</p>
                      <p className="font-medium">
                        {format(pip.pipStartDate, 'MMM dd')} - {format(pip.pipEndDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pip.performanceIssues.slice(0, 3).map((issue, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                    {pip.performanceIssues.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pip.performanceIssues.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Monthly Sales: ${pip.currentSalesPerformance.monthlySales.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{pip.improvementGoals.length} improvement goals</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPIP(pip)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPIP(pip)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPIP(pip)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPIPs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No PIPs Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No PIPs match your current filters.' 
                  : 'No Performance Improvement Plans have been created yet.'}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First PIP
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit PIP Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPIP ? 'Edit Performance Improvement Plan' : 'Create New Performance Improvement Plan'}
            </DialogTitle>
          </DialogHeader>
          <PIPForm
            onSubmit={editingPIP ? handleUpdatePIP : handleCreatePIP}
            initialData={editingPIP}
            isEditing={!!editingPIP}
          />
        </DialogContent>
      </Dialog>

      {/* View PIP Dialog */}
      <Dialog open={!!selectedPIP} onOpenChange={() => setSelectedPIP(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Performance Improvement Plan</DialogTitle>
          </DialogHeader>
          {selectedPIP && (
            <PIPViewer
              pipData={selectedPIP}
              onEdit={() => {
                setSelectedPIP(null);
                handleEditPIP(selectedPIP);
              }}
              onDownload={() => handleDownloadPIP(selectedPIP)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};