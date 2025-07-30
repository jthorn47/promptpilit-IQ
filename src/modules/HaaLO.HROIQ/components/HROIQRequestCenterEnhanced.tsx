
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUp
} from 'lucide-react';
import { useHROIQRequests } from '../hooks/useHROIQRequests';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface RequestForm {
  retainer_id: string;
  request_type: string;
  priority: string;
  title: string;
  description: string;
  urgency_level: string;
  expected_completion: string;
  client_contact_name: string;
  client_contact_email: string;
}

export const HROIQRequestCenterEnhanced: React.FC = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  
  const { requests, isLoading, createRequest, escalateToPulse } = useHROIQRequests();
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState<RequestForm>({
    retainer_id: '',
    request_type: '',
    priority: 'medium',
    title: '',
    description: '',
    urgency_level: 'normal',
    expected_completion: '',
    client_contact_name: '',
    client_contact_email: '',
  });

  const requestTypes = [
    { value: 'policy_review', label: 'Policy Review' },
    { value: 'handbook_update', label: 'Handbook Update' },
    { value: 'compliance_question', label: 'Compliance Question' },
    { value: 'termination_guidance', label: 'Termination Guidance' },
    { value: 'investigation_support', label: 'Investigation Support' },
    { value: 'training_request', label: 'Training Request' },
    { value: 'benefits_question', label: 'Benefits Question' },
    { value: 'harassment_complaint', label: 'Harassment Complaint' },
    { value: 'accommodation_request', label: 'Accommodation Request' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmitRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.request_type) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createRequest(newRequest);
    setNewRequest({
      retainer_id: '',
      request_type: '',
      priority: 'medium',
      title: '',
      description: '',
      urgency_level: 'normal',
      expected_completion: '',
      client_contact_name: '',
      client_contact_email: '',
    });
    setShowNewRequest(false);
  };

  const handleEscalateToPulse = () => {
    if (!selectedRequest) return;

    const caseData = {
      title: selectedRequest.title,
      description: selectedRequest.description,
      type: 'hr',
      priority: selectedRequest.priority,
      status: 'open',
      related_company_id: selectedRequest.hroiq_client_retainers?.client_id,
      related_contact_email: selectedRequest.client_contact_email,
    };

    escalateToPulse({ requestId: selectedRequest.id, caseData });
    setShowEscalateDialog(false);
    setSelectedRequest(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payroll IQ Request Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Submit and track your HR service requests
            </p>
          </div>
          <div className="hidden md:block opacity-20">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
      {/* Request Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {requests?.filter(r => r.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {requests?.filter(r => r.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests?.filter(r => r.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Request Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Service Requests
            </div>
            <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit New HR Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="request_type">Request Type *</Label>
                      <Select value={newRequest.request_type} onValueChange={(value) => setNewRequest({...newRequest, request_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                        <SelectContent>
                          {requestTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Request Title *</Label>
                    <Input
                      id="title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      placeholder="Brief description of your request..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                      placeholder="Provide detailed information about your HR request..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="urgency_level">Urgency Level</Label>
                      <Select value={newRequest.urgency_level} onValueChange={(value) => setNewRequest({...newRequest, urgency_level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="expected_completion">Expected Completion</Label>
                      <Input
                        id="expected_completion"
                        type="date"
                        value={newRequest.expected_completion}
                        onChange={(e) => setNewRequest({...newRequest, expected_completion: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_contact_name">Contact Name</Label>
                      <Input
                        id="client_contact_name"
                        value={newRequest.client_contact_name}
                        onChange={(e) => setNewRequest({...newRequest, client_contact_name: e.target.value})}
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="client_contact_email">Contact Email</Label>
                      <Input
                        id="client_contact_email"
                        type="email"
                        value={newRequest.client_contact_email}
                        onChange={(e) => setNewRequest({...newRequest, client_contact_email: e.target.value})}
                        placeholder="your.email@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitRequest}>
                      Submit Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : requests && requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <h3 className="font-medium">{request.title}</h3>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {request.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Type: {requestTypes.find(t => t.value === request.request_type)?.label}</span>
                        <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{request.status}</Badge>
                      {request.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowEscalateDialog(true);
                          }}
                        >
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Escalate to Pulse
                        </Button>
                      )}
                    </div>
                  </div>
                  
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No requests found. Click "New Request" to submit your first HR request.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Escalate to Pulse Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Pulse Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium">Escalation Notice</h4>
              </div>
              <p className="text-sm text-yellow-700">
                This request will be escalated to a Pulse case for more formal case management. 
                This may result in additional billing beyond the retainer.
              </p>
            </div>
            
            {selectedRequest && (
              <div className="space-y-2">
                <h4 className="font-medium">Request Details:</h4>
                <p className="text-sm"><strong>Title:</strong> {selectedRequest.title}</p>
                <p className="text-sm"><strong>Type:</strong> {selectedRequest.request_type}</p>
                <p className="text-sm"><strong>Priority:</strong> {selectedRequest.priority}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEscalateToPulse}>
                Escalate to Pulse
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
