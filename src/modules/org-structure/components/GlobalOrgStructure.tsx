import React, { useState } from 'react';
import { HaaLODataGrid } from '@/modules/HaaLO.Shared/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, MapPin, Users, Edit } from 'lucide-react';
import { useLocations, useDivisions, useDepartments } from '@/hooks/useOrgStructure';
import type { Location, Division, Department } from '@/hooks/useOrgStructure';

export const GlobalOrgStructure = () => {
  const [activeTab, setActiveTab] = useState('locations');
  
  // For global view, we don't filter by company
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: divisions = [], isLoading: divisionsLoading } = useDivisions();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();

  const locationColumns = [
    {
      key: 'name',
      title: 'Location Name',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {value}
        </div>
      ),
    },
    {
      key: 'code',
      title: 'Code',
      render: (value: string) => value || '-',
    },
    {
      key: 'city',
      title: 'City',
      render: (value: string) => value || '-',
    },
    {
      key: 'state',
      title: 'State',
      render: (value: string) => value || '-',
    },
    {
      key: 'country',
      title: 'Country',
      render: (value: string) => value || 'US',
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const divisionColumns = [
    {
      key: 'name',
      title: 'Division Name',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          {value}
        </div>
      ),
    },
    {
      key: 'code',
      title: 'Code',
      render: (value: string) => value || '-',
    },
    {
      key: 'location_id',
      title: 'Location',
      render: (value: string) => {
        const location = locations.find(l => l.id === value);
        return location ? location.name : '-';
      },
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const departmentColumns = [
    {
      key: 'name',
      title: 'Department Name',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          {value}
        </div>
      ),
    },
    {
      key: 'code',
      title: 'Code',
      render: (value: string) => value || '-',
    },
    {
      key: 'division_id',
      title: 'Division',
      render: (value: string) => {
        const division = divisions.find(d => d.id === value);
        return division ? division.name : '-';
      },
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const loading = locationsLoading || divisionsLoading || departmentsLoading;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="divisions">Divisions</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>
          
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Global Template
          </Button>
        </div>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                All Locations Across Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={locationColumns}
                data={locations}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                All Divisions Across Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={divisionColumns}
                data={divisions}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Departments Across Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={departmentColumns}
                data={departments}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};