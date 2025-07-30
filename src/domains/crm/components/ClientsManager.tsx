import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Building, Calendar, User, DollarSign, FileText, Phone, Mail, Eye, ChevronLeft, ChevronRight, Tag as TagIcon } from "lucide-react";
import { TagList } from "@/components/ui/tag";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CompanyWizardDialog } from "@/components/companies/CompanyWizardDialog";

interface Client {
  id: string;
  deal_id: string;
  company_name: string;
  date_won: string;
  original_deal_owner: string;
  key_contacts: any;
  services_purchased: any;
  onboarding_status: string;
  contract_value: number;
  currency: string;
  contract_start_date?: string;
  contract_end_date?: string;
  account_manager?: string;
  status: string;
  notes?: string;
  linked_documents: any;
  created_at: string;
  updated_at: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
    type?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

const ClientsManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('date_won', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Clients fetched successfully:', data?.length || 0, 'records');
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      
      // More detailed error logging
      if (error?.message) {
        console.error('Error message:', error.message);
      }
      if (error?.details) {
        console.error('Error details:', error.details);
      }
      if (error?.hint) {
        console.error('Error hint:', error.hint);
      }
      
      toast({
        title: "Error",
        description: `Failed to fetch clients: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'churned':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOnboardingStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOnboardingStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/admin/crm/clients/${clientId}`);
  };

  const handleCreateCompany = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .insert([{
          company_name: formData.company_name,
          contract_value: formData.contract_value,
          currency: formData.currency,
          lifecycle_stage: formData.lifecycle_stage,
          onboarding_status: formData.onboarding_status,
          date_won: formData.lifecycle_stage === 'client' ? new Date().toISOString().split('T')[0] : null,
          notes: formData.notes || `Company created manually`,
          account_manager: formData.account_manager,
          primary_contact_phone: formData.primary_contact_phone,
          service_type: formData.service_type,
          subscription_status: 'active',
          industry: formData.industry,
          website: formData.website,
          employee_count: formData.employee_count,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code
        }])
        .select()
        .single();

      if (error) throw error;

      // If lifecycle_stage is 'client', the trigger will automatically create a client record
      if (formData.lifecycle_stage === 'client') {
        // Refresh clients list to show the new client
        fetchClients();
      }

      toast({
        title: "Success", 
        description: formData.lifecycle_stage === 'client' 
          ? "Company created and automatically added to clients"
          : "Company created successfully",
      });
      return true;
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Stats and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-primary">{clients.length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-green-700">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contract Value</p>
                <p className="text-2xl font-bold text-purple-700">
                  ${clients.reduce((sum, c) => sum + c.contract_value, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Onboarding Complete</p>
                <p className="text-2xl font-bold text-orange-700">
                  {clients.filter(c => c.onboarding_status === 'completed').length}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-2">Companies you've closed and are now servicing</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "paused" ? "default" : "outline"}
            onClick={() => setStatusFilter("paused")}
            size="sm"
          >
            Paused
          </Button>
          <Button
            variant={statusFilter === "churned" ? "default" : "outline"}
            onClick={() => setStatusFilter("churned")}
            size="sm"
          >
            Churned
          </Button>
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Date Won</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow 
                  key={client.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleClientClick(client.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Building className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{client.company_name}</div>
                        <div className="text-xs text-muted-foreground">Client ID: {client.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(client.status)} variant="outline">
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {client.tags && client.tags.length > 0 ? (
                        <TagList
                          tags={client.tags}
                          size="sm"
                          maxVisible={2}
                        />
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <TagIcon className="h-3 w-3" />
                          <span>No tags</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">
                        {client.contract_value.toLocaleString()} {client.currency}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(client.date_won).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getOnboardingStatusColor(client.onboarding_status)} variant="outline">
                      {getOnboardingStatusText(client.onboarding_status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientClick(client.id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle contact action
                        }}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle manage action
                        }}
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredClients.length)} of {filteredClients.length} clients
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No clients found matching your criteria.</p>
            <p className="text-sm text-muted-foreground/70">
              Companies become clients when their lifecycle stage is set to "Client - Active". Start by creating companies in the Companies section.
            </p>
          </CardContent>
        </Card>
      )}

      <CompanyWizardDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleCreateCompany}
      />
    </div>
  );
};

export default ClientsManager;