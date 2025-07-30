import { useState, useEffect } from 'react';
import { crmAPI } from '../api';
import { Contact } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchContacts = async (filters?: { search?: string; company?: string }) => {
    setLoading(true);
    try {
      const data = await crmAPI.getContacts(filters);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchContacts = async (searchTerm: string) => {
    await fetchContacts({ search: searchTerm });
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    fetchContacts,
    searchContacts,
  };
};