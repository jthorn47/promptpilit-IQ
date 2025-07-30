import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Headphones, 
  TicketIcon, 
  MessageCircle, 
  FileText, 
  Search,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created: string;
  client: string;
  assignee?: string;
}

const mockTickets: SupportTicket[] = [
  {
    id: 'TICK-001',
    title: 'Payroll processing issue',
    status: 'open',
    priority: 'high',
    created: '2024-01-15',
    client: 'Acme Corp',
    assignee: 'John Doe'
  },
  {
    id: 'TICK-002',
    title: 'Employee onboarding question',
    status: 'in-progress',
    priority: 'medium',
    created: '2024-01-14',
    client: 'Tech Solutions',
    assignee: 'Jane Smith'
  },
  {
    id: 'TICK-003',
    title: 'Login access problem',
    status: 'resolved',
    priority: 'urgent',
    created: '2024-01-13',
    client: 'Global Inc',
    assignee: 'Mike Johnson'
  }
];

export default function ClientSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StandardPageLayout
      title="Client Support"
      subtitle="Manage support tickets and client assistance"
    >

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={() => setShowNewTicket(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(ticket.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ticket.id}</span>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{ticket.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {ticket.client} • Created {ticket.created}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {ticket.status}
                        </Badge>
                        {ticket.assignee && (
                          <span className="text-sm text-muted-foreground">
                            Assigned to {ticket.assignee}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Getting Started Guide', category: 'Onboarding', views: 245 },
                  { title: 'Payroll Processing FAQ', category: 'Payroll', views: 189 },
                  { title: 'Time Tracking Setup', category: 'Time Management', views: 156 },
                  { title: 'Troubleshooting Login Issues', category: 'Technical', views: 134 },
                ].map((article, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {article.category} • {article.views} views
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Live Chat Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Live Chat Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Real-time chat support will be available in the next update.
                  </p>
                </div>
                <Button variant="outline">
                  Contact Support via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showNewTicket && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto mt-20 max-h-[80vh] overflow-auto">
          <CardHeader>
            <CardTitle>Create New Support Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-title">Title</Label>
              <Input id="ticket-title" placeholder="Brief description of the issue" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input id="priority" placeholder="Medium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input id="client" placeholder="Select client" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Detailed description of the issue" rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowNewTicket(false);
                toast({
                  title: "Ticket Created",
                  description: "Support ticket has been created successfully.",
                });
              }}>
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </StandardPageLayout>
  );
}