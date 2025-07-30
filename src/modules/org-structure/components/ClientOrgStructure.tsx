import React, { useState } from 'react';
import { HaaLODataGrid } from '@/modules/HaaLO.Shared/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - in real implementation, fetch from companies API
const mockClients = [
  { id: '1', name: 'Acme Corp', locations: 3, divisions: 5, departments: 12 },
  { id: '2', name: 'TechStart Inc', locations: 2, divisions: 3, departments: 8 },
  { id: '3', name: 'Manufacturing Co', locations: 4, divisions: 8, departments: 15 },
];

export const ClientOrgStructure = () => {
  const [selectedClient, setSelectedClient] = useState<string>('all');

  const clientColumns = [
    {
      key: 'name',
      title: 'Company Name',
      sortable: true,
      render: (value: string, record: any) => (
        <div className="font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          {value}
        </div>
      ),
    },
    {
      key: 'locations',
      title: 'Locations',
      render: (value: number) => (
        <Badge variant="outline">{value} locations</Badge>
      ),
    },
    {
      key: 'divisions',
      title: 'Divisions', 
      render: (value: number) => (
        <Badge variant="outline">{value} divisions</Badge>
      ),
    },
    {
      key: 'departments',
      title: 'Departments',
      render: (value: number) => (
        <Badge variant="outline">{value} departments</Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/admin/org-structure/client/${record.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View Structure
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const filteredClients = selectedClient === 'all' ? mockClients : mockClients.filter(c => c.id === selectedClient);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {mockClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Organization Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HaaLODataGrid
            columns={clientColumns}
            data={filteredClients}
            loading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};