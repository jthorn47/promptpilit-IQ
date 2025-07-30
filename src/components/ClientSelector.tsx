import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  company_name: string;
  employee_count?: number;
  industry?: string;
  subscription_status?: string;
}

interface ClientSelectorProps {
  selectedClientId?: string;
  onClientSelect: (clientId: string) => void;
  className?: string;
}

export const ClientSelector = ({ selectedClientId, onClientSelect, className }: ClientSelectorProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_settings')
        .select('id, company_name, employee_count, industry, subscription_status')
        .order('company_name');

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(client => client.id === selectedClientId);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Select Client</span>
          </CardTitle>
          <CardDescription>Choose a client company for this evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Select Client</span>
        </CardTitle>
        <CardDescription>Choose a client company for this evaluation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedClientId} onValueChange={onClientSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client company..." />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{client.company_name}</span>
                  {client.employee_count && (
                    <Badge variant="secondary" className="ml-2">
                      <Users className="w-3 h-3 mr-1" />
                      {client.employee_count}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedClient && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium">{selectedClient.company_name}</h4>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {selectedClient.industry && (
                <Badge variant="outline">{selectedClient.industry}</Badge>
              )}
              {selectedClient.employee_count && (
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {selectedClient.employee_count} employees
                </Badge>
              )}
              {selectedClient.subscription_status && (
                <Badge variant={selectedClient.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {selectedClient.subscription_status}
                </Badge>
              )}
            </div>
          </div>
        )}

        {clients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No client companies found</p>
            <p className="text-sm">Add client companies to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};