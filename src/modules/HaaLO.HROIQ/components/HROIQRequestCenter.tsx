import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Users, FileText, AlertTriangle, Calendar } from 'lucide-react';

export const HROIQRequestCenter: React.FC = () => {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - will be replaced with real API calls
  const requests = [
    {
      id: '1',
      type: 'onboarding',
      title: 'New Hire Onboarding - Sarah Johnson',
      description: 'Complete onboarding package for new marketing coordinator',
      priority: 'high',
      status: 'in-progress',
      estimatedHours: 4,
      dueDate: '2024-01-25',
      requestedBy: 'John Smith',
      assignedTo: 'HR Consultant A'
    },
    {
      id: '2',
      type: 'handbook',
      title: 'Employee Handbook Update',
      description: 'Update remote work policy and vacation accrual sections',
      priority: 'medium',
      status: 'pending',
      estimatedHours: 6,
      dueDate: '2024-01-30',
      requestedBy: 'Jane Doe',
      assignedTo: null
    },
    {
      id: '3',
      type: 'compliance',
      title: 'Annual Compliance Review',
      description: 'Review all HR policies for regulatory compliance',
      priority: 'high',
      status: 'completed',
      estimatedHours: 8,
      dueDate: '2024-01-20',
      requestedBy: 'Mike Wilson',
      assignedTo: 'HR Consultant B'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Requests</h2>
          <p className="text-muted-foreground">Manage and track your HR service requests</p>
        </div>
        
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Service Request</DialogTitle>
              <DialogDescription>
                Submit a new request for HR services from the Easeworks team.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="request-type">Request Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Employee Onboarding</SelectItem>
                    <SelectItem value="handbook">Handbook Update</SelectItem>
                    <SelectItem value="compliance">Compliance Help</SelectItem>
                    <SelectItem value="policy">Policy Development</SelectItem>
                    <SelectItem value="training">Training Materials</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Brief description of the request" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detailed description of what you need"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input id="due-date" type="date" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsNewRequestOpen(false)} className="flex-1">
                  Submit Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewRequestOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  <CardDescription>{request.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                  <Badge variant={getStatusColor(request.status)}>
                    {request.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {request.requestedBy}
                  </span>
                  {request.assignedTo && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {request.assignedTo}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {request.dueDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{request.estimatedHours}h estimated</span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No requests found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};