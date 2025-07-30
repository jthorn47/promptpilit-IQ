import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ContactWithCompany } from '../../hooks/useGlobalContacts';
import { useContactMutations } from '../../hooks/useContactMutations';
import { useContactPermissions } from '../../hooks/useContactPermissions';
import { formatDistanceToNow } from 'date-fns';
import { ContactFormModal } from './ContactFormModal';

interface ContactsTableProps {
  contacts: ContactWithCompany[];
  loading: boolean;
  onContactClick: (contactId: string) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: 'name' | 'company' | 'updated_at', sortOrder: 'asc' | 'desc') => void;
  currentPage: number;
  hasMore: boolean;
  sortBy?: 'name' | 'company' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  loading,
  onContactClick,
  onPageChange,
  onSortChange,
  currentPage,
  hasMore,
  sortBy,
  sortOrder
}) => {
  const [editingContact, setEditingContact] = useState<ContactWithCompany | null>(null);
  const [deletingContact, setDeletingContact] = useState<ContactWithCompany | null>(null);
  const { deleteContact } = useContactMutations();

  const getSortIcon = (column: 'name' | 'company' | 'updated_at') => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleSort = (column: 'name' | 'company' | 'updated_at') => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newOrder);
  };

  const handleDeleteContact = async () => {
    if (!deletingContact) return;
    
    try {
      await deleteContact.mutateAsync(deletingContact.id);
      setDeletingContact(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                Contact Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Primary</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('company')}
            >
              <div className="flex items-center gap-2">
                Company
                {getSortIcon('company')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('updated_at')}
            >
              <div className="flex items-center gap-2">
                Last Updated
                {getSortIcon('updated_at')}
              </div>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No contacts found
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onView={() => onContactClick(contact.id)}
                onEdit={() => setEditingContact(contact)}
                onDelete={() => setDeletingContact(contact)}
              />
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {contacts.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} • {contacts.length} contacts
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasMore}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      <ContactFormModal
        open={!!editingContact}
        onClose={() => setEditingContact(null)}
        mode="edit"
        contact={editingContact}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingContact?.first_name} {deletingContact?.last_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContact}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteContact.isPending}
            >
              {deleteContact.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface ContactRowProps {
  contact: ContactWithCompany;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ContactRow: React.FC<ContactRowProps> = ({ contact, onView, onEdit, onDelete }) => {
  const { data: permissions } = useContactPermissions(contact.id, contact.company_id);
  const perms = permissions || { canView: false, canEdit: false, canDelete: false };

  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={onView}>
      <TableCell>
        <div className="font-medium">
          {contact.first_name} {contact.last_name}
        </div>
        {contact.department && (
          <div className="text-sm text-muted-foreground">{contact.department}</div>
        )}
      </TableCell>
      <TableCell>
        {contact.title && (
          <Badge variant="secondary" className="text-xs">
            {contact.title}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3" />
              {contact.email}
            </div>
          )}
          {(contact.phone || contact.mobile_phone) && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3" />
              {contact.phone || contact.mobile_phone}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {contact.is_primary_contact && (
          <Badge className="bg-primary/10 text-primary">Primary</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{contact.company?.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(contact.updated_at), { addSuffix: true })}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {perms.canView && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            {perms.canEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Contact
              </DropdownMenuItem>
            )}
            {perms.canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Contact
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};