import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Building2,
  Mail,
  Users as UsersIcon,
  Copy,
  Link
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Assessment {
  id: string;
  company_name: string;
  company_email: string;
  company_size: string;
  industry: string;
  risk_score: number;
  risk_level: string;
  ai_report: any;
  created_at: string;
}

export const AdminAssessments = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchTerm, riskFilter, industryFilter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    let filtered = assessments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.company_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk level filter
    if (riskFilter !== "all") {
      filtered = filtered.filter(a => a.risk_level.toLowerCase() === riskFilter);
    }

    // Industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(a => a.industry === industryFilter);
    }

    setFilteredAssessments(filtered);
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low risk': return 'default';
      case 'moderate risk': return 'secondary';
      case 'high risk': return 'destructive';
      default: return 'outline';
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Company Name', 'Email', 'Industry', 'Size', 'Risk Score', 'Risk Level', 'Date'].join(','),
      ...filteredAssessments.map(a => [
        a.company_name,
        a.company_email,
        a.industry,
        a.company_size,
        a.risk_score,
        a.risk_level,
        new Date(a.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-assessments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAssessmentLink = () => {
    const assessmentUrl = `${window.location.origin}/assessment`;
    navigator.clipboard.writeText(assessmentUrl).then(() => {
      toast({
        title: "Assessment Link Copied",
        description: "The assessment link has been copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy assessment link to clipboard.",
        variant: "destructive",
      });
    });
  };

  const uniqueIndustries = [...new Set(assessments.map(a => a.industry))];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Assessments</h1>
        <div className="text-center py-8">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Assessment Management</h1>
        <Button onClick={exportToCSV} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high risk">High Risk</SelectItem>
                <SelectItem value="moderate risk">Moderate Risk</SelectItem>
                <SelectItem value="low risk">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {uniqueIndustries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredAssessments.length} of {assessments.length} assessments
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Table/Cards */}
      <Card>
        <CardContent className="p-0">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assessments found matching your criteria.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>AI Report</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assessment.company_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {assessment.company_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            {assessment.industry}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            {assessment.company_size}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-lg font-bold">{assessment.risk_score}</div>
                            <div className="text-xs text-muted-foreground">out of 100</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(assessment.risk_level)}>
                            {assessment.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {new Date(assessment.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {assessment.ai_report ? (
                            <Badge variant="default" className="text-xs">
                              Generated
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Not Generated
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedAssessment(assessment)}
                            className="min-h-[44px]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {filteredAssessments.map((assessment) => (
                  <Card key={assessment.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{assessment.company_name}</h3>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {assessment.company_email}
                          </div>
                        </div>
                        <Badge variant={getRiskBadgeVariant(assessment.risk_level)} className="ml-2">
                          {assessment.risk_level}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="truncate">{assessment.industry}</span>
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="truncate">{assessment.company_size}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-lg font-bold text-primary mr-1">{assessment.risk_score}</span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          {assessment.ai_report ? (
                            <Badge variant="default" className="text-xs">
                              AI Report Generated
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              No AI Report
                            </Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAssessment(assessment)}
                          className="min-h-[44px] px-6"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-auto bg-white w-full mx-4 md:mx-0">
            <CardHeader className="border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <CardTitle className="text-xl md:text-2xl">{selectedAssessment.company_name}</CardTitle>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="truncate">{selectedAssessment.company_email}</span>
                    </span>
                    <span className="flex items-center">
                      <Building2 className="h-3 w-3 mr-1" />
                      <span className="truncate">{selectedAssessment.industry}</span>
                    </span>
                    <span className="flex items-center">
                      <UsersIcon className="h-3 w-3 mr-1" />
                      <span className="truncate">{selectedAssessment.company_size}</span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAssessment(null)}
                  className="min-h-[44px] min-w-[44px] flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary">{selectedAssessment.risk_score}</div>
                    <div className="text-sm text-muted-foreground">Risk Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Badge variant={getRiskBadgeVariant(selectedAssessment.risk_level)} className="text-sm md:text-lg px-3 md:px-4 py-1 md:py-2">
                      {selectedAssessment.risk_level}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-2">Risk Level</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-base md:text-lg font-medium">{new Date(selectedAssessment.created_at).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">Assessment Date</div>
                  </CardContent>
                </Card>
              </div>

              {selectedAssessment.ai_report && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">AI Generated Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm md:text-base">
                      {typeof selectedAssessment.ai_report === 'string' 
                        ? selectedAssessment.ai_report 
                        : selectedAssessment.ai_report.report || JSON.stringify(selectedAssessment.ai_report, null, 2)
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};