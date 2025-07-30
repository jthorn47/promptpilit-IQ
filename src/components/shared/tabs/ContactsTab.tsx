import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, Plus, Edit, Star, Trash2, ArrowRight } from "lucide-react";
import { ProfileEmailButton } from "@/components/email/ProfileEmailButton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidPhone, formatPhoneAsYouType } from "@/utils/security";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  is_primary: boolean;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ContactsTabProps {
  companyId: string;
  readonly?: boolean;
}

interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  notes: string;
  is_primary: boolean;
  status: string;
}

export const ContactsTab = ({ 
  companyId, 
  readonly = false 
}: ContactsTabProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    notes: '',
    is_primary: false,
    status: 'active'
  });

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchContacts();
    }
  }, [companyId]);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      job_title: '',
      notes: '',
      is_primary: false,
      status: 'active'
    });
    setEditingContact(null);
    setPhoneError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    // Validate phone if provided
    if (formData.phone && !isValidPhone(formData.phone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('company_contacts')
          .update(formData)
          .eq('id', editingContact.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact updated successfully"
        });
      } else {
        // Create new contact
        const { error } = await supabase
          .from('company_contacts')
          .insert({
            ...formData,
            company_id: companyId
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact added successfully"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save contact",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      job_title: contact.job_title || '',
      notes: contact.notes || '',
      is_primary: contact.is_primary,
      status: contact.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('company_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Contact deleted successfully"
      });
      
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    }
  };

  const handleSetPrimary = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('company_contacts')
        .update({ is_primary: true })
        .eq('id', contactId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Primary contact updated"
      });
      
      fetchContacts();
    } catch (error) {
      console.error('Error setting primary contact:', error);
      toast({
        title: "Error",
        description: "Failed to update primary contact",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Contacts</CardTitle>
          <CardDescription>Loading contacts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Key Contacts</CardTitle>
            <CardDescription>
              Contact details for this organization ({contacts.length} contacts)
            </CardDescription>
          </div>
          {!readonly && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingContact ? 'Edit Contact' : 'Add New Contact'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneAsYouType(e.target.value);
                        setFormData(prev => ({ ...prev, phone: formatted }));
                        setPhoneError("");
                      }}
                      onBlur={() => {
                        if (formData.phone && !isValidPhone(formData.phone)) {
                          setPhoneError("Please enter a valid 10-digit phone number");
                        } else {
                          setPhoneError("");
                        }
                      }}
                      placeholder="(555) 123-4567"
                      className={phoneError ? "border-destructive" : ""}
                    />
                    {phoneError && (
                      <p className="text-sm text-destructive">{phoneError}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_primary"
                      checked={formData.is_primary}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_primary">Set as primary contact</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingContact ? 'Update Contact' : 'Add Contact'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts && contacts.length > 0 ? (
            contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <User className="h-8 w-8 text-muted-foreground" />
                    {contact.is_primary && (
                      <Star className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 fill-current" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    {contact.job_title && (
                      <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                    )}
                    {contact.email && (
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    )}
                    {contact.phone && (
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {contact.phone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${contact.phone}`}>
                        <Phone className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {contact.email && (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`mailto:${contact.email}`}>
                          <Mail className="h-3 w-3" />
                        </a>
                      </Button>
                      <ProfileEmailButton
                        mode="contact"
                        contactId={contact.id}
                        prefilledRecipient={contact.email}
                        prefilledSubject={`Hello ${contact.first_name}`}
                        size="sm"
                        variant="outline"
                      />
                    </>
                  )}
                  {!readonly && (
                    <>
                      {!contact.is_primary && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSetPrimary(contact.id)}
                          title="Set as primary contact"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(contact.id)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No contacts available</p>
              {!readonly && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4" onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Contact
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};