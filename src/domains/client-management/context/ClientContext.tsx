import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Client, ClientFormData, ClientFilters, ClientMetrics } from '../types/client.types';
import { ClientService } from '../services/client.service';
import { useToast } from "@/hooks/use-toast";

interface ClientContextType {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  metrics: ClientMetrics | null;
  fetchClients: (filters?: ClientFilters) => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  createClient: (clientData: ClientFormData) => Promise<Client>;
  updateClient: (id: string, updates: any) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
  fetchMetrics: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const { toast } = useToast();

  const fetchClients = useCallback(async (filters?: ClientFilters) => {
    try {
      setLoading(true);
      const data = await ClientService.getClients(filters);
      setClients(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchClientById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const client = await ClientService.getClientById(id);
      setSelectedClient(client);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createClient = useCallback(async (clientData: ClientFormData): Promise<Client> => {
    try {
      const newClient = await ClientService.createClient(clientData);
      setClients(prev => [newClient, ...prev]);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      return newClient;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateClient = useCallback(async (id: string, updates: any): Promise<Client> => {
    try {
      const updatedClient = await ClientService.updateClient(id, updates);
      setClients(prev => prev.map(client => client.id === id ? updatedClient : client));
      if (selectedClient?.id === id) {
        setSelectedClient(updatedClient);
      }
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      return updatedClient;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
      throw error;
    }
  }, [selectedClient, toast]);

  const deleteClient = useCallback(async (id: string): Promise<void> => {
    try {
      await ClientService.deleteClient(id);
      setClients(prev => prev.filter(client => client.id !== id));
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
      throw error;
    }
  }, [selectedClient, toast]);

  const fetchMetrics = useCallback(async () => {
    try {
      const metricsData = await ClientService.getClientMetrics();
      setMetrics(metricsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch metrics",
        variant: "destructive",
      });
    }
  }, [toast]);

  const value: ClientContextType = {
    clients,
    selectedClient,
    loading,
    metrics,
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
    setSelectedClient,
    fetchMetrics,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};