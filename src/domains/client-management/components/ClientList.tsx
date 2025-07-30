import React, { useEffect, useState } from 'react';
import { useClientContext } from '../context/ClientContext';
import { HaaLODataGrid } from '@/modules/HaaLO.Shared/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClientFormDialog } from './ClientFormDialog';
import { Client } from '../types/client.types';
import { StandardLayout } from '@/components/layouts/StandardLayout';

export const ClientList: React.FC = () => {
  const { clients, loading, fetchClients, deleteClient, metrics, fetchMetrics } = useClientContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
    fetchMetrics();
  }, [fetchClients, fetchMetrics]);

  const handleSearch = () => {
    const filters = {
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    };
    fetchClients(filters);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'prospective': return 'outline';
      case 'churned': return 'destructive';
      default: return 'outline';
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Company Name',
      sortable: true,
      render: (value: string, record: Client) => (
        <div className="font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          {value}
        </div>
      ),
    },
    {
      key: 'contact_name',
      title: 'Contact',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'contact_email',
      title: 'Email',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'industry',
      title: 'Industry',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: Client) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/client-management/client/${record.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingClient(record)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(record.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StandardLayout 
      title="Client Directory"
      subtitle="View and manage all client accounts"
    >
      <div className="space-y-6">
        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalClients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.activeClients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prospective</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.prospectiveClients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Churned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.churnedClients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.contractsExpiringSoon}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Directory
              </CardTitle>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospective">Prospective</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <HaaLODataGrid
              columns={columns}
              data={clients}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <ClientFormDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          mode="create"
        />
        
        {editingClient && (
          <ClientFormDialog
            isOpen={!!editingClient}
            onClose={() => setEditingClient(null)}
            mode="edit"
            client={editingClient}
          />
        )}
      </div>
    </StandardLayout>
  );
};