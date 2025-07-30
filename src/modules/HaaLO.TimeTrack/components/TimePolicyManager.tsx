import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { HaaLODropdown } from '@/modules/HaaLO.Shared/components/HaaLODropdown';
import { Plus, Save, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { TimePolicyService } from '../services/TimeTrackService';
import { TimePolicy, TimePolicyCreateRequest, CustomTimeRule } from '../types';

interface TimePolicyManagerProps {
  onPolicyChange?: (policy: TimePolicy) => void;
}

export const TimePolicyManager: React.FC<TimePolicyManagerProps> = ({ onPolicyChange }) => {
  const { user, companyId } = useAuth();
  const [policies, setPolicies] = useState<TimePolicy[]>([]);
  const [activePolicy, setActivePolicy] = useState<TimePolicy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<TimePolicyCreateRequest>({
    company_id: companyId || '',
    policy_name: 'Default Policy',
    state: '',
    daily_overtime_threshold: 8.0,
    daily_doubletime_threshold: 12.0,
    weekly_overtime_threshold: 40.0,
    seven_day_rule: true,
    workweek_start_day: 'Monday'
  });

  const stateOptions = [
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Florida' },
    { value: 'WA', label: 'Washington' },
    { value: 'IL', label: 'Illinois' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'OH', label: 'Ohio' },
    { value: 'GA', label: 'Georgia' },
    { value: 'NC', label: 'North Carolina' },
  ];

  const workweekOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    if (companyId) {
      fetchPolicies();
    }
  }, [companyId]);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const [policiesData, activePolicyData] = await Promise.all([
        TimePolicyService.getTimePolicies(companyId!),
        TimePolicyService.getActiveTimePolicy(companyId!)
      ]);
      
      setPolicies(policiesData);
      setActivePolicy(activePolicyData);
      
      if (activePolicyData) {
        setFormData({
          company_id: activePolicyData.company_id,
          policy_name: activePolicyData.policy_name,
          state: activePolicyData.state,
          daily_overtime_threshold: activePolicyData.daily_overtime_threshold,
          daily_doubletime_threshold: activePolicyData.daily_doubletime_threshold,
          weekly_overtime_threshold: activePolicyData.weekly_overtime_threshold,
          seven_day_rule: activePolicyData.seven_day_rule,
          workweek_start_day: activePolicyData.workweek_start_day,
          custom_rules: activePolicyData.custom_rules
        });
        onPolicyChange?.(activePolicyData);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load time policies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!companyId) {
        toast.error('Company ID is required');
        return;
      }

      if (activePolicy && isEditing) {
        // Update existing policy
        const updated = await TimePolicyService.updateTimePolicy(activePolicy.id, formData);
        setActivePolicy(updated);
        toast.success('Time policy updated successfully');
      } else {
        // Create new policy
        const created = await TimePolicyService.createTimePolicy({
          ...formData,
          company_id: companyId
        });
        setActivePolicy(created);
        await TimePolicyService.activateTimePolicy(created.id, companyId);
        toast.success('Time policy created and activated');
      }
      
      setIsEditing(false);
      fetchPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Failed to save time policy');
    }
  };

  const handleActivatePolicy = async (policyId: string) => {
    try {
      await TimePolicyService.activateTimePolicy(policyId, companyId!);
      toast.success('Time policy activated');
      fetchPolicies();
    } catch (error) {
      console.error('Error activating policy:', error);
      toast.error('Failed to activate policy');
    }
  };

  const loadCaliforniaDefaults = () => {
    setFormData({
      ...formData,
      policy_name: 'California Standard Policy',
      state: 'CA',
      daily_overtime_threshold: 8.0,
      daily_doubletime_threshold: 12.0,
      weekly_overtime_threshold: 40.0,
      seven_day_rule: true,
      workweek_start_day: 'Monday'
    });
    toast.success('California defaults loaded');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Policy Overview */}
      {activePolicy && !isEditing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Active Time Policy: {activePolicy.policy_name}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit Policy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">State</Label>
                <Badge variant="secondary">{activePolicy.state}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Daily OT Threshold</Label>
                <p className="text-sm">{activePolicy.daily_overtime_threshold} hours</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Daily DT Threshold</Label>
                <p className="text-sm">{activePolicy.daily_doubletime_threshold} hours</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Weekly OT Threshold</Label>
                <p className="text-sm">{activePolicy.weekly_overtime_threshold} hours</p>
              </div>
              <div>
                <Label className="text-sm font-medium">7-Day Rule</Label>
                <Badge variant={activePolicy.seven_day_rule ? 'default' : 'outline'}>
                  {activePolicy.seven_day_rule ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Workweek Start</Label>
                <p className="text-sm">{activePolicy.workweek_start_day}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy Configuration Form */}
      {(isEditing || !activePolicy) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {activePolicy ? 'Edit Time Policy' : 'Create Time Policy'}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadCaliforniaDefaults}
                >
                  Load CA Defaults
                </Button>
                {isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_name">Policy Name</Label>
                <Input
                  id="policy_name"
                  value={formData.policy_name}
                  onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                  placeholder="Enter policy name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <HaaLODropdown
                  options={stateOptions}
                  value={formData.state}
                  onChange={(value) => setFormData({ ...formData, state: value })}
                  placeholder="Select state"
                />
              </div>
            </div>

            {/* Overtime Thresholds */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_ot">Daily Overtime Threshold (hours)</Label>
                <Input
                  id="daily_ot"
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={formData.daily_overtime_threshold}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    daily_overtime_threshold: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="daily_dt">Daily Double-Time Threshold (hours)</Label>
                <Input
                  id="daily_dt"
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={formData.daily_doubletime_threshold}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    daily_doubletime_threshold: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weekly_ot">Weekly Overtime Threshold (hours)</Label>
                <Input
                  id="weekly_ot"
                  type="number"
                  step="0.25"
                  min="0"
                  max="168"
                  value={formData.weekly_overtime_threshold}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    weekly_overtime_threshold: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workweek_start">Workweek Start Day</Label>
                <HaaLODropdown
                  options={workweekOptions}
                  value={formData.workweek_start_day}
                  onChange={(value) => setFormData({ 
                    ...formData, 
                    workweek_start_day: value as any 
                  })}
                  placeholder="Select workweek start day"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="seven_day_rule"
                  checked={formData.seven_day_rule}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    seven_day_rule: checked 
                  })}
                />
                <Label htmlFor="seven_day_rule">Enable 7-Day Rule</Label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                {activePolicy && isEditing ? 'Update Policy' : 'Create Policy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy History */}
      {policies.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Policy History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {policies.map((policy) => (
                <div 
                  key={policy.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{policy.policy_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {policy.state} • Created {new Date(policy.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {policy.is_active && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                  
                  {!policy.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivatePolicy(policy.id)}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};