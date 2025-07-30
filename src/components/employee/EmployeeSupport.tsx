// Employee Support Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Phone, Mail, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  subject: string;
  category: 'hr' | 'it' | 'payroll' | 'benefits' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  submittedDate: string;
  lastUpdate: string;
  assignedTo?: string;
  resolution?: string;
}

export const EmployeeSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
    description: ''
  });

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockTickets: SupportTicket[] = [
      {
        id: '1',
        subject: 'Unable to access paystub portal',
        category: 'payroll',
        priority: 'medium',
        status: 'resolved',
        description: 'I cannot log into the paystub portal to view my latest paycheck',
        submittedDate: '2024-01-10',
        lastUpdate: '2024-01-12',
        assignedTo: 'HR Team',
        resolution: 'Password reset was completed. Please use the new temporary password sent to your email.'
      },
      {
        id: '2',
        subject: 'Health insurance enrollment question',
        category: 'benefits',
        priority: 'low',
        status: 'in_progress',
        description: 'I need help understanding the different health insurance options available',
        submittedDate: '2024-01-15',
        lastUpdate: '2024-01-16',
        assignedTo: 'Benefits Team'
      },
      {
        id: '3',
        subject: 'Laptop performance issues',
        category: 'it',
        priority: 'high',
        status: 'open',
        description: 'My work laptop is running very slowly and affecting my productivity',
        submittedDate: '2024-01-18',
        lastUpdate: '2024-01-18'
      }
    ];

    setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmitTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const ticket: SupportTicket = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTicket,
      status: 'open',
      submittedDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({
      subject: '',
      category: 'general',
      priority: 'medium',
      description: ''
    });
    setShowTicketForm(false);

    toast({
      title: "Ticket Submitted",
      description: `Your support request has been submitted. Ticket ID: ${ticket.id}`
    });
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="destructive">Open</Badge>;
    }
  };

  const getCategoryIcon = (category: SupportTicket['category']) => {
    switch (category) {
      case 'hr': return '👥';
      case 'it': return '💻';
      case 'payroll': return '💰';
      case 'benefits': return '🏥';
      default: return '❓';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with HR, IT, payroll, and other workplace questions
          </p>
        </div>
        <Button onClick={() => setShowTicketForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Quick Help Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Call HR</h3>
                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                <p className="text-xs text-muted-foreground">Mon-Fri 9AM-5PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Email HR</h3>
                <p className="text-sm text-muted-foreground">hr@company.com</p>
                <p className="text-xs text-muted-foreground">Response within 24hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">FAQ</h3>
                <p className="text-sm text-muted-foreground">Common questions</p>
                <p className="text-xs text-muted-foreground">Self-service help</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Form */}
      {showTicketForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value as SupportTicket['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR & People</SelectItem>
                    <SelectItem value="it">IT & Technology</SelectItem>
                    <SelectItem value="payroll">Payroll & Compensation</SelectItem>
                    <SelectItem value="benefits">Benefits & Insurance</SelectItem>
                    <SelectItem value="general">General Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value as SupportTicket['priority'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="medium">Medium - Normal issue</SelectItem>
                    <SelectItem value="high">High - Urgent assistance needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                placeholder="Brief description of your issue..."
                value={newTicket.subject}
                onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                placeholder="Please provide detailed information about your issue, including any error messages or steps you've already tried..."
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitTicket}>
                Submit Ticket
              </Button>
              <Button variant="outline" onClick={() => setShowTicketForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets History */}
      <Card>
        <CardHeader>
          <CardTitle>My Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">#{ticket.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.subject}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{getCategoryIcon(ticket.category)}</span>
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`capitalize font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.lastUpdate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {tickets.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No support tickets</h3>
              <p className="text-muted-foreground">Click "Create Ticket" if you need assistance</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};