import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar } from 'lucide-react';

const Notes = () => {
  const sampleNotes = [
    {
      id: '1',
      title: 'Call with Acme Corp',
      content: 'Discussed pricing options for enterprise package...',
      contact: 'John Smith',
      company: 'Acme Corp',
      date: '2024-01-15',
      type: 'call'
    },
    {
      id: '2',
      title: 'Meeting Follow-up',
      content: 'Need to send proposal by end of week...',
      contact: 'Jane Doe',
      company: 'Tech Solutions',
      date: '2024-01-14',
      type: 'meeting'
    },
    {
      id: '3',
      title: 'Email Response',
      content: 'Customer interested in additional features...',
      contact: 'Mike Johnson',
      company: 'StartupXYZ',
      date: '2024-01-13',
      type: 'email'
    }
  ];

  return (
    <StandardPageLayout 
      title="Notes"
      subtitle="Customer interaction notes and communications"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Customer Notes</h2>
            <p className="text-muted-foreground">Track all customer interactions and important notes</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        <div className="space-y-4">
          {sampleNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {note.date}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{note.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span><strong>Contact:</strong> {note.contact}</span>
                  <span><strong>Company:</strong> {note.company}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default Notes;