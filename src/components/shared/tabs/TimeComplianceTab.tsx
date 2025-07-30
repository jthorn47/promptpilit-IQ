/**
 * TimeComplianceTab - Tab component for configuring client time compliance rules
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar, FileText, Settings, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  TimeSettingsService, 
  ClientTimeSettings, 
  UpdateTimeSettingsRequest 
} from '@/modules/HaaLO.TimeTrack/services/TimeSettingsService';

interface TimeComplianceTabProps {
  clientId: string;
}

export const TimeComplianceTab: React.FC<TimeComplianceTabProps> = ({ clientId }) => {
  const [settings, setSettings] = useState<ClientTimeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateTimeSettingsRequest>({});
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Load settings on mount
  useEffect(() => {
    loadTimeSettings();
  }, [clientId]);

  // Track form changes
  useEffect(() => {
    if (settings && Object.keys(formData).length > 0) {
      const hasFormChanges = Object.keys(formData).some(key => {
        const formValue = formData[key as keyof UpdateTimeSettingsRequest];
        const settingValue = settings[key as keyof ClientTimeSettings];
        return formValue !== settingValue;
      });
      setHasChanges(hasFormChanges);
    }
  }, [formData, settings]);

  const loadTimeSettings = async () => {
    try {
      setLoading(true);
      const data = await TimeSettingsService.getClientTimeSettings(clientId);
      setSettings(data);
      
      if (data) {
        setFormData({
          state: data.state,
          daily_ot_threshold: data.daily_ot_threshold,
          daily_dt_threshold: data.daily_dt_threshold,
          weekly_ot_threshold: data.weekly_ot_threshold,
          seven_day_rule: data.seven_day_rule,
          workweek_start_day: data.workweek_start_day,
          custom_rule_notes: data.custom_rule_notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading time settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time compliance settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate thresholds
      if (formData.daily_ot_threshold && formData.daily_ot_threshold > 24) {
        throw new Error('Daily overtime threshold cannot exceed 24 hours');
      }
      
      if (formData.daily_dt_threshold && formData.daily_dt_threshold > 24) {
        throw new Error('Daily doubletime threshold cannot exceed 24 hours');
      }
      
      if (formData.weekly_ot_threshold && formData.weekly_ot_threshold < 40) {
        throw new Error('Weekly overtime threshold must be at least 40 hours');
      }

      const updatedSettings = await TimeSettingsService.updateClientTimeSettings(clientId, formData);
      setSettings(updatedSettings);
      setHasChanges(false);
      
      toast({
        title: 'Settings Saved',
        description: 'Time compliance settings have been updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving time settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save time compliance settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        state: settings.state,
        daily_ot_threshold: settings.daily_ot_threshold,
        daily_dt_threshold: settings.daily_dt_threshold,
        weekly_ot_threshold: settings.weekly_ot_threshold,
        seven_day_rule: settings.seven_day_rule,
        workweek_start_day: settings.workweek_start_day,
        custom_rule_notes: settings.custom_rule_notes || ''
      });
      setHasChanges(false);
    }
  };

  const updateFormField = (field: keyof UpdateTimeSettingsRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading time compliance settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Time Compliance Rules</h2>
            <p className="text-sm text-muted-foreground">
              Configure overtime and compliance rules for this client
            </p>
          </div>
        </div>
        
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Basic configuration for time tracking and compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state || ''}
                onValueChange={(value) => updateFormField('state', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {TimeSettingsService.getAvailableStates().map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workweek_start_day">Workweek Start Day</Label>
              <Select
                value={formData.workweek_start_day || ''}
                onValueChange={(value) => updateFormField('workweek_start_day', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select start day" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {TimeSettingsService.getWorkweekStartDays().map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Overtime Rules
          </CardTitle>
          <CardDescription>
            Configure daily and weekly overtime thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_ot_threshold">Daily OT Threshold (hours)</Label>
              <Input
                id="daily_ot_threshold"
                type="number"
                min="1"
                max="24"
                value={formData.daily_ot_threshold || ''}
                onChange={(e) => updateFormField('daily_ot_threshold', Number(e.target.value))}
                placeholder="8"
              />
              <p className="text-xs text-muted-foreground">
                Hours per day before overtime begins
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_dt_threshold">Daily DT Threshold (hours)</Label>
              <Input
                id="daily_dt_threshold"
                type="number"
                min="1"
                max="24"
                value={formData.daily_dt_threshold || ''}
                onChange={(e) => updateFormField('daily_dt_threshold', Number(e.target.value))}
                placeholder="12"
              />
              <p className="text-xs text-muted-foreground">
                Hours per day before doubletime begins
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly_ot_threshold">Weekly OT Threshold (hours)</Label>
              <Input
                id="weekly_ot_threshold"
                type="number"
                min="40"
                max="168"
                value={formData.weekly_ot_threshold || ''}
                onChange={(e) => updateFormField('weekly_ot_threshold', Number(e.target.value))}
                placeholder="40"
              />
              <p className="text-xs text-muted-foreground">
                Hours per week before overtime begins
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="seven_day_rule" className="text-base">
                Enable 7-Day Rule
              </Label>
              <p className="text-sm text-muted-foreground">
                Require overtime pay for work on 7th consecutive day
              </p>
            </div>
            <Switch
              id="seven_day_rule"
              checked={formData.seven_day_rule || false}
              onCheckedChange={(checked) => updateFormField('seven_day_rule', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Rules & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Custom Rule Notes
          </CardTitle>
          <CardDescription>
            Document any special compliance requirements or custom rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="custom_rule_notes">Notes</Label>
            <Textarea
              id="custom_rule_notes"
              value={formData.custom_rule_notes || ''}
              onChange={(e) => updateFormField('custom_rule_notes', e.target.value)}
              placeholder="Enter any special overtime rules, union requirements, or compliance notes..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Compliance Notice</h4>
              <p className="text-sm text-amber-700 mt-1">
                Changes to overtime rules will trigger automatic re-evaluation of current week's time entries. 
                Any violations will be flagged for review. Consult with your legal team before making 
                significant changes to compliance rules.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};