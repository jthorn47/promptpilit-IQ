import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Building2, MapPin, Users } from 'lucide-react';
import { useLocations, useOrgSettings, useUpdateOrgSettings } from '@/hooks/useOrgStructure';
import { useCompanies } from '@/hooks/useCompanies';
import { CreateLocationDialog } from './dialogs/CreateLocationDialog';
import { LocationCard } from './components/LocationCard';

export function OrgStructureManager() {
  const [createLocationOpen, setCreateLocationOpen] = useState(false);
  const { companies } = useCompanies();
  const companyId = companies?.[0]?.id;
  
  const { data: locations, isLoading: locationsLoading } = useLocations(companyId);
  const { data: orgSettings, isLoading: settingsLoading } = useOrgSettings(companyId || '');
  const updateSettings = useUpdateOrgSettings();

  if (!companyId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No company found. Please set up your company first.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSettingChange = (setting: string, value: boolean) => {
    if (!companyId || !orgSettings) return;
    
    updateSettings.mutate({
      companyId,
      ...orgSettings,
      [setting]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Structure Settings
          </CardTitle>
          <CardDescription>
            Configure how your organization hierarchy is structured and what fields are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Require Divisions</div>
              <div className="text-xs text-muted-foreground">
                Make division assignment mandatory for all employees
              </div>
            </div>
            <Switch
              checked={orgSettings?.require_divisions || false}
              onCheckedChange={(checked) => handleSettingChange('require_divisions', checked)}
              disabled={settingsLoading || updateSettings.isPending}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Require Departments</div>
              <div className="text-xs text-muted-foreground">
                Make department assignment mandatory for all employees
              </div>
            </div>
            <Switch
              checked={orgSettings?.require_departments || false}
              onCheckedChange={(checked) => handleSettingChange('require_departments', checked)}
              disabled={settingsLoading || updateSettings.isPending}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Auto-Generate Org Codes</div>
              <div className="text-xs text-muted-foreground">
                Automatically generate unique codes for locations, divisions, and departments
              </div>
            </div>
            <Switch
              checked={orgSettings?.auto_generate_org_codes !== false}
              onCheckedChange={(checked) => handleSettingChange('auto_generate_org_codes', checked)}
              disabled={settingsLoading || updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Locations
              </CardTitle>
              <CardDescription>
                Manage your organization's physical locations. All employees must be assigned to a location.
              </CardDescription>
            </div>
            <Button onClick={() => setCreateLocationOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locationsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading locations...
            </div>
          ) : locations?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No locations found</p>
              <p className="text-xs">Add your first location to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations?.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  companyId={companyId}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Hierarchy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Hierarchy
          </CardTitle>
          <CardDescription>
            Overview of your organization structure and requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Location</Badge>
              <span className="text-muted-foreground">Always Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={orgSettings?.require_divisions ? "default" : "secondary"}>
                Division
              </Badge>
              <span className="text-muted-foreground">
                {orgSettings?.require_divisions ? 'Required' : 'Optional'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={orgSettings?.require_departments ? "default" : "secondary"}>
                Department
              </Badge>
              <span className="text-muted-foreground">
                {orgSettings?.require_departments ? 'Required' : 'Optional'}
              </span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-xs text-muted-foreground">
            <p>📍 <strong>Location:</strong> Top-level organizational unit (e.g., Office, Factory, Store)</p>
            <p>🧱 <strong>Division:</strong> Business unit within a location (e.g., Sales, Engineering, Operations)</p>
            <p>👥 <strong>Department:</strong> Team within a division (e.g., Frontend, Marketing, HR)</p>
          </div>
        </CardContent>
      </Card>

      <CreateLocationDialog
        open={createLocationOpen}
        onOpenChange={setCreateLocationOpen}
        companyId={companyId}
      />
    </div>
  );
}