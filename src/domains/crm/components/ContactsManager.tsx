import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, Building } from "lucide-react";
import { useState } from "react";
import { useContacts } from "../hooks";

export const ContactsManager = () => {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your contact database</p>
        </div>
        <Button>
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {contact.first_name} {contact.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                {contact.company}
              </div>
              
              {contact.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {contact.email}
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {contact.phone}
                </div>
              )}

              {contact.source && (
                <Badge variant="secondary" className="text-xs">
                  {contact.source}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No contacts found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};