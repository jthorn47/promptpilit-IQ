import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail, Phone, Globe, MapPin, Calendar, Edit, ArrowLeft } from 'lucide-react';
import { ClientFormDialog } from './ClientFormDialog';

export const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { selectedClient, loading, fetchClientById } = useClientContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientById(clientId);
    }
  }, [clientId, fetchClientById]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!selectedClient) {
    return <div>Client not found</div>;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'prospective': return 'outline';
      case 'churned': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/client-management/list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{selectedClient.name}</h1>
              <Badge variant={getStatusBadgeVariant(selectedClient.status)} className="mt-1">
                {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact Information</TabsTrigger>
          <TabsTrigger value="contract">Contract Details</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Industry</label>
                  <p className="mt-1">{selectedClient.industry || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                  <p className="mt-1">{selectedClient.size ? 
                    selectedClient.size.charAt(0).toUpperCase() + selectedClient.size.slice(1) 
                    : 'Not specified'}</p>
                </div>
                {selectedClient.website_url && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={selectedClient.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedClient.website_url}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Primary Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedClient.contact_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="mt-1">{selectedClient.contact_name}</p>
                  </div>
                )}
                {selectedClient.contact_email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a 
                        href={`mailto:${selectedClient.contact_email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedClient.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                {selectedClient.contact_phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a 
                        href={`tel:${selectedClient.contact_phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedClient.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedClient.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{selectedClient.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedClient.address && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <div className="mt-1 flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1" />
                      <div>
                        {selectedClient.address.street && <p>{selectedClient.address.street}</p>}
                        <p>
                          {[selectedClient.address.city, selectedClient.address.state, selectedClient.address.zip]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {selectedClient.address.country && <p>{selectedClient.address.country}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedClient.contract_start_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Start Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p>{new Date(selectedClient.contract_start_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {selectedClient.contract_end_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract End Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p>{new Date(selectedClient.contract_end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ClientFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        mode="edit"
        client={selectedClient}
      />
    </div>
  );
};