import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, MessageSquare, Calendar, Clock } from 'lucide-react';

const CommunicationsLog = () => {
  const sampleCommunications = [
    {
      id: '1',
      type: 'call',
      subject: 'Discovery call with Acme Corp',
      contact: 'John Smith',
      company: 'Acme Corporation',
      direction: 'outbound',
      duration: '45 minutes',
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'completed',
      notes: 'Discussed requirements for enterprise solution...'
    },
    {
      id: '2',
      type: 'email',
      subject: 'Follow-up on proposal',
      contact: 'Jane Doe',
      company: 'Tech Solutions',
      direction: 'outbound',
      date: '2024-01-14',
      time: '2:15 PM',
      status: 'sent',
      notes: 'Sent detailed proposal and pricing information'
    },
    {
      id: '3',
      type: 'meeting',
      subject: 'Product demo session',
      contact: 'Mike Johnson',
      company: 'StartupXYZ',
      direction: 'inbound',
      duration: '60 minutes',
      date: '2024-01-13',
      time: '3:00 PM',
      status: 'completed',
      notes: 'Demonstrated key features, very positive response'
    },
    {
      id: '4',
      type: 'call',
      subject: 'Check-in call',
      contact: 'Sarah Wilson',
      company: 'Innovation Labs',
      direction: 'outbound',
      duration: '20 minutes',
      date: '2024-01-12',
      time: '11:00 AM',
      status: 'missed',
      notes: 'Left voicemail, will follow up via email'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return MessageSquare;
      default: return MessageSquare;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'sent': return 'secondary';
      case 'missed': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'inbound' ? 'default' : 'outline';
  };

  return (
    <StandardPageLayout 
      title="Communications Log"
      subtitle="Track all customer communications and interactions"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Communication History</h2>
            <p className="text-muted-foreground">Complete log of all customer interactions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Communication
          </Button>
        </div>

        <div className="space-y-4">
          {sampleCommunications.map((comm) => {
            const TypeIcon = getTypeIcon(comm.type);
            return (
              <Card key={comm.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TypeIcon className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">{comm.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {comm.contact} • {comm.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getDirectionColor(comm.direction)}>
                        {comm.direction}
                      </Badge>
                      <Badge variant={getStatusColor(comm.status)}>
                        {comm.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {comm.date}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {comm.time}
                    </div>
                    {comm.duration && (
                      <div className="flex items-center text-sm">
                        <span className="text-muted-foreground">Duration: {comm.duration}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{comm.notes}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default CommunicationsLog;