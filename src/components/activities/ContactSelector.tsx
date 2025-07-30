import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  is_primary: boolean | null;
}

interface ContactSelectorProps {
  companyId: string;
  value: string;
  onChange: (contactId: string, contactName: string) => void;
}

export const ContactSelector: React.FC<ContactSelectorProps> = ({
  companyId,
  value,
  onChange
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [companyId]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_contacts')
        .select('id, first_name, last_name, email, is_primary')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('is_primary', { ascending: false })
        .order('first_name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (value: string) => {
    if (value === 'no-contact') {
      onChange('', '');
    } else {
      // value is the contact name, find the contact by name
      const contact = contacts.find(c => `${c.first_name} ${c.last_name}` === value);
      if (contact) {
        const contactName = `${contact.first_name} ${contact.last_name}`;
        onChange(contact.id, contactName);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="contact">Contact (optional)</Label>
      <Select value={value} onValueChange={handleContactChange} disabled={loading}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading contacts..." : "Select contact"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-contact">No contact</SelectItem>
           {contacts.map((contact) => {
             const contactName = `${contact.first_name} ${contact.last_name}`;
             return (
               <SelectItem key={contact.id} value={contactName}>
                 <div className="flex items-center gap-2">
                   <User className="h-3 w-3" />
                   <div>
                     <span className="font-medium">
                       {contact.first_name} {contact.last_name}
                       {contact.is_primary && (
                         <span className="ml-1 text-xs text-primary">(Primary)</span>
                       )}
                     </span>
                     {contact.email && (
                       <div className="text-xs text-muted-foreground">{contact.email}</div>
                     )}
                   </div>
                 </div>
               </SelectItem>
             );
           })}
        </SelectContent>
      </Select>
    </div>
  );
};