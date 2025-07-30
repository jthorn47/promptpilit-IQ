import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Send, Loader2 } from 'lucide-react';
import { useContextualEmailService, EmailContext } from '@/hooks/useContextualEmailService';
import { supabase } from '@/integrations/supabase/client';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title?: string;
}

interface EmailComposerModalProps {
  open: boolean;
  onClose: () => void;
  mode: EmailContext;
  companyId?: string;
  contactId?: string;
  prefilledRecipient?: string;
  prefilledSubject?: string;
}

export const EmailComposerModal = ({
  open,
  onClose,
  mode,
  companyId,
  contactId,
  prefilledRecipient,
  prefilledSubject
}: EmailComposerModalProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [recipient, setRecipient] = useState(prefilledRecipient || '');
  const [subject, setSubject] = useState(prefilledSubject || '');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const { sending, sendCompanyEmail, sendContactEmail, sendDirectEmail } = useContextualEmailService();

  useEffect(() => {
    if (open) {
      if (mode === 'company' && companyId) {
        fetchCompanyContacts();
      } else if (mode === 'contact' && contactId) {
        fetchSpecificContact();
      }
      setRecipient(prefilledRecipient || '');
      setSubject(prefilledSubject || '');
      setBody('');
      setSelectedContact('');
    }
  }, [open, mode, companyId, contactId, prefilledRecipient, prefilledSubject]);

  const fetchCompanyContacts = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('id, first_name, last_name, email, job_title')
        .eq('company_id', companyId)
        .not('email', 'is', null)
        .order('first_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching company contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecificContact = async () => {
    if (!contactId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('id, first_name, last_name, email, job_title')
        .eq('id', contactId)
        .single();

      if (error) throw error;
      if (data) {
        setContacts([data]);
        setSelectedContact(data.id);
        setRecipient(data.email);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelection = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setSelectedContact(contactId);
      setRecipient(contact.email);
    }
  };

  const handleSend = async () => {
    if (!recipient || !subject || !body) return;

    let success = false;

    switch (mode) {
      case 'company':
        success = await sendCompanyEmail(companyId!, recipient, subject, body);
        break;
      case 'contact':
        success = await sendContactEmail(contactId!, recipient, subject, body);
        break;
      case 'direct':
        success = await sendDirectEmail(recipient, subject, body);
        break;
    }

    if (success) {
      onClose();
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'company':
        return 'Send Email to Company Contact';
      case 'contact':
        return 'Send Email to Contact';
      case 'direct':
        return 'Send Email';
      default:
        return 'Send Email';
    }
  };

  const isFormValid = recipient && subject && body;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {getModalTitle()}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Selection */}
          {mode === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="contact-select">Select Contact</Label>
              {loading ? (
                <div className="flex items-center gap-2 p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading contacts...</span>
                </div>
              ) : (
                <Select value={selectedContact} onValueChange={handleContactSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a contact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex flex-col">
                          <span className="truncate">{contact.first_name} {contact.last_name}</span>
                          <span className="text-sm text-muted-foreground truncate">{contact.email}</span>
                          {contact.job_title && (
                            <span className="text-xs text-muted-foreground truncate">{contact.job_title}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* To Field */}
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            {mode === 'direct' ? (
              <Input
                id="to"
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter email address..."
              />
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted flex-wrap sm:flex-nowrap">
                <span className="text-sm truncate flex-1">{recipient}</span>
                {mode === 'company' && (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">Company Contact</Badge>
                )}
                {mode === 'contact' && (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">Specific Contact</Badge>
                )}
              </div>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Body Field */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Context Info */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground">
              {mode === 'company' && 'This email will be sent only to contacts from this company.'}
              {mode === 'contact' && 'This email will be sent to the specific contact.'}
              {mode === 'direct' && 'This email can be sent to any valid email address.'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!isFormValid || sending}
              className="min-w-[100px]"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                  <span className="sm:hidden">Sending</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Send Email</span>
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};