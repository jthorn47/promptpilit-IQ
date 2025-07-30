import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Phone, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProposalNextStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalData: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    proposalTitle: string;
  };
  threadId?: string;
}

export const ProposalNextStepsModal: React.FC<ProposalNextStepsModalProps> = ({
  isOpen,
  onClose,
  proposalData,
  threadId
}) => {
  const [selectedAction, setSelectedAction] = useState<'followup' | 'call' | 'none' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [callDate, setCallDate] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const createFollowupTask = async () => {
    try {
      const { error } = await supabase.functions.invoke('create-task', {
        body: {
          title: `Follow up on proposal: ${proposalData.proposalTitle}`,
          description: `Follow up with ${proposalData.contactName} at ${proposalData.companyName} regarding the proposal sent.`,
          dueDate: followupDate,
          priority: 'medium',
          metadata: {
            type: 'proposal_followup',
            companyName: proposalData.companyName,
            contactEmail: proposalData.contactEmail,
            threadId,
            notes
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Follow-up task created",
        description: `Reminder set for ${new Date(followupDate).toLocaleDateString()}`
      });
    } catch (error) {
      console.error('Error creating follow-up task:', error);
      toast({
        title: "Error",
        description: "Failed to create follow-up task",
        variant: "destructive"
      });
    }
  };

  const createCallEvent = async () => {
    try {
      const { error } = await supabase.functions.invoke('create-calendar-event', {
        body: {
          title: `Call: ${proposalData.contactName} - ${proposalData.companyName}`,
          description: `Discuss proposal: ${proposalData.proposalTitle}\n\nNotes: ${notes}`,
          startTime: new Date(callDate).toISOString(),
          duration: 30, // 30 minutes
          attendees: [proposalData.contactEmail],
          metadata: {
            type: 'proposal_call',
            companyName: proposalData.companyName,
            threadId
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Call scheduled",
        description: `Calendar event created for ${new Date(callDate).toLocaleDateString()}`
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to create calendar event",
        variant: "destructive"
      });
    }
  };

  const handleComplete = async () => {
    if (!selectedAction || selectedAction === 'none') {
      onClose();
      return;
    }

    setIsCreating(true);

    try {
      if (selectedAction === 'followup' && followupDate) {
        await createFollowupTask();
      } else if (selectedAction === 'call' && callDate) {
        await createCallEvent();
      }

      // Save to thread metadata (simulate CRM update)
      const nextStepData = {
        action: selectedAction,
        date: selectedAction === 'followup' ? followupDate : callDate,
        notes,
        createdAt: new Date().toISOString()
      };

      console.log('Saving next step to thread metadata:', nextStepData);
      
      onClose();
    } catch (error) {
      console.error('Error handling next steps:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getDefaultFollowupDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  const getDefaultCallDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>What's the next step?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Proposal sent to {proposalData.contactName} at {proposalData.companyName}
          </p>

          <div className="space-y-3">
            <Card 
              className={`cursor-pointer transition-colors ${selectedAction === 'followup' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedAction('followup')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Follow-up in 2 days</h4>
                    <p className="text-sm text-muted-foreground">Create a reminder task</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${selectedAction === 'call' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedAction('call')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Schedule call</h4>
                    <p className="text-sm text-muted-foreground">Add calendar event</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${selectedAction === 'none' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedAction('none')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <X className="w-5 h-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">No action</h4>
                    <p className="text-sm text-muted-foreground">Just close this dialog</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedAction === 'followup' && (
            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label htmlFor="followupDate">Follow-up Date</Label>
                <Input
                  id="followupDate"
                  type="date"
                  value={followupDate || getDefaultFollowupDate()}
                  onChange={(e) => setFollowupDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for the follow-up..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {selectedAction === 'call' && (
            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label htmlFor="callDate">Call Date & Time</Label>
                <Input
                  id="callDate"
                  type="datetime-local"
                  value={callDate || getDefaultCallDate()}
                  onChange={(e) => setCallDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="callNotes">Meeting Notes (optional)</Label>
                <Textarea
                  id="callNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add agenda or notes for the call..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleComplete} 
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Complete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};