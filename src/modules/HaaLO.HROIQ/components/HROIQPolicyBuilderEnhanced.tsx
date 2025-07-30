import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Eye, 
  Users, 
  History, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Archive,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Policy {
  id: string;
  title: string;
  body: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  acceptance_required: boolean;
  assigned_to: string[];
  created_at: string;
  updated_at: string;
  last_updated_by: string;
}

interface PolicyAssignment {
  id: string;
  policy_id: string;
  employee_id: string;
  acceptance_status: 'pending' | 'accepted' | 'declined';
  assigned_at: string;
  accepted_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const HROIQPolicyBuilder: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State management
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<PolicyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPolicyViewer, setShowPolicyViewer] = useState(false);

  // Form state for creating/editing policies
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    acceptance_required: true,
    status: 'draft' as 'draft' | 'published'
  });

  // Assignment state
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Demo company ID - in production this would come from context
  const companyId = 'demo-company-123';

  // Load data on component mount
  useEffect(() => {
    loadPolicies();
    loadEmployees();
  }, []);

  const loadPolicies = async () => {
    try {
      // For demo purposes, we'll create mock data since the actual Supabase queries
      // would require proper authentication and company setup
      const mockPolicies: Policy[] = [
        {
          id: '1',
          title: 'Employee Handbook',
          body: 'This comprehensive handbook outlines all company policies, procedures, and expectations for employees.',
          version: 2,
          status: 'published',
          acceptance_required: true,
          assigned_to: ['emp1', 'emp2', 'emp3'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
          last_updated_by: user?.id || 'admin'
        },
        {
          id: '2',
          title: 'Code of Conduct',
          body: 'All employees must adhere to our code of conduct which includes professional behavior, respect for colleagues, and ethical business practices.',
          version: 1,
          status: 'published',
          acceptance_required: true,
          assigned_to: ['emp1', 'emp2'],
          created_at: '2024-01-10T09:00:00Z',
          updated_at: '2024-01-10T09:00:00Z',
          last_updated_by: user?.id || 'admin'
        },
        {
          id: '3',
          title: 'Remote Work Policy',
          body: 'Guidelines and expectations for employees working remotely, including communication protocols and equipment responsibilities.',
          version: 1,
          status: 'draft',
          acceptance_required: false,
          assigned_to: [],
          created_at: '2024-01-25T16:00:00Z',
          updated_at: '2024-01-25T16:00:00Z',
          last_updated_by: user?.id || 'admin'
        }
      ];
      
      setPolicies(mockPolicies);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load policies',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // Mock employee data
      const mockEmployees: Employee[] = [
        { id: 'emp1', first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com' },
        { id: 'emp2', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@company.com' },
        { id: 'emp3', first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com' },
        { id: 'emp4', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@company.com' }
      ];
      
      setEmployees(mockEmployees);
      
      // Mock assignment data
      const mockAssignments: PolicyAssignment[] = [
        {
          id: 'assign1',
          policy_id: '1',
          employee_id: 'emp1',
          acceptance_status: 'accepted',
          assigned_at: '2024-01-20T14:30:00Z',
          accepted_at: '2024-01-21T09:15:00Z',
          employee: { first_name: 'John', last_name: 'Doe' }
        },
        {
          id: 'assign2',
          policy_id: '1',
          employee_id: 'emp2',
          acceptance_status: 'pending',
          assigned_at: '2024-01-20T14:30:00Z',
          employee: { first_name: 'Jane', last_name: 'Smith' }
        },
        {
          id: 'assign3',
          policy_id: '2',
          employee_id: 'emp1',
          acceptance_status: 'accepted',
          assigned_at: '2024-01-15T10:00:00Z',
          accepted_at: '2024-01-16T11:30:00Z',
          employee: { first_name: 'John', last_name: 'Doe' }
        }
      ];
      
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleCreatePolicy = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const newPolicy: Policy = {
        id: `policy_${Date.now()}`,
        title: formData.title,
        body: formData.body,
        version: 1,
        status: formData.status,
        acceptance_required: formData.acceptance_required,
        assigned_to: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_updated_by: user?.id || 'admin'
      };

      setPolicies(prev => [...prev, newPolicy]);
      setShowCreateDialog(false);
      setFormData({ title: '', body: '', acceptance_required: true, status: 'draft' });
      
      toast({
        title: 'Success',
        description: 'Policy created successfully'
      });
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create policy',
        variant: 'destructive'
      });
    }
  };

  const handleAssignPolicy = async () => {
    if (!selectedPolicy || selectedEmployees.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select employees to assign',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Update policy assigned_to array
      setPolicies(prev => 
        prev.map(p => 
          p.id === selectedPolicy.id 
            ? { ...p, assigned_to: [...new Set([...p.assigned_to, ...selectedEmployees])] }
            : p
        )
      );

      // Create new assignments
      const newAssignments = selectedEmployees.map(empId => {
        const employee = employees.find(e => e.id === empId);
        return {
          id: `assign_${Date.now()}_${empId}`,
          policy_id: selectedPolicy.id,
          employee_id: empId,
          acceptance_status: 'pending' as const,
          assigned_at: new Date().toISOString(),
          employee: employee ? { first_name: employee.first_name, last_name: employee.last_name } : undefined
        };
      });

      setAssignments(prev => [...prev, ...newAssignments]);
      setShowAssignDialog(false);
      setSelectedEmployees([]);
      
      toast({
        title: 'Success',
        description: `Policy assigned to ${selectedEmployees.length} employee(s)`
      });
    } catch (error) {
      console.error('Error assigning policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign policy',
        variant: 'destructive'
      });
    }
  };

  const handlePublishPolicy = async (policy: Policy) => {
    if (policy.status === 'published') return;

    try {
      setPolicies(prev =>
        prev.map(p =>
          p.id === policy.id
            ? { ...p, status: 'published', version: p.version + 1, updated_at: new Date().toISOString() }
            : p
        )
      );

      toast({
        title: 'Success',
        description: 'Policy published successfully'
      });
    } catch (error) {
      console.error('Error publishing policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish policy',
        variant: 'destructive'
      });
    }
  };

  const handleArchivePolicy = async (policy: Policy) => {
    try {
      setPolicies(prev =>
        prev.map(p =>
          p.id === policy.id
            ? { ...p, status: 'archived', updated_at: new Date().toISOString() }
            : p
        )
      );

      toast({
        title: 'Success',
        description: 'Policy archived successfully'
      });
    } catch (error) {
      console.error('Error archiving policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive policy',
        variant: 'destructive'
      });
    }
  };

  // Filter policies based on search and status
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate acceptance statistics
  const getAcceptanceStats = (policyId: string) => {
    const policyAssignments = assignments.filter(a => a.policy_id === policyId);
    const accepted = policyAssignments.filter(a => a.acceptance_status === 'accepted').length;
    const total = policyAssignments.length;
    const percentage = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { accepted, total, percentage };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Policy Builder</h2>
          <p className="text-muted-foreground">Create, manage, and track HR policies</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Policy
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Policies ({filteredPolicies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPolicies.map((policy) => {
              const stats = getAcceptanceStats(policy.id);
              return (
                <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{policy.title}</h3>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                      <Badge variant="outline">v{policy.version}</Badge>
                      {policy.acceptance_required && (
                        <Badge variant="secondary">Requires Acceptance</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated: {new Date(policy.updated_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {policy.assigned_to.length} assigned
                      </span>
                      {policy.acceptance_required && stats.total > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {stats.accepted}/{stats.total} accepted ({stats.percentage}%)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setShowPolicyViewer(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {policy.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowAssignDialog(true);
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setShowVersionHistory(true);
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    
                    {policy.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublishPolicy(policy)}
                      >
                        Publish
                      </Button>
                    )}
                    
                    {policy.status !== 'archived' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchivePolicy(policy)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredPolicies.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No policies found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter'
                    : 'Create your first policy to get started'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Policy Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Policy Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter policy title"
              />
            </div>
            
            <div>
              <Label htmlFor="body">Policy Content *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter policy content..."
                rows={8}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptance"
                checked={formData.acceptance_required}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, acceptance_required: checked as boolean }))
                }
              />
              <Label htmlFor="acceptance">Require employee acceptance</Label>
            </div>
            
            <div>
              <Label htmlFor="status">Initial Status</Label>
              <Select value={formData.status} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="published">Publish Immediately</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePolicy}>
                Create Policy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Policy Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Policy to Employees</DialogTitle>
          </DialogHeader>
          
          {selectedPolicy && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded">
                <h4 className="font-medium">{selectedPolicy.title}</h4>
                <p className="text-sm text-muted-foreground">Version {selectedPolicy.version}</p>
              </div>
              
              <div>
                <Label>Select Employees</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {employees.map((employee) => {
                    const isAlreadyAssigned = selectedPolicy.assigned_to.includes(employee.id);
                    const isSelected = selectedEmployees.includes(employee.id);
                    
                    return (
                      <div key={employee.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={employee.id}
                          checked={isSelected}
                          disabled={isAlreadyAssigned}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees(prev => [...prev, employee.id]);
                            } else {
                              setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
                            }
                          }}
                        />
                        <Label 
                          htmlFor={employee.id} 
                          className={`flex-1 ${isAlreadyAssigned ? 'text-muted-foreground' : ''}`}
                        >
                          {employee.first_name} {employee.last_name}
                          {isAlreadyAssigned && <span className="ml-2 text-xs">(Already assigned)</span>}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignPolicy} disabled={selectedEmployees.length === 0}>
                  Assign to {selectedEmployees.length} Employee(s)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Policy Viewer Sheet */}
      <Sheet open={showPolicyViewer} onOpenChange={setShowPolicyViewer}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Policy Viewer</SheetTitle>
          </SheetHeader>
          
          {selectedPolicy && (
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold">{selectedPolicy.title}</h2>
                  <Badge className={getStatusColor(selectedPolicy.status)}>
                    {selectedPolicy.status}
                  </Badge>
                  <Badge variant="outline">v{selectedPolicy.version}</Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Created: {new Date(selectedPolicy.created_at).toLocaleString()}</p>
                  <p>Last updated: {new Date(selectedPolicy.updated_at).toLocaleString()}</p>
                  <p>Requires acceptance: {selectedPolicy.acceptance_required ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Policy Content</h3>
                <div className="whitespace-pre-wrap text-sm border rounded p-4 bg-muted/50">
                  {selectedPolicy.body}
                </div>
              </div>
              
              {selectedPolicy.assigned_to.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Assignment Status</h3>
                  <div className="space-y-2">
                    {assignments
                      .filter(a => a.policy_id === selectedPolicy.id)
                      .map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">
                            {assignment.employee?.first_name} {assignment.employee?.last_name}
                          </span>
                          <div className="flex items-center gap-2">
                            {assignment.acceptance_status === 'accepted' && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            )}
                            {assignment.acceptance_status === 'pending' && (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {assignment.acceptance_status === 'declined' && (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Declined
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Version History Sheet */}
      <Sheet open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
          </SheetHeader>
          
          {selectedPolicy && (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-medium">{selectedPolicy.title}</h3>
                <p className="text-sm text-muted-foreground">Current version: {selectedPolicy.version}</p>
              </div>
              
              <div className="space-y-3">
                {/* Current version */}
                <div className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Version {selectedPolicy.version}</span>
                    <Badge>Current</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Updated: {new Date(selectedPolicy.updated_at).toLocaleString()}
                  </p>
                  <p className="text-sm mt-2">Policy updated with latest changes</p>
                </div>
                
                {/* Previous versions (mock data) */}
                {selectedPolicy.version > 1 && (
                  <div className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Version {selectedPolicy.version - 1}</span>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(selectedPolicy.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm mt-2">Initial policy creation</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HROIQPolicyBuilder;