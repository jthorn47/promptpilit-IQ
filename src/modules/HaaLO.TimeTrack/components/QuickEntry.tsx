import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HaloInput } from '@/components/ui/halo-input';
import { HaaLODropdown } from '@/modules/HaaLO.Shared/components/HaaLODropdown';
import { HaaLODatePicker } from '@/modules/HaaLO.Shared/components/HaaLODatePicker';
import { Save, Plus, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { TimeProject, TimeCode, CreateTimeEntryRequest } from '../types';

interface QuickEntryProps {
  projects: TimeProject[];
  timeCodes: TimeCode[];
  onSaveEntry: (entry: CreateTimeEntryRequest) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

interface QuickEntryForm {
  date: Date;
  projectId: string;
  timeCodeId: string;
  hours: string;
  notes: string;
}

interface MissingTimeAlert {
  date: string;
  hours: number;
}

export const QuickEntry: React.FC<QuickEntryProps> = ({
  projects,
  timeCodes,
  onSaveEntry,
  onCancel,
  className = ''
}) => {
  const { user, companyId } = useAuth();
  const [formData, setFormData] = useState<QuickEntryForm>({
    date: new Date(),
    projectId: '',
    timeCodeId: '',
    hours: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [missingTimeThisWeek, setMissingTimeThisWeek] = useState<MissingTimeAlert[]>([]);

  // Pre-fill with most recent selections from localStorage
  useEffect(() => {
    const lastUsed = localStorage.getItem('quickEntry_lastUsed');
    if (lastUsed) {
      try {
        const parsed = JSON.parse(lastUsed);
        setFormData(prev => ({
          ...prev,
          projectId: parsed.projectId || '',
          timeCodeId: parsed.timeCodeId || '',
        }));
      } catch (error) {
        console.error('Error loading last used values:', error);
      }
    }
  }, []);

  // Calculate missing time for current week
  useEffect(() => {
    const weekStart = startOfWeek(formData.date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(formData.date, { weekStartsOn: 1 });
    
    // Mock calculation - in real app, fetch from backend
    const mockMissingTime: MissingTimeAlert[] = [
      { date: format(addDays(weekStart, 0), 'yyyy-MM-dd'), hours: 8 },
      { date: format(addDays(weekStart, 1), 'yyyy-MM-dd'), hours: 8 },
    ];
    
    setMissingTimeThisWeek(mockMissingTime);
  }, [formData.date]);

  const handleDateSwipe = (direction: 'prev' | 'next') => {
    setFormData(prev => ({
      ...prev,
      date: direction === 'prev' ? subDays(prev.date, 1) : addDays(prev.date, 1)
    }));
  };

  const handleSave = async (saveAndAddAnother: boolean = false) => {
    if (!user?.id || !companyId) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.projectId || !formData.timeCodeId || !formData.hours) {
      toast.error('Please fill in all required fields');
      return;
    }

    const hours = parseFloat(formData.hours);
    if (isNaN(hours) || hours <= 0) {
      toast.error('Please enter a valid number of hours');
      return;
    }

    try {
      setIsLoading(true);

      const entryData: CreateTimeEntryRequest = {
        employee_id: user.id,
        company_id: companyId,
        date: format(formData.date, 'yyyy-MM-dd'),
        project_id: formData.projectId,
        time_code_id: formData.timeCodeId,
        hours,
        hours_worked: hours,
        notes: formData.notes || undefined,
        tags: [],
        is_billable: projects.find(p => p.id === formData.projectId)?.is_billable || false,
        is_remote: false,
        status: 'draft'
      };

      await onSaveEntry(entryData);

      // Save last used values
      localStorage.setItem('quickEntry_lastUsed', JSON.stringify({
        projectId: formData.projectId,
        timeCodeId: formData.timeCodeId
      }));

      toast.success('Time entry saved successfully');

      if (saveAndAddAnother) {
        // Reset form but keep project/time code
        setFormData(prev => ({
          ...prev,
          hours: '',
          notes: '',
          date: addDays(prev.date, 1) // Move to next day
        }));
      } else {
        onCancel();
      }
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast.error('Failed to save time entry');
    } finally {
      setIsLoading(false);
    }
  };

  const projectOptions = projects.map(project => ({
    value: project.id,
    label: `${project.name} (${project.client_name})`,
    disabled: !project.is_active
  }));

  const timeCodeOptions = timeCodes.map(timeCode => ({
    value: timeCode.id,
    label: `${timeCode.code} - ${timeCode.name}`,
    disabled: !timeCode.is_active
  }));

  const totalMissingHours = missingTimeThisWeek.reduce((sum, item) => sum + item.hours, 0);

  return (
    <div className={`min-h-screen bg-background pb-20 ${className}`}>
      {/* Missing Time Alert */}
      {totalMissingHours > 0 && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <Card className="border-warning bg-warning/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Missing Time This Week</p>
                  <p className="text-sm text-warning/80">{totalMissingHours} hours remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Form */}
      <div className="p-4 pt-20 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Time Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection with Swipe Navigation */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateSwipe('prev')}
                  className="px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <HaaLODatePicker
                    value={formData.date}
                    onChange={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                    className="w-full"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateSwipe('next')}
                  className="px-3"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(formData.date, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            {/* Project Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project *</label>
              <HaaLODropdown
                options={projectOptions}
                value={formData.projectId}
                onChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                placeholder="Select project"
                className="w-full"
              />
            </div>

            {/* Time Code Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Code *</label>
              <HaaLODropdown
                options={timeCodeOptions}
                value={formData.timeCodeId}
                onChange={(value) => setFormData(prev => ({ ...prev, timeCodeId: value }))}
                placeholder="Select time code"
                className="w-full"
              />
            </div>

            {/* Hours Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hours *</label>
              <HaloInput
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="0.00"
                className="w-full text-lg"
              />
              <div className="flex gap-2">
                {[2, 4, 6, 8].map(hours => (
                  <Button
                    key={hours}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, hours: hours.toString() }))}
                    className="flex-1"
                  >
                    {hours}h
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about your work..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Current Selection Summary */}
            {formData.projectId && formData.timeCodeId && formData.hours && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Entry Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Project:</span> {projects.find(p => p.id === formData.projectId)?.name}</p>
                      <p><span className="text-muted-foreground">Time Code:</span> {timeCodes.find(tc => tc.id === formData.timeCodeId)?.name}</p>
                      <p><span className="text-muted-foreground">Hours:</span> {formData.hours}</p>
                      <p><span className="text-muted-foreground">Date:</span> {format(formData.date, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={() => handleSave(false)}
            disabled={isLoading || !formData.projectId || !formData.timeCodeId || !formData.hours}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          
          <Button
            onClick={() => handleSave(true)}
            disabled={isLoading || !formData.projectId || !formData.timeCodeId || !formData.hours}
            className="flex-1"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Save & Add Another
          </Button>
        </div>
      </div>
    </div>
  );
};
