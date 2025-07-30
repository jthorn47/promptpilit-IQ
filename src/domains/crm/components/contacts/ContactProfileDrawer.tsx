import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Edit } from "lucide-react";
import { useContactProfile } from '../../hooks/useContactProfile';

interface ContactProfileDrawerProps {
  contactId: string | null;
  open: boolean;
  onClose: () => void;
}

export const ContactProfileDrawer: React.FC<ContactProfileDrawerProps> = ({
  contactId,
  open,
  onClose
}) => {
  const { data: profileData, isLoading } = useContactProfile(contactId || '');
  const contact = profileData;

  if (!contactId) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Contact Details</SheetTitle>
          <SheetDescription>
            View contact information and related data
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-8">Loading contact details...</div>
        ) : contact ? (
          <div className="space-y-6 mt-6">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                {contact.first_name} {contact.last_name}
              </h2>
              {contact.title && (
                <Badge variant="secondary">{contact.title}</Badge>
              )}
              {contact.is_primary_contact && (
                <Badge className="ml-2">Primary Contact</Badge>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
              )}
              {(contact.phone || contact.mobile_phone) && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone || contact.mobile_phone}</span>
                </div>
              )}
            </div>

            {/* Company Info */}
            {contact.company && (
              <div className="space-y-2">
                <h3 className="font-semibold">Company</h3>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{contact.company.name}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div className="space-y-2">
                <h3 className="font-semibold">Notes</h3>
                <p className="text-sm text-muted-foreground">{contact.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Contact
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Contact not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};