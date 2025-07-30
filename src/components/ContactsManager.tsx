import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, User, Mail, Phone, Building, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContactCSVImport } from "./ContactCSVImport";
import { isValidPhone, formatPhoneAsYouType } from "@/utils/security";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  company_size?: string;
  source?: string;
  status: string;
  lead_score: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const ContactsManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalContacts, setTotalContacts] = useState(0);
  
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    job_title: "",
    industry: "",
    company_size: "",
    source: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, [currentPage, itemsPerPage, statusFilter, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Build base query
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
      }
      
      // Apply pagination and ordering
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setContacts(data || []);
      setTotalContacts(count || 0);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    try {
      if (!newContact.first_name || !newContact.last_name || !newContact.email) {
        toast({
          title: "Error",
          description: "Please fill in required fields (name and email)",
          variant: "destructive",
        });
        return;
      }

      // Validate phone if provided
      if (newContact.phone && !isValidPhone(newContact.phone)) {
        toast({
          title: "Error",
          description: "Please enter a valid 10-digit phone number",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('leads')
        .insert([{
          ...newContact,
          lead_score: calculateContactScore(newContact)
        }]);

      if (error) throw error;

      toast({
        title: "SUCCESS!",
        description: "New contact added successfully",
      });

      setShowAddDialog(false);
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_name: "",
        job_title: "",
        industry: "",
        company_size: "",
        source: "",
        notes: ""
      });
      fetchContacts();
    } catch (error: any) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const calculateContactScore = (contact: any) => {
    let score = 0;
    if (contact.company_name) score += 20;
    if (contact.job_title?.toLowerCase().includes('director') || contact.job_title?.toLowerCase().includes('manager')) score += 30;
    if (contact.company_size === '50-200' || contact.company_size === '200+') score += 25;
    if (contact.phone) score += 15;
    if (contact.industry) score += 10;
    return Math.min(score, 100);
  };

  const handleConvertToDeal = async (contact: Contact) => {
    try {
      // Convert contact to deal
      const { error: dealError } = await supabase
        .from('deals')
        .insert([{
          title: `${contact.company_name || 'New Opportunity'} - ${contact.first_name} ${contact.last_name}`,
          company_name: contact.company_name || 'Unknown Company',
          contact_name: `${contact.first_name} ${contact.last_name}`,
          contact_email: contact.email,
          value: 0, // Will need to be updated later
          stage_id: (await supabase.from('deal_stages').select('id').eq('name', 'Lead').single()).data?.id,
          probability: 10,
          lead_id: contact.id,
          notes: contact.notes
        }]);

      if (dealError) throw dealError;

      // Update contact status
      const { error: contactError } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', contact.id);

      if (contactError) throw contactError;

      toast({
        title: "Success",
        description: "Contact converted to deal successfully",
      });

      fetchContacts();
    } catch (error: any) {
      console.error('Error converting contact:', error);
      toast({
        title: "Error",
        description: "Failed to convert contact to deal",
        variant: "destructive",
      });
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(totalContacts / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalContacts);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts Management</h1>
          <p className="text-gray-600">Track and manage your business contacts</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Enter the contact's information to add them to your system
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={newContact.first_name}
                  onChange={(e) => setNewContact({...newContact, first_name: e.target.value})}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={newContact.last_name}
                  onChange={(e) => setNewContact({...newContact, last_name: e.target.value})}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newContact.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneAsYouType(e.target.value);
                    setNewContact({...newContact, phone: formatted});
                    setPhoneError("");
                  }}
                  onBlur={() => {
                    if (newContact.phone && !isValidPhone(newContact.phone)) {
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
              <div className="space-y-2">
                <Label htmlFor="company_name">Company</Label>
                <Input
                  id="company_name"
                  value={newContact.company_name}
                  onChange={(e) => setNewContact({...newContact, company_name: e.target.value})}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={newContact.job_title}
                  onChange={(e) => setNewContact({...newContact, job_title: e.target.value})}
                  placeholder="HR Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={newContact.industry} onValueChange={(value) => setNewContact({...newContact, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Select value={newContact.company_size} onValueChange={(value) => setNewContact({...newContact, company_size: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Contact Source</Label>
                <Select value={newContact.source} onValueChange={(value) => setNewContact({...newContact, source: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="How did you find them?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="trade-show">Trade Show</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                  placeholder="Any additional notes about this contact..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContact}>
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CSV Import */}
      <ContactCSVImport />

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {startItem}-{endItem} of {totalContacts} contacts
          </div>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNumber > totalPages) return null;
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({totalContacts} total in database)</CardTitle>
          <CardDescription>Manage your business contacts - Showing {contacts.length} on this page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex items-center space-x-6 flex-1">
                    <div>
                      <h4 className="font-medium">{contact.first_name} {contact.last_name}</h4>
                      <p className="text-sm text-gray-600">{contact.company_name}</p>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">{contact.job_title || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={
                      contact.status === 'new' ? 'default' : 
                      contact.status === 'qualified' ? 'default' : 
                      contact.status === 'converted' ? 'default' : 'secondary'
                    }
                    className={
                      contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      contact.status === 'qualified' ? 'bg-green-100 text-green-800' :
                      contact.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {contact.status}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Score: {contact.lead_score}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {contact.status !== 'converted' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleConvertToDeal(contact)}
                    >
                      Convert to Deal
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No contacts found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};