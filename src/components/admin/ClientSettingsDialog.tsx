import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Users, ArrowRight } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useNavigate } from 'react-router-dom';

interface ClientSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientSettingsDialog = ({ open, onOpenChange }: ClientSettingsDialogProps) => {
  const navigate = useNavigate();
  const { companies: clients, loading } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState(clients);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [clients, searchTerm]);

  const handleClientSelect = (clientId: string) => {
    // Navigate to client profile page under client management for payroll settings access
    navigate(`/admin/crm/clients/${clientId}?tab=payroll`);
    onOpenChange(false);
    setSearchTerm(''); // Reset search
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'premium': return 'outline';
      default: return 'destructive';
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Settings
            </DialogTitle>
            <DialogDescription>
              Loading clients...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Client Settings
          </DialogTitle>
          <DialogDescription>
            Search and select a client to access their payroll settings quickly.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No clients found</h4>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'No clients available.'}
              </p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleClientSelect(client.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{client.company_name}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="text-sm">
                          Client ID: {client.client_number || 'N/A'}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(client.subscription_status)}>
                        {client.subscription_status || 'inactive'}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                {(client.company_address_street || client.company_address_city || client.company_address_state) && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {[client.company_address_street, client.company_address_city, client.company_address_state].filter(Boolean).join(', ')}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};