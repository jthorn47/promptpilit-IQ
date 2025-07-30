import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter } from "lucide-react";
import { ContactsTable } from './ContactsTable';
import { ContactFilters } from './ContactFilters';
import { ContactFormModal } from './ContactFormModal';
import { ContactProfileDrawer } from './ContactProfileDrawer';
import { useGlobalContacts, GlobalContactFilters } from '../../hooks/useGlobalContacts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const GlobalContactsManager: React.FC = () => {
  const [filters, setFilters] = useState<GlobalContactFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { data: contactsData, isLoading, error } = useGlobalContacts(filters);

  const handleFiltersChange = (newFilters: GlobalContactFilters) => {
    setFilters({ ...newFilters, page: 0 }); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: 'name' | 'company' | 'updated_at', sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 0 }));
  };

  const contacts = contactsData?.contacts || [];
  const totalCount = contactsData?.totalCount || 0;
  const hasMore = contactsData?.hasMore || false;

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-destructive">
          Error loading contacts: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/crm">CRM</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contacts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Global Contacts</h1>
          <p className="text-muted-foreground">
            Manage all contacts across your CRM companies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalCount}</div>
            <div className="text-sm text-muted-foreground">Total Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.is_primary_contact).length}
            </div>
            <div className="text-sm text-muted-foreground">Primary Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.email).length}
            </div>
            <div className="text-sm text-muted-foreground">With Email</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.phone || c.mobile_phone).length}
            </div>
            <div className="text-sm text-muted-foreground">With Phone</div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <ContactsTable
            contacts={contacts}
            loading={isLoading}
            onContactClick={setSelectedContactId}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            currentPage={filters.page || 0}
            hasMore={hasMore}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />
        </CardContent>
      </Card>

      {/* Add Contact Modal */}
      <ContactFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode="create"
      />

      {/* Contact Profile Drawer */}
      <ContactProfileDrawer
        contactId={selectedContactId}
        open={!!selectedContactId}
        onClose={() => setSelectedContactId(null)}
      />
    </div>
  );
};