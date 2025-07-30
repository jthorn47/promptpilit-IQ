import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User } from "lucide-react";
import { useContacts } from "../hooks/useContacts";

export const ContactsManager: React.FC = () => {
  const { contacts, loading, searchContacts } = useContacts();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    searchContacts(searchTerm);
  };

  if (loading) {
    return <div className="p-6">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch} variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No contacts found
          </div>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <CardTitle className="text-lg">
                    {contact.first_name} {contact.last_name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                  {contact.phone && (
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  )}
                  <p className="text-sm font-medium">{contact.company}</p>
                  {contact.title && (
                    <p className="text-xs text-muted-foreground">{contact.title}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};