import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  DollarSign, 
  FileText
} from "lucide-react";

interface Company {
  id: string;
  company_name: string;
  subscription_status: string;
  max_employees: number;
  primary_color: string;
  created_at: string;
}

interface Assessment {
  id: string;
  company_name: string;
  company_email: string;
  industry: string;
  company_size: string;
  risk_level: string;
  risk_score: number;
  created_at: string;
  responses?: any;
  ai_report?: any;
}

export const SalesRepDashboard = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalAssessments: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('company_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;

      // Fetch assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;

      setCompanies(companiesData || []);
      setAssessments(assessmentsData || []);

      // Calculate stats
      const totalCompanies = companiesData?.length || 0;
      const totalAssessments = assessmentsData?.length || 0;
      const activeSubscriptions = companiesData?.filter(c => c.subscription_status === 'active').length || 0;
      const totalRevenue = companiesData?.reduce((sum, company) => {
        // Estimate revenue based on max_employees and subscription status
        const basePrice = company.max_employees * 25; // $25 per employee estimate
        return company.subscription_status === 'active' ? sum + basePrice : sum;
      }, 0) || 0;

      setStats({
        totalCompanies,
        totalAssessments,
        totalRevenue,
        activeSubscriptions,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">Completed assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Companies Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Max Employees</TableHead>
                <TableHead>Assessment Date</TableHead>
                <TableHead>HR Blueprint Date</TableHead>
                <TableHead>Deal Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => {
                // Find the latest assessment for this company
                const companyAssessment = assessments.find(a => 
                  a.company_name.toLowerCase().includes(company.company_name.toLowerCase())
                );
                
                return (
                  <TableRow key={company.id}>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/admin/company/${company.id}`)}
                        className="font-medium text-primary hover:underline cursor-pointer"
                      >
                        {company.company_name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(company.subscription_status)}>
                        {company.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{company.max_employees}</TableCell>
                    <TableCell>
                      {companyAssessment ? 
                        new Date(companyAssessment.created_at).toLocaleDateString() : 
                        <span className="text-muted-foreground">No assessment</span>
                      }
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">Not created</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Prospecting</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
