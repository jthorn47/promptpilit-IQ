import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  company_name: string;
  subscription_status: string;
  employee_count?: number;
}

interface ClientSelectorProps {
  selectedClientId?: string;
  onClientSelect: (clientId: string) => void;
  className?: string;
}

export const ClientSelector = ({ selectedClientId, onClientSelect, className }: ClientSelectorProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name, subscription_status")
        .eq("status", "active")
        .order("company_name");

      if (error) {
        console.error("Error fetching clients:", error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    if (value === "all") {
      onClientSelect("");
    } else {
      onClientSelect(value);
    }
  };

  if (loading) {
    return (
      <div className={`w-full sm:w-64 ${className}`}>
        <Select disabled>
          <SelectTrigger className="bg-background">
            <Building2 className="w-4 h-4 mr-2" />
            <span>Loading clients...</span>
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={`w-full sm:w-64 ${className}`}>
      <Select value={selectedClientId || "all"} onValueChange={handleValueChange}>
        <SelectTrigger className="bg-background">
          <Building2 className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select client" />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border shadow-lg z-50">
          <SelectItem value="all" className="font-medium">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary" />
              All Clients
            </div>
          </SelectItem>
          {clients.length === 0 ? (
            <SelectItem value="none" disabled>
              No clients found
            </SelectItem>
          ) : (
            clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{client.company_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {client.subscription_status}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};