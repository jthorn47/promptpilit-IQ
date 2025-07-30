import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/modules/HaaLO.Shared/utils/currencyFormatter';
import { Download, FileSpreadsheet, Search, Users, Building, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  company_name: string;
  primary_contact_phone: string | null;
  contract_value: number | null;
  currency: string | null;
  status: string;
  date_won: string | null;
  account_manager: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  key_contacts: { email?: string } | null;
}

export const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: clients, isLoading, error } = useSupabaseQuery(
    ['finance-clients'],
    async () => {
      return await supabase
        .from('clients')
        .select(`
          id,
          company_name,
          primary_contact_phone,
          contract_value,
          currency,
          status,
          date_won,
          account_manager,
          subscription_status,
          stripe_customer_id,
          key_contacts
        `)
        .order('company_name');
    }
  );

  const filteredClients = (clients || []).filter((client: Client) => {
    const email = (client.key_contacts as any)?.email || '';
    return client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.account_manager && client.account_manager.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleExportPDF = () => {
    toast.info('PDF export functionality coming soon');
  };

  const handleExportExcel = () => {
    toast.info('Excel export functionality coming soon');
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading client data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Client directory for financial operations and billing management
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by company name, contact email, or account manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{filteredClients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">
                  {filteredClients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contract Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    filteredClients.reduce((sum, client) => 
                      sum + (client.contract_value || 0), 0
                    )
                  )}
                </p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Client Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading client data...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-3 text-left font-medium">Client Name</th>
                    <th className="p-3 text-left font-medium">Contact</th>
                    <th className="p-3 text-left font-medium">Contract Value</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Account Manager</th>
                    <th className="p-3 text-left font-medium">Date Won</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{client.company_name}</div>
                        {client.stripe_customer_id && (
                          <div className="text-xs text-muted-foreground">
                            ID: {client.stripe_customer_id}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {(client.key_contacts as any)?.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {(client.key_contacts as any).email}
                            </div>
                          )}
                          {client.primary_contact_phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {client.primary_contact_phone}
                            </div>
                          )}
                          {!(client.key_contacts as any)?.email && !client.primary_contact_phone && (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        {client.contract_value 
                          ? formatCurrency(client.contract_value, { currency: client.currency || 'USD' })
                          : '-'
                        }
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : client.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {client.account_manager || '-'}
                      </td>
                      <td className="p-3">
                        {client.date_won 
                          ? new Date(client.date_won).toLocaleDateString()
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;