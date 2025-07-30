import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Save, 
  User, 
  Clock, 
  DollarSign,
  Bell,
  Shield
} from 'lucide-react';
import { useHROIQRetainer } from '../hooks/useHROIQRetainer';
import { useToast } from '@/hooks/use-toast';

interface HROIQSettingsProps {
  clientId: string;
}

export const HROIQSettings: React.FC<HROIQSettingsProps> = ({ clientId }) => {
  const { retainer, updateRetainer } = useHROIQRetainer(clientId);
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    retainer_hours: retainer?.retainer_hours || 10,
    rollover_bank: retainer?.rollover_bank || 0,
    overage_rate: retainer?.overage_rate || 150,
    billing_period: retainer?.billing_period || 'monthly',
    is_active: retainer?.is_active ?? true,
    hours_used: retainer?.hours_used || 0,
  });

  const handleSave = () => {
    updateRetainer(settings);
    toast({
      title: 'Success',
      description: 'Settings saved successfully',
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payroll IQ Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Configure your retainer and notification preferences
            </p>
          </div>
          <div className="hidden md:block opacity-20">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Settings className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            HROIQ Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Retainer Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-medium">Retainer Configuration</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retainer_hours">Monthly Hours</Label>
                  <Input
                    id="retainer_hours"
                    type="number"
                    value={settings.retainer_hours}
                    onChange={(e) => setSettings({...settings, retainer_hours: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rollover_bank">Rollover Bank</Label>
                  <Input
                    id="rollover_bank"
                    type="number"
                    value={settings.rollover_bank}
                    onChange={(e) => setSettings({...settings, rollover_bank: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* Billing Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <h3 className="font-medium">Billing Settings</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overage_rate">Overage Rate ($/hour)</Label>
                  <Input
                    id="overage_rate"
                    type="number"
                    value={settings.overage_rate}
                    onChange={(e) => setSettings({...settings, overage_rate: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="billing_period">Billing Period</Label>
                  <Input
                    id="billing_period"
                    value={settings.billing_period}
                    onChange={(e) => setSettings({...settings, billing_period: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Status Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <h3 className="font-medium">Status</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={settings.is_active}
                  onCheckedChange={(checked) => setSettings({...settings, is_active: checked})}
                />
                <Label htmlFor="is_active">Active retainer</Label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};