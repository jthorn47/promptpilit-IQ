import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, Mail, ArrowRight, Building2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  status: string;
  company_name?: string;
}

interface GlobalContactSearchProps {
  placeholder?: string;
  className?: string;
  showHeader?: boolean;
}

export const GlobalContactSearch = ({ 
  placeholder = "Search contacts by name, email, or company...",
  className = "",
  showHeader = true
}: GlobalContactSearchProps) => {
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recent contacts on mount
  useEffect(() => {
    fetchRecentContacts();
  }, []);

  const fetchRecentContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select(`
          *,
          company_settings:company_id (
            company_name
          )
        `)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const contactsWithCompany = data?.map(contact => ({
        ...contact,
        company_name: (contact.company_settings as any)?.company_name
      })) || [];
      
      setRecentContacts(contactsWithCompany);
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
    }
  };

  const searchContacts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setContacts([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select(`
          *,
          company_settings:company_id (
            company_name
          )
        `)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .eq('status', 'active')
        .order('is_primary', { ascending: false })
        .order('last_name', { ascending: true })
        .limit(10);

      if (error) throw error;
      
      const contactsWithCompany = data?.map(contact => ({
        ...contact,
        company_name: (contact.company_settings as any)?.company_name
      })) || [];
      
      setContacts(contactsWithCompany);
    } catch (error) {
      console.error('Error searching contacts:', error);
      toast({
        title: "Search Error",
        description: "Failed to search contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) {
        searchContacts(query);
      } else {
        setContacts([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleContactClick = (contact: Contact) => {
    navigate(`/admin/companies/${contact.company_id}?tab=contacts&highlight=${contact.id}`);
    setIsOpen(false);
    setQuery("");
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 text-yellow-900 font-medium">{part}</mark> : 
        part
    );
  };

  const displayContacts = query ? contacts : recentContacts;
  const shouldShowResults = isOpen && (query || recentContacts.length > 0);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {showHeader && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Find Contact</h2>
          <p className="text-sm text-muted-foreground">
            Search across all company contacts
          </p>
        </div>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {shouldShowResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching contacts...
              </div>
            ) : displayContacts.length > 0 ? (
              <>
                {!query && (
                  <div className="p-3 border-b bg-muted/50">
                    <p className="text-sm font-medium text-muted-foreground">
                      Recent Contacts
                    </p>
                  </div>
                )}
                <div className="py-2">
                  {displayContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactClick(contact)}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors"
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
                              {query ? (
                                <>
                                  {highlightText(contact.first_name, query)} {highlightText(contact.last_name, query)}
                                </>
                              ) : (
                                `${contact.first_name} ${contact.last_name}`
                              )}
                            </p>
                            {contact.is_primary && (
                              <Badge variant="secondary" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          {contact.job_title && (
                            <p className="text-sm text-muted-foreground">
                              {contact.job_title}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-1">
                            {contact.email && (
                              <p className="text-sm text-muted-foreground">
                                {query ? highlightText(contact.email, query) : contact.email}
                              </p>
                            )}
                            {contact.company_name && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {contact.company_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.phone && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${contact.phone}`);
                            }}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        {contact.email && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`mailto:${contact.email}`);
                            }}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : query ? (
              <div className="p-4 text-center text-muted-foreground">
                No contacts found for "{query}"
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No recent contacts
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};