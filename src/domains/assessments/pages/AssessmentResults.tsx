import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { supabase } from "@/integrations/supabase/client";
import { Search, Calendar, TrendingUp, AlertTriangle, CheckCircle, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Assessment {
  id: string;
  company_name: string;
  company_email: string;
  company_size: string;
  industry: string;
  risk_score: number;
  risk_level: string;
  status: string;
  created_at: string;
  responses: any;
  ai_report?: any;
}

export default function AssessmentResults() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
      toast({
        title: "Error",
        description: "Failed to load assessments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Moderate Risk':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'High Risk':
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk':
        return 'success';
      case 'Moderate Risk':
        return 'warning';
      case 'High Risk':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.company_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || assessment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Company Name', 'Email', 'Industry', 'Company Size', 'Risk Score', 'Risk Level', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredAssessments.map(assessment => [
        assessment.company_name,
        assessment.company_email,
        assessment.industry,
        assessment.company_size,
        assessment.risk_score,
        assessment.risk_level,
        assessment.status,
        format(new Date(assessment.created_at), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-results-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BreadcrumbNav items={[
        { label: "Admin", href: "/admin" },
        { label: "Assessments", href: "/admin/assessments" },
        { label: "Results" }
      ]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Results</h1>
          <p className="text-muted-foreground">Review and analyze completed risk assessments</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by company name, email, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid gap-4">
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' 
                  ? "Try adjusting your search filters"
                  : "No assessments have been completed yet"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{assessment.company_name}</h3>
                      <Badge variant={getRiskColor(assessment.risk_level) as any} className="flex items-center gap-1">
                        {getRiskIcon(assessment.risk_level)}
                        {assessment.risk_level}
                      </Badge>
                      <Badge variant="outline">{assessment.status}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{assessment.company_email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Industry:</span>
                        <p className="font-medium">{assessment.industry}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <p className="font-medium">{assessment.company_size}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium">{format(new Date(assessment.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Risk Score:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={assessment.risk_score} className="w-24 h-2" />
                          <span className="text-sm font-medium">{assessment.risk_score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-auto bg-white w-full">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getRiskIcon(selectedAssessment.risk_level)}
                    {selectedAssessment.company_name} - Assessment Details
                  </CardTitle>
                  <CardDescription>
                    Completed on {format(new Date(selectedAssessment.created_at), 'MMMM dd, yyyy')}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedAssessment(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Company Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Email:</span> {selectedAssessment.company_email}</p>
                    <p><span className="text-muted-foreground">Industry:</span> {selectedAssessment.industry}</p>
                    <p><span className="text-muted-foreground">Company Size:</span> {selectedAssessment.company_size}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Risk Score:</span>
                      <Progress value={selectedAssessment.risk_score} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{selectedAssessment.risk_score}%</span>
                    </div>
                    <p className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Risk Level:</span>
                      <Badge variant={getRiskColor(selectedAssessment.risk_level) as any}>
                        {selectedAssessment.risk_level}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {selectedAssessment.ai_report && (
                <div>
                  <h4 className="font-semibold mb-2">AI Generated Report</h4>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(selectedAssessment.ai_report, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}