import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { ContactFormData, useContactMutations } from '../../hooks/useContactMutations';
import { ContactWithCompany, useContactFilterOptions } from '../../hooks/useGlobalContacts';
import { useCanAccessCompany } from '../../hooks/useContactPermissions';

interface ContactFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  contact?: ContactWithCompany | null;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  open,
  onClose,
  mode,
  contact
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const { createContact, updateContact } = useContactMutations();
  const { data: filterOptions } = useContactFilterOptions();
  const { data: canAccessCompany } = useCanAccessCompany(selectedCompanyId);

  const form = useForm<ContactFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile_phone: '',
      title: '',
      department: '',
      company_id: '',
      is_primary_contact: false,
      notes: ''
    }
  });

  // Reset form when modal opens/closes or contact changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && contact) {
        form.reset({
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email || '',
          phone: contact.phone || '',
          mobile_phone: contact.mobile_phone || '',
          title: contact.title || '',
          department: contact.department || '',
          company_id: contact.company_id,
          is_primary_contact: contact.is_primary_contact || false,
          notes: contact.notes || ''
        });
        setSelectedCompanyId(contact.company_id);
      } else {
        form.reset();
        setSelectedCompanyId('');
      }
    }
  }, [open, mode, contact, form]);

  const onSubmit = async (data: ContactFormData) => {
    if (!selectedCompanyId) {
      form.setError('company_id', { message: 'Please select a company' });
      return;
    }

    if (!canAccessCompany) {
      form.setError('company_id', { message: 'You do not have permission to add contacts to this company' });
      return;
    }

    try {
      if (mode === 'create') {
        await createContact.mutateAsync({ ...data, company_id: selectedCompanyId });
      } else if (contact) {
        await updateContact.mutateAsync({ 
          id: contact.id, 
          data: { ...data, company_id: selectedCompanyId }
        });
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    form.setValue('company_id', companyId);
  };

  const companies = filterOptions?.companies || [];
  const isLoading = createContact.isPending || updateContact.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Contact' : 'Edit Contact'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new contact. All contacts must be associated with a company.'
              : 'Update contact information.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Company Selection - Required First */}
            <FormField
              control={form.control}
              name="company_id"
              rules={{ required: 'Company is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company *</FormLabel>
                  <Select
                    onValueChange={handleCompanyChange}
                    value={selectedCompanyId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mobile_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Primary Contact Toggle */}
            <FormField
              control={form.control}
              name="is_primary_contact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Primary Contact</FormLabel>
                    <FormLabel className="text-sm text-muted-foreground">
                      Mark this as the primary contact for the company
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes about this contact..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Contact' : 'Update Contact'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};