import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActivityTypeSelector } from "../activities/ActivityTypeSelector";
import { ContactSelector } from "../activities/ContactSelector";
import { supabase } from "@/integrations/supabase/client";

interface ActivityCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  companyName: string;
  companyId: string;
  clientType?: string;
}

export const ActivityCreateDialog: React.FC<ActivityCreateDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  companyName,
  companyId,
  clientType
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    type: '',
    description: '',
    contact_name: '',
    contact_email: '',
    priority: 'medium',
    status: 'completed',
    outcome: '',
    next_steps: '',
    duration_minutes: '',
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser({ id: user.id, email: user.email || 'Unknown User' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.type.trim()) return;

    setSubmitting(true);
    try {
      const activityData = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        scheduled_at: scheduledDate?.toISOString(),
        assigned_to: currentUser?.id || 'unknown',
        created_by: currentUser?.id || 'unknown',
        company_id: companyId,
        client_type: clientType,
      };

      const success = await onSubmit(activityData);
      if (success) {
        handleClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      subject: '',
      type: '',
      description: '',
      contact_name: '',
      contact_email: '',
      priority: 'medium',
      status: 'completed',
      outcome: '',
      next_steps: '',
      duration_minutes: '',
    });
    setScheduledDate(undefined);
    onClose();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (contactId: string, contactName: string) => {
    setFormData(prev => ({
      ...prev,
      contact_name: contactId === 'no-contact' ? '' : contactName,
      contact_email: '' // Will be populated from contact data if needed
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
          <DialogDescription>
            Create a new activity for {companyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ActivityTypeSelector
              value={formData.type}
              onChange={(value) => updateFormData('type', value)}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => updateFormData('subject', e.target.value)}
              placeholder="Enter activity subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe the activity"
              rows={3}
            />
          </div>

          <ContactSelector
            companyId={companyId}
            value={formData.contact_name}
            onChange={handleContactChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => updateFormData('duration_minutes', e.target.value)}
                placeholder="30"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scheduled Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {formData.status === 'completed' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea
                  id="outcome"
                  value={formData.outcome}
                  onChange={(e) => updateFormData('outcome', e.target.value)}
                  placeholder="What was the result of this activity?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea
                  id="next_steps"
                  value={formData.next_steps}
                  onChange={(e) => updateFormData('next_steps', e.target.value)}
                  placeholder="What are the next steps?"
                  rows={2}
                />
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.subject.trim() || !formData.type.trim()}>
              {submitting ? "Creating..." : "Create Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};