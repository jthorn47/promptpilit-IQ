import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Building, MapPin, Users, Phone, Mail, Edit, Trash2, Calendar, DollarSign, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProfileEmailButton } from "@/components/email/ProfileEmailButton";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Company {
  id: string;
  company_name: string;
  industry?: string;
  company_size?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  lifecycle_stage?: string;
  contract_value?: number;
  created_at: string;
  // Legacy properties for backward compatibility
  name?: string;
  size?: string;
  location?: string;
  website?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'prospect';
  employees?: number;
  revenue?: string;
  createdAt?: string;
}

export const CompaniesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();

  // Fetch companies from database
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching companies from company_settings table...');
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Limit for performance

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Companies fetched successfully:', data?.length || 0, 'records');
      
      // Transform data to match component interface
      const transformedCompanies: Company[] = (data || []).map(company => ({
        id: company.id,
        company_name: company.company_name,
        industry: company.industry || 'Unknown',
        company_size: String(company.employee_count || 'Unknown'), // Using employee_count as size
        primary_contact_name: 'N/A', // Not available in company_settings
        primary_contact_email: 'N/A', // Not available in company_settings  
        primary_contact_phone: company.primary_contact_phone || 'N/A',
        lifecycle_stage: company.lifecycle_stage || 'lead',
        contract_value: company.contract_value || 0,
        created_at: company.created_at,
        // Legacy properties for compatibility
        name: company.company_name,
        size: String(company.employee_count || 'Unknown'),
        location: `${company.city || ''} ${company.state || ''}`.trim() || 'N/A',
        website: company.website || 'N/A',
        phone: company.primary_contact_phone || company.phone || 'N/A',
        email: 'N/A', // Not available in company_settings
        status: company.lifecycle_stage === 'client' ? 'active' : 
               company.lifecycle_stage === 'prospect' ? 'prospect' : 'prospect',
        employees: company.employee_count || 0,
        revenue: company.contract_value ? `$${company.contract_value.toLocaleString()}` : 'N/A',
        createdAt: company.created_at.split('T')[0] // Format date
      }));
      
      setCompanies(transformedCompanies);
      toast.success(`Loaded ${transformedCompanies.length} companies from database`);
    } catch (error: any) {
      console.error('💥 Error fetching companies:', error);
      toast.error(`Failed to fetch companies: ${error?.message || 'Unknown error'}`);
      setCompanies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const name = company.company_name || company.name || '';
    const industry = company.industry || '';
    const location = company.location || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter || 
                         (statusFilter === 'active' && company.lifecycle_stage === 'client') ||
                         (statusFilter === 'prospect' && company.lifecycle_stage === 'prospect');
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'prospect': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Small': return 'bg-yellow-100 text-yellow-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'Large': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditCompany = (company: Company) => {
    // Navigate to the company details page instead of just setting state
    navigate(`/admin/connectiq/companies/${company.id}`);
  };

  const handleDeleteCompany = (company: Company) => {
    toastHook({
      title: "Delete Company",
      description: `Are you sure you want to delete ${company.company_name || company.name}?`,
      variant: "destructive",
    });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading companies...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const displayName = company.company_name || company.name || 'Unknown Company';
            return (
              <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {displayName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {company.location || 'Location not available'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={company.lifecycle_stage === 'client' ? 'default' : 'secondary'}
                      className="shrink-0"
                    >
                      {company.lifecycle_stage || 'prospect'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Company Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Industry</span>
                      <p className="font-medium">{company.industry || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size</span>
                      <p className="font-medium">{company.size || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(company.primary_contact_name !== 'N/A' || company.phone !== 'N/A') && (
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {company.primary_contact_name !== 'N/A' ? company.primary_contact_name : 'Contact'}
                        </span>
                      </div>
                      {company.phone !== 'N/A' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Revenue */}
                  {company.revenue !== 'N/A' && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">{company.revenue}</span>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(company.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/admin/connectiq/companies/${company.id}`)}
                    >
                      View Profile
                    </Button>
                    <ProfileEmailButton
                      mode="company"
                      companyId={company.id}
                      prefilledSubject={`Regarding ${displayName}`}
                      variant="outline"
                      size="sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCompany(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Get started by adding your first company'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
};