import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Send,
  Phone,
  Mail
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const HROIQAskExpert: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    category: '',
    priority: 'medium',
    subject: '',
    description: ''
  });

  // Mock expert requests data
  const requests = [
    {
      id: '1',
      subject: 'Employee termination process clarification',
      category: 'Employment Law',
      priority: 'high',
      status: 'answered',
      submittedAt: '2024-02-01',
      answeredAt: '2024-02-01',
      consultant: 'Sarah Johnson, SHRM-CP',
      description: 'Need clarification on proper termination procedures for California employees.',
      answer: 'For California employees, ensure you follow these steps: 1) Document performance issues, 2) Provide final paycheck immediately, 3) Include accrued vacation pay...'
    },
    {
      id: '2',
      subject: 'Remote work policy questions',
      category: 'Policy Development',
      priority: 'medium',
      status: 'in_progress',
      submittedAt: '2024-02-03',
      answeredAt: null,
      consultant: 'Mike Wilson, PHR',
      description: 'Questions about creating a comprehensive remote work policy for our hybrid workforce.',
      answer: null
    },
    {
      id: '3',
      subject: 'Harassment complaint procedure',
      category: 'Compliance',
      priority: 'high',
      status: 'pending',
      submittedAt: '2024-02-05',
      answeredAt: null,
      consultant: null,
      description: 'Need immediate guidance on handling a harassment complaint that was just reported.',
      answer: null
    },
    {
      id: '4',
      subject: 'FMLA eligibility question',
      category: 'Benefits',
      priority: 'medium',
      status: 'answered',
      submittedAt: '2024-01-28',
      answeredAt: '2024-01-29',
      consultant: 'Sarah Johnson, SHRM-CP',
      description: 'Employee asking about FMLA eligibility for caring for sick spouse.',
      answer: 'FMLA eligibility requires the employee to have worked for at least 12 months and 1,250 hours...'
    }
  ];

  const categories = [
    'Employment Law',
    'Policy Development', 
    'Compliance',
    'Benefits',
    'Payroll',
    'Training',
    'Performance Management',
    'Workplace Safety',
    'Other'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRequests = requests.filter(request =>
    request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitRequest = () => {
    // In real app, this would submit to backend
    console.log('Submitting request:', newRequest);
    setShowNewRequest(false);
    setNewRequest({ category: '', priority: 'medium', subject: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ask an HR Expert</h2>
          <p className="text-muted-foreground">Get expert HR guidance from our certified consultants</p>
        </div>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Question
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
            <p className="text-muted-foreground text-sm">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.status === 'answered').length}
            </div>
            <p className="text-muted-foreground text-sm">Completed responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
            <p className="text-muted-foreground text-sm">Being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-muted-foreground text-sm">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {showNewRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Question</CardTitle>
            <CardDescription>
              Get expert HR guidance from our certified consultants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={newRequest.category} onValueChange={(value) => 
                    setNewRequest({...newRequest, category: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={newRequest.priority} onValueChange={(value) => 
                    setNewRequest({...newRequest, priority: value})
                  }>
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
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input 
                  placeholder="Brief description of your question"
                  value={newRequest.subject}
                  onChange={(e) => setNewRequest({...newRequest, subject: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Detailed Question</label>
                <Textarea 
                  placeholder="Provide as much context and detail as possible..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSubmitRequest}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Question
                </Button>
                <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Questions
          </CardTitle>
          <CardDescription>
            Track your submitted questions and expert responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-medium">{request.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.category} • Submitted {request.submittedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {request.description}
                  </p>
                  
                  {request.consultant && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <User className="h-4 w-4" />
                      <span>Assigned to: {request.consultant}</span>
                      {request.answeredAt && (
                        <span className="text-muted-foreground">• Answered {request.answeredAt}</span>
                      )}
                    </div>
                  )}
                  
                  {request.answer && (
                    <div className="bg-green-50 p-3 rounded-lg mt-3">
                      <h4 className="font-medium text-green-900 mb-2">Expert Response:</h4>
                      <p className="text-sm text-green-800">{request.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Your HR Team</CardTitle>
          <CardDescription>
            For urgent matters, contact your dedicated HR consultant directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Phone Support</h4>
                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                <p className="text-xs text-muted-foreground">Monday-Friday, 8 AM - 6 PM PST</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Email Support</h4>
                <p className="text-sm text-muted-foreground">hr-support@company.com</p>
                <p className="text-xs text-muted-foreground">Response within 24 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HROIQAskExpert;