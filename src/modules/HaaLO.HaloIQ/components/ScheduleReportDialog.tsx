import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Mail, Users } from 'lucide-react';

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: any;
  prompt: string;
}

export const ScheduleReportDialog: React.FC<ScheduleReportDialogProps> = ({
  open,
  onOpenChange,
  reportData,
  prompt
}) => {
  const [frequency, setFrequency] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [recipients, setRecipients] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleScheduleReport = async () => {
    setIsScheduling(true);
    
    // TODO: Implement schedule report functionality
    const scheduleData = {
      frequency,
      timeOfDay,
      recipients: recipients.split(',').map(email => email.trim()).filter(email => email),
      isEnabled,
      prompt,
      reportData,
      createdAt: new Date().toISOString()
    };
    
    console.log('Scheduling report:', scheduleData);
    
    setTimeout(() => {
      setIsScheduling(false);
      onOpenChange(false);
      // Reset form
      setFrequency('');
      setTimeOfDay('09:00');
      setRecipients('');
      setIsEnabled(true);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Report Delivery
          </DialogTitle>
          <DialogDescription>
            Set up automatic delivery of this report to your email or team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Enable Scheduled Delivery
            </Label>
            <Switch
              id="enable-schedule"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          {isEnabled && (
            <>
              {/* Frequency */}
              <div className="space-y-2">
                <Label>Frequency *</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time of Day */}
              <div className="space-y-2">
                <Label htmlFor="time">Time of Day</Label>
                <Input
                  id="time"
                  type="time"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                />
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label htmlFor="recipients" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Recipients
                </Label>
                <Input
                  id="recipients"
                  placeholder="your.email@company.com, team@company.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter email addresses separated by commas. Defaults to your email if empty.
                </p>
              </div>

              {/* Preview */}
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Schedule Preview</h4>
                <p className="text-sm text-muted-foreground">
                  This report will be delivered{' '}
                  <span className="font-medium">{frequency || 'at selected frequency'}</span>{' '}
                  at <span className="font-medium">{timeOfDay}</span>
                  {recipients && (
                    <> to <span className="font-medium">{recipients.split(',').length} recipient(s)</span></>
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleReport} 
            disabled={isEnabled && (!frequency || isScheduling)}
          >
            {isScheduling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                {isEnabled ? 'Schedule Report' : 'Save Settings'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};