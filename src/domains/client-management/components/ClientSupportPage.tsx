import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, Ticket, Clock, CheckCircle, AlertCircle, Plus, Search } from 'lucide-react';
import { StandardLayout } from '@/components/layouts/StandardLayout';

export const ClientSupportPage: React.FC = () => {
  const supportStats = [
    {
      title: 'Open Tickets',
      value: '0',
      description: 'Requires attention',
      icon: Ticket,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Review',
      value: '0',
      description: 'Awaiting response',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Resolved Today',
      value: '0',
      description: 'Completed tickets',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Avg Response Time',
      value: '0h',
      description: 'Last 30 days',
      icon: AlertCircle,
      color: 'text-purple-600'
    }
  ];

  const ticketPriorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <StandardLayout 
      title="Support & Help Desk"
      subtitle="Client support ticket management"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ticket Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage and track client support requests</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tickets..." className="pl-10 w-64" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
              <p className="text-muted-foreground mb-4">Support tickets will appear here when clients submit requests</p>
              <Button variant="outline">
                Create Sample Ticket
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
              <CardDescription>Frequently reported problems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Issues</h4>
                    <p className="text-sm text-muted-foreground">Account access problems</p>
                  </div>
                  <Badge variant="secondary">0 tickets</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Billing Questions</h4>
                    <p className="text-sm text-muted-foreground">Payment and invoice issues</p>
                  </div>
                  <Badge variant="secondary">0 tickets</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Feature Requests</h4>
                    <p className="text-sm text-muted-foreground">New functionality requests</p>
                  </div>
                  <Badge variant="secondary">0 tickets</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Self-service resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Getting Started Guide</h4>
                    <p className="text-sm text-muted-foreground">Basic setup instructions</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">FAQ</h4>
                    <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Video Tutorials</h4>
                    <p className="text-sm text-muted-foreground">Step-by-step walkthroughs</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardLayout>
  );
};