import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Tablet, MapPin, Camera, Shield, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type KioskSettings = Tables<'kiosk_settings'>;
type KioskSettingsInsert = TablesInsert<'kiosk_settings'>;
type KioskSettingsUpdate = TablesUpdate<'kiosk_settings'>;

interface KioskSettingsTabProps {
  companyId: string;
}

export function KioskSettingsTab({ companyId }: KioskSettingsTabProps) {
  const [settings, setSettings] = useState<KioskSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDevice, setEditingDevice] = useState<KioskSettings | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newDevice, setNewDevice] = useState<Partial<KioskSettingsInsert>>({
    company_id: companyId,
    device_id: '',
    device_name: '',
    location_name: '',
    is_active: true,
    biometric_enabled: true,
    photo_verification_enabled: true,
    geofencing_enabled: false,
    grace_period_minutes: 15,
    require_break_tracking: false,
    auto_break_duration_minutes: 30,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [companyId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kiosk_settings')
        .select('*')
        .eq('company_id', companyId)
        .order('device_name');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading kiosk settings:', error);
      toast({
        title: "Error",
        description: "Failed to load kiosk settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDevice = async (deviceSettings: KioskSettings | KioskSettingsInsert) => {
    try {
      setSaving(true);

      if ('id' in deviceSettings) {
        // Update existing device
        const { error } = await supabase
          .from('kiosk_settings')
          .update(deviceSettings)
          .eq('id', deviceSettings.id);

        if (error) throw error;

        setSettings(settings.map(s => s.id === deviceSettings.id ? deviceSettings as KioskSettings : s));
        setEditingDevice(null);
      } else {
        // Create new device
        const { data, error } = await supabase
          .from('kiosk_settings')
          .insert(deviceSettings)
          .select()
          .single();

        if (error) throw error;

        setSettings([...settings, data]);
        setIsCreating(false);
        setNewDevice({
          company_id: companyId,
          device_id: '',
          device_name: '',
          location_name: '',
          is_active: true,
          biometric_enabled: true,
          photo_verification_enabled: true,
          geofencing_enabled: false,
          grace_period_minutes: 15,
          require_break_tracking: false,
          auto_break_duration_minutes: 30,
        });
      }

      toast({
        title: "Success",
        description: "Kiosk settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving kiosk settings:', error);
      toast({
        title: "Error",
        description: "Failed to save kiosk settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('kiosk_settings')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setSettings(settings.filter(s => s.id !== deviceId));
      toast({
        title: "Success",
        description: "Kiosk device deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting kiosk device:', error);
      toast({
        title: "Error",
        description: "Failed to delete kiosk device",
        variant: "destructive",
      });
    }
  };

  const DeviceForm = ({ 
    device, 
    isNew = false, 
    onSave, 
    onCancel 
  }: { 
    device: KioskSettings | Partial<KioskSettingsInsert>; 
    isNew?: boolean;
    onSave: (device: KioskSettings | KioskSettingsInsert) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(device);

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tablet className="h-5 w-5" />
            {isNew ? 'Add New Kiosk Device' : `Edit ${device.device_name}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_name">Device Name</Label>
              <Input
                id="device_name"
                value={formData.device_name || ''}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="e.g., Front Lobby Kiosk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_id">Device ID</Label>
              <Input
                id="device_id"
                value={formData.device_id || ''}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                placeholder="Unique device identifier"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_name">Location Name</Label>
            <Input
              id="location_name"
              value={formData.location_name || ''}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="e.g., Warehouse Floor, Main Office"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Settings
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Device Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="biometric_enabled">Biometric Authentication</Label>
                  <Switch
                    id="biometric_enabled"
                    checked={formData.biometric_enabled || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, biometric_enabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="photo_verification_enabled">Photo Verification</Label>
                  <Switch
                    id="photo_verification_enabled"
                    checked={formData.photo_verification_enabled || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, photo_verification_enabled: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Settings
              </h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="grace_period_minutes">Grace Period (minutes)</Label>
                  <Input
                    id="grace_period_minutes"
                    type="number"
                    min="0"
                    max="60"
                    value={formData.grace_period_minutes || 15}
                    onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="require_break_tracking">Break Tracking</Label>
                  <Switch
                    id="require_break_tracking"
                    checked={formData.require_break_tracking || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, require_break_tracking: checked })}
                  />
                </div>
                {formData.require_break_tracking && (
                  <div className="space-y-2">
                    <Label htmlFor="auto_break_duration_minutes">Auto Break Duration (minutes)</Label>
                    <Input
                      id="auto_break_duration_minutes"
                      type="number"
                      min="15"
                      max="120"
                      value={formData.auto_break_duration_minutes || 30}
                      onChange={(e) => setFormData({ ...formData, auto_break_duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Settings
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="geofencing_enabled">Enable Geofencing</Label>
              <Switch
                id="geofencing_enabled"
                checked={formData.geofencing_enabled || false}
                onCheckedChange={(checked) => setFormData({ ...formData, geofencing_enabled: checked })}
              />
            </div>
            {formData.geofencing_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allowed_lat">Latitude</Label>
                  <Input
                    id="allowed_lat"
                    type="number"
                    step="0.000001"
                    value={formData.allowed_lat || ''}
                    onChange={(e) => setFormData({ ...formData, allowed_lat: parseFloat(e.target.value) })}
                    placeholder="37.7749"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed_lng">Longitude</Label>
                  <Input
                    id="allowed_lng"
                    type="number"
                    step="0.000001"
                    value={formData.allowed_lng || ''}
                    onChange={(e) => setFormData({ ...formData, allowed_lng: parseFloat(e.target.value) })}
                    placeholder="-122.4194"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="geofence_radius_meters">Radius (meters)</Label>
                  <Input
                    id="geofence_radius_meters"
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.geofence_radius_meters || 100}
                    onChange={(e) => setFormData({ ...formData, geofence_radius_meters: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave(formData as KioskSettings | KioskSettingsInsert)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Device'}
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
              <Settings className="h-5 w-5" />
              Kiosk Device Settings
            </span>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Tablet className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </CardTitle>
          <CardDescription>
            Configure iPad kiosk devices for time tracking with biometric authentication
          </CardDescription>
        </CardHeader>
      </Card>

      {isCreating && (
        <DeviceForm
          device={newDevice}
          isNew={true}
          onSave={handleSaveDevice}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingDevice && (
        <DeviceForm
          device={editingDevice}
          onSave={handleSaveDevice}
          onCancel={() => setEditingDevice(null)}
        />
      )}

      {settings.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="text-center py-8">
            <Tablet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No kiosk devices configured yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {settings.map((device) => (
            <Card key={device.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    {device.device_name}
                    {device.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Inactive
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingDevice(device)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteDevice(device.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {device.location_name} • Device ID: {device.device_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Biometric Auth</p>
                    <p className="font-medium">{device.biometric_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Photo Verification</p>
                    <p className="font-medium">{device.photo_verification_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grace Period</p>
                    <p className="font-medium">{device.grace_period_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Geofencing</p>
                    <p className="font-medium">{device.geofencing_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}