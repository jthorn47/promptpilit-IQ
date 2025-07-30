import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  Search, 
  Plus, 
  Users,
  DollarSign,
  Calendar,
  Eye,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Company = {
  id: string;
  company_name: string;
  lifecycle_stage?: string;
  industry?: string;
  company_size?: string;
  created_at: string;
  updated_at?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  account_manager?: string;
  contract_value?: number;
  currency?: string;
  service_type?: string;
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'client':
      return 'default';
    case 'prospect':
      return 'secondary';
    case 'lead':
      return 'outline';
    default:
      return 'outline';
  }
};

export const HaaloCompanies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    totalRevenue: 0
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching companies from company_settings table...');
      
      const { data, error, count } = await supabase
        .from('company_settings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1000); // Limit to first 1000 for performance

      console.log('📊 Supabase response:', { data: data?.length, error, count });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Companies fetched successfully:', data?.length || 0, 'records out of', count, 'total');
      console.log('📋 Sample company:', data?.[0]);
      
      setCompanies(data || []);
      
      // Calculate stats based on lifecycle_stage
      const total = count || 0;
      const clients = data?.filter(c => c.lifecycle_stage === 'client').length || 0;
      const leads = data?.filter(c => c.lifecycle_stage === 'lead').length || 0;
      const prospects = data?.filter(c => c.lifecycle_stage === 'prospect').length || 0;
      const totalRevenue = data?.reduce((sum, c) => sum + (c.contract_value || 0), 0) || 0;
      
      console.log('📈 Stats calculated:', { total, clients, leads, prospects, totalRevenue });
      
      setStats({ total, active: clients, trial: leads, totalRevenue });
    } catch (error: any) {
      console.error('💥 Error fetching companies:', error);
      toast.error(`Failed to fetch companies: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage and monitor all companies in the HaaLO system
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total.toLocaleString()}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-green-600">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.active.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leads</p>
                <p className="text-2xl font-bold text-blue-600">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.trial.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${(stats.totalRevenue / 1000000).toFixed(1)}M`}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Directory ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading companies...</span>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? `No companies found matching "${searchTerm}"` : 'No companies found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span>{company.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(company.lifecycle_stage || 'lead') as any}>
                        {company.lifecycle_stage || 'lead'}
                      </Badge>
                    </TableCell>
                    <TableCell>{company.industry || 'N/A'}</TableCell>
                    <TableCell>{company.company_size || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{company.primary_contact_name || 'N/A'}</div>
                        <div className="text-muted-foreground">{company.primary_contact_email || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HaaloCompanies;