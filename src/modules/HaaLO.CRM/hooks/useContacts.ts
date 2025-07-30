import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchContacts = async (filters?: { search?: string; company?: string }) => {
    setLoading(true);
    try {
      // For now, return mock data since contacts table may not exist
      const mockContacts: Contact[] = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          company: 'Acme Corp',
          title: 'CEO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@techcorp.com',
          phone: '+1987654321',
          company: 'Tech Corp',
          title: 'CTO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      let filteredContacts = mockContacts;
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredContacts = mockContacts.filter(contact =>
          contact.first_name.toLowerCase().includes(searchTerm) ||
          contact.last_name.toLowerCase().includes(searchTerm) ||
          contact.email.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.company) {
        filteredContacts = filteredContacts.filter(contact =>
          contact.company.toLowerCase().includes(filters.company!.toLowerCase())
        );
      }
      
      setContacts(filteredContacts);
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