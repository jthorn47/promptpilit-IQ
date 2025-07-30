import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Building, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  Phone, 
  Mail, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCrmCompanies, useCrmCompanyMutations } from "../hooks/useCrmCompanies";
import { ConversionManager } from "@/components/companies/ConversionManager";
import { StandardLayout } from "@/components/layouts/StandardLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 10;

const CompaniesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [convertingCompany, setConvertingCompany] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use the CRM companies hook with search filters
  const { data: companies, isLoading, refetch } = useCrmCompanies({
    search: searchTerm,
  });

  const filteredCompanies = companies?.filter(company => {
    const matchesStatus = statusFilter === "all" || company.status === statusFilter;
    return matchesStatus;
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'prospect':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'client':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleCompanyClick = (companyId: string) => {
    navigate(`/crm/companies/${companyId}`);
  };

  const handleConvertToClient = async (companyId: string, companyName: string) => {
    try {
      setConvertingCompany(companyId);
      
      const { data, error } = await supabase.rpc('migrate_company_to_client', {
        p_company_id: companyId,
        p_source: 'manual',
        p_converted_by: null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${companyName} has been converted to a client`,
      });

      // Refresh the companies list
      refetch();
      
    } catch (error: any) {
      console.error("Error converting company to client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert company to client",
        variant: "destructive",
      });
    } finally {
      setConvertingCompany(null);
    }
  };

  if (isLoading) {
    return (
      <StandardLayout 
        title="Companies"
        subtitle="Search and manage company prospects"
      >
        <div className="text-center py-8">Loading companies...</div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout 
      title="Companies"
      subtitle="Search and manage company prospects"
    >
      <div className="space-y-6">
        {/* Stats and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                  <p className="text-2xl font-bold text-primary">{companies?.length || 0}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Building className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {companies?.filter(c => c.status === 'lead').length || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prospects</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {companies?.filter(c => c.status === 'prospect').length || 0}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clients</p>
                  <p className="text-2xl font-bold text-green-700">
                    {companies?.filter(c => c.status === 'client').length || 0}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Manager */}
        <ConversionManager />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search companies by name or description..."
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
              variant={statusFilter === "lead" ? "default" : "outline"}
              onClick={() => setStatusFilter("lead")}
              size="sm"
            >
              Leads
            </Button>
            <Button
              variant={statusFilter === "prospect" ? "default" : "outline"}
              onClick={() => setStatusFilter("prospect")}
              size="sm"
            >
              Prospects
            </Button>
            <Button
              variant={statusFilter === "client" ? "default" : "outline"}
              onClick={() => setStatusFilter("client")}
              size="sm"
            >
              Clients
            </Button>
          </div>
        </div>

        {/* Companies Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompanies.map((company) => (
                  <TableRow 
                    key={company.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleCompanyClick(company.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {company.website && (
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {company.website}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(company.status || 'lead')} variant="outline">
                        {company.status || 'lead'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {company.industry || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {company.employee_count ? company.employee_count.toLocaleString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {company.annual_revenue ? (
                          <>
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">
                              {company.annual_revenue.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.risk_score !== null && company.risk_score !== undefined ? (
                        <Badge 
                          variant="outline" 
                          className={
                            company.risk_score > 7 
                              ? 'bg-red-500/10 text-red-700 border-red-200'
                              : company.risk_score > 4 
                              ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                              : 'bg-green-500/10 text-green-700 border-green-200'
                          }
                        >
                          {company.risk_score}/10
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompanyClick(company.id);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        {company.status !== 'client' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                                disabled={convertingCompany === company.id}
                              >
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Convert
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Convert to Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to convert {company.name} to a client? 
                                  This will create a new client record and update the company status.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleConvertToClient(company.id, company.name)}
                                  disabled={convertingCompany === company.id}
                                >
                                  {convertingCompany === company.id ? "Converting..." : "Convert"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredCompanies.length)} of {filteredCompanies.length} companies
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
      </div>
    </StandardLayout>
  );
};

export default CompaniesPage;