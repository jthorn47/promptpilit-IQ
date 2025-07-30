import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Copy, Edit2, Trash2, Save, X } from "lucide-react";
import { LocationTimeRulesService, type LocationTimeRule, type LocationTimeRuleInsert } from '@/modules/HaaLO.TimeTrack/services/LocationTimeRulesService';

interface LocationRulesTabProps {
  clientId: string;
}

export function LocationRulesTab({ clientId }: LocationRulesTabProps) {
  const [rules, setRules] = useState<LocationTimeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<LocationTimeRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState<Partial<LocationTimeRuleInsert>>({
    client_id: clientId,
    location_name: '',
    state: 'CA',
    daily_ot_threshold: 8,
    daily_dt_threshold: 12,
    weekly_ot_threshold: 40,
    seven_day_rule: false,
    workweek_start_day: 'Monday',
    notes: '',
  });
  const { toast } = useToast();

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadRules();
  }, [clientId]);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await LocationTimeRulesService.getLocationRules(clientId);
      setRules(data);
    } catch (error) {
      console.error('Error loading location rules:', error);
      toast({
        title: "Error",
        description: "Failed to load location rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      if (!newRule.location_name?.trim()) {
        toast({
          title: "Error",
          description: "Location name is required",
          variant: "destructive",
        });
        return;
      }

      const rule = await LocationTimeRulesService.createLocationRule(newRule as LocationTimeRuleInsert);
      setRules([...rules, rule]);
      setIsCreating(false);
      setNewRule({
        client_id: clientId,
        location_name: '',
        state: 'CA',
        daily_ot_threshold: 8,
        daily_dt_threshold: 12,
        weekly_ot_threshold: 40,
        seven_day_rule: false,
        workweek_start_day: 'Monday',
        notes: '',
      });
      toast({
        title: "Success",
        description: "Location rule created successfully",
      });
    } catch (error) {
      console.error('Error creating location rule:', error);
      toast({
        title: "Error",
        description: "Failed to create location rule",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRule = async (rule: LocationTimeRule) => {
    try {
      const updatedRule = await LocationTimeRulesService.updateLocationRule(rule.id, rule);
      setRules(rules.map(r => r.id === rule.id ? updatedRule : r));
      setEditingRule(null);
      toast({
        title: "Success",
        description: "Location rule updated successfully",
      });
    } catch (error) {
      console.error('Error updating location rule:', error);
      toast({
        title: "Error",
        description: "Failed to update location rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await LocationTimeRulesService.deleteLocationRule(id);
      setRules(rules.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Location rule deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting location rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete location rule",
        variant: "destructive",
      });
    }
  };

  const handleCopyRule = async (sourceRule: LocationTimeRule) => {
    const newLocationName = `${sourceRule.location_name} Copy`;
    try {
      const copiedRule = await LocationTimeRulesService.copyLocationRule(sourceRule.id, newLocationName);
      setRules([...rules, copiedRule]);
      toast({
        title: "Success",
        description: "Location rule copied successfully",
      });
    } catch (error) {
      console.error('Error copying location rule:', error);
      toast({
        title: "Error",
        description: "Failed to copy location rule",
        variant: "destructive",
      });
    }
  };

  const RuleForm = ({ 
    rule, 
    isNew = false, 
    onSave, 
    onCancel 
  }: { 
    rule: LocationTimeRule | Partial<LocationTimeRuleInsert>; 
    isNew?: boolean;
    onSave: (rule: LocationTimeRule | LocationTimeRuleInsert) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(rule);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isNew ? 'New Location Rule' : `Edit ${rule.location_name}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name</Label>
              <Input
                id="location_name"
                value={formData.location_name || ''}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                placeholder="e.g., Los Angeles Warehouse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select 
                value={formData.state || 'CA'} 
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {stateOptions.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_ot_threshold">Daily OT Threshold (hours)</Label>
              <Input
                id="daily_ot_threshold"
                type="number"
                min="1"
                max="24"
                value={formData.daily_ot_threshold || 8}
                onChange={(e) => setFormData({ ...formData, daily_ot_threshold: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_dt_threshold">Daily DT Threshold (hours)</Label>
              <Input
                id="daily_dt_threshold"
                type="number"
                min="1"
                max="24"
                value={formData.daily_dt_threshold || 12}
                onChange={(e) => setFormData({ ...formData, daily_dt_threshold: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly_ot_threshold">Weekly OT Threshold (hours)</Label>
              <Input
                id="weekly_ot_threshold"
                type="number"
                min="40"
                max="168"
                value={formData.weekly_ot_threshold || 40}
                onChange={(e) => setFormData({ ...formData, weekly_ot_threshold: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workweek_start_day">Workweek Start Day</Label>
              <Select 
                value={formData.workweek_start_day || 'Monday'} 
                onValueChange={(value) => setFormData({ ...formData, workweek_start_day: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {weekDays.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="seven_day_rule"
                checked={formData.seven_day_rule || false}
                onCheckedChange={(checked) => setFormData({ ...formData, seven_day_rule: checked })}
              />
              <Label htmlFor="seven_day_rule">Enable 7-Day Rule</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this location's rules..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={() => onSave(formData as LocationTimeRule | LocationTimeRuleInsert)}>
              <Save className="h-4 w-4 mr-2" />
              {isNew ? 'Create Rule' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Time Rules
            </span>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location Rule
            </Button>
          </CardTitle>
          <CardDescription>
            Define specific time compliance rules for different work locations. Location rules override the default client settings.
          </CardDescription>
        </CardHeader>
      </Card>

      {isCreating && (
        <RuleForm
          rule={newRule}
          isNew={true}
          onSave={handleCreateRule}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingRule && (
        <RuleForm
          rule={editingRule}
          onSave={handleUpdateRule}
          onCancel={() => setEditingRule(null)}
        />
      )}

      {rules.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No location rules configured yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              All locations will use the default client time settings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {rule.location_name}
                    <Badge variant="secondary">{rule.state}</Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopyRule(rule)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingRule(rule)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Daily OT</p>
                    <p className="font-medium">{rule.daily_ot_threshold}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Daily DT</p>
                    <p className="font-medium">{rule.daily_dt_threshold}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weekly OT</p>
                    <p className="font-medium">{rule.weekly_ot_threshold}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Workweek Start</p>
                    <p className="font-medium">{rule.workweek_start_day}</p>
                  </div>
                </div>
                {rule.seven_day_rule && (
                  <div className="mt-2">
                    <Badge variant="outline">7-Day Rule Enabled</Badge>
                  </div>
                )}
                {rule.notes && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    <p className="text-muted-foreground mb-1">Notes:</p>
                    <p>{rule.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}