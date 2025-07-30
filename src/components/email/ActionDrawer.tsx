import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, CheckSquare, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type ActionType = 'task' | 'calendar' | 'approval';

interface ActionDrawerProps {
  open: boolean;
  onClose: () => void;
  actionType: ActionType;
  emailSubject: string;
  emailBody: string;
  emailSender?: string;
}

export function ActionDrawer({ 
  open, 
  onClose, 
  actionType, 
  emailSubject, 
  emailBody, 
  emailSender 
}: ActionDrawerProps) {
  const [formData, setFormData] = useState({
    title: emailSubject,
    notes: emailBody,
    priority: 'medium',
    assignee: '',
    dueDate: new Date(),
    approver: '',
    category: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (actionType === 'task') {
        await createTask();
      } else if (actionType === 'calendar') {
        await createCalendarEvent();
      } else if (actionType === 'approval') {
        await createApprovalRequest();
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating action:', error);
      setError(error instanceof Error ? error.message : 'Failed to create action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createTask = async () => {
    const { data, error } = await supabase.functions.invoke('create-task', {
      body: {
        title: formData.title,
        notes: formData.notes,
        senderName: emailSender || 'Unknown',
        emailTimestamp: new Date().toISOString(),
        priority: formData.priority as 'low' | 'medium' | 'high',
        dueDate: formData.dueDate.toISOString(),
      }
    });

    if (error) throw error;
    
    toast.success(`Task created successfully in ${data.system === 'pulse' ? 'Pulse' : 'internal system'}!`);
    
    // Store in localStorage for local tracking
    const existing = JSON.parse(localStorage.getItem('emailActions') || '[]');
    existing.push({
      id: data.taskId,
      type: 'task',
      ...formData,
      emailSender,
      createdAt: new Date().toISOString(),
      system: data.system
    });
    localStorage.setItem('emailActions', JSON.stringify(existing));
  };

  const createCalendarEvent = async () => {
    const { data, error } = await supabase.functions.invoke('create-calendar-event', {
      body: {
        title: formData.title,
        notes: formData.notes,
        senderName: emailSender || 'Unknown',
        startDate: formData.dueDate.toISOString(),
        endDate: new Date(formData.dueDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
        extractDateFromContent: true,
        emailContent: emailBody,
      }
    });

    if (error) throw error;
    
    const systemMessage = data.system === 'google-calendar' ? 
      'Google Calendar' : 'internal calendar system';
    
    toast.success(`Calendar event created successfully in ${systemMessage}!`);
    
    // Store in localStorage for local tracking
    const existing = JSON.parse(localStorage.getItem('emailActions') || '[]');
    existing.push({
      id: data.eventId,
      type: 'calendar',
      ...formData,
      emailSender,
      createdAt: new Date().toISOString(),
      system: data.system,
      eventUrl: data.eventUrl
    });
    localStorage.setItem('emailActions', JSON.stringify(existing));
  };

  const createApprovalRequest = async () => {
    // For approval, we'll store locally for now since there's no specific approval system
    const actionData = {
      id: Date.now().toString(),
      type: 'approval',
      ...formData,
      emailSender,
      createdAt: new Date().toISOString(),
      system: 'internal'
    };

    const existing = JSON.parse(localStorage.getItem('emailActions') || '[]');
    existing.push(actionData);
    localStorage.setItem('emailActions', JSON.stringify(existing));

    toast.success('Approval request created successfully!');
  };

  const getActionTitle = (type: ActionType) => {
    switch (type) {
      case 'task': return 'Task';
      case 'calendar': return 'Calendar Event';
      case 'approval': return 'Approval Request';
      default: return 'Action';
    }
  };

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-4 h-4" />;
      case 'calendar': return <CalendarIcon className="w-4 h-4" />;
      case 'approval': return <UserCheck className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {getActionIcon(actionType)}
            Create {getActionTitle(actionType)}
          </DrawerTitle>
          <DrawerDescription>
            Converting email from {emailSender} into a {getActionTitle(actionType).toLowerCase()}
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title..."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {actionType === 'task' && (
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Assign to..."
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {actionType === 'calendar' && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {actionType === 'approval' && (
                <div className="space-y-2">
                  <Label htmlFor="approver">Approver</Label>
                  <Input
                    id="approver"
                    value={formData.approver}
                    onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                    placeholder="Select approver..."
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                {actionType === 'task' ? 'Due Date' : 
                 actionType === 'calendar' ? 'Event Date' : 
                 'Approval Deadline'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => date && setFormData({ ...formData, dueDate: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create {getActionTitle(actionType)}
              </>
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}