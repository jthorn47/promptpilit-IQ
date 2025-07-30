import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Phone, Calendar, Send, Plus } from 'lucide-react';
import { StandardLayout } from '@/components/layouts/StandardLayout';

export const ClientCommunicationPage: React.FC = () => {
  const communicationStats = [
    {
      title: 'Total Messages',
      value: '0',
      description: 'This month',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Email Campaigns',
      value: '0',
      description: 'Active campaigns',
      icon: Mail,
      color: 'text-green-600'
    },
    {
      title: 'Scheduled Calls',
      value: '0',
      description: 'This week',
      icon: Phone,
      color: 'text-purple-600'
    },
    {
      title: 'Response Rate',
      value: '0%',
      description: 'Average response',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const recentCommunications = [
    // This would be populated with real data
  ];

  return (
    <StandardLayout 
      title="Communication Hub"
      subtitle="Client communication and support center"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Call
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>

        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {communicationStats.map((stat) => {
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

        {/* Communication Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common communication tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Mail className="h-6 w-6 mb-2" />
                  Email Broadcast
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Send SMS
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Phone className="h-6 w-6 mb-2" />
                  Schedule Call
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Calendar className="h-6 w-6 mb-2" />
                  Meeting Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Pre-built communication templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Welcome Message</h4>
                    <p className="text-sm text-muted-foreground">New client onboarding</p>
                  </div>
                  <Button size="sm" variant="outline">Use</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Contract Renewal</h4>
                    <p className="text-sm text-muted-foreground">Renewal reminder</p>
                  </div>
                  <Button size="sm" variant="outline">Use</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Follow-up</h4>
                    <p className="text-sm text-muted-foreground">Post-meeting follow-up</p>
                  </div>
                  <Button size="sm" variant="outline">Use</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Communications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Communications</CardTitle>
            <CardDescription>Latest client interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Communications Yet</h3>
              <p className="text-muted-foreground mb-4">Start communicating with clients to see activity here</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Send First Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};