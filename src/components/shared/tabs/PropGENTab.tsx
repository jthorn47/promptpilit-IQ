import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Calculator, 
  MessageSquare, 
  FileText, 
  Eye, 
  RefreshCw, 
  Download, 
  Plus,
  Upload,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  ArrowRight,
  Heart,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from '@/hooks/use-mobile';
import { EmbeddedAssessmentForm } from '@/components/hr-assessment/EmbeddedAssessmentForm';
import { AssessmentResults } from '@/components/hr-assessment/AssessmentResults';
import { PDFUploadAssessment } from '@/components/hr-assessment/PDFUploadAssessment';
import PropGENWorkflowStatus from '@/components/PropGENWorkflowStatus';
import { usePropGENWorkflow } from '@/hooks/usePropGENWorkflow';
import '@/styles/mobile.css';

interface PropGENTabProps {
  companyId: string;
  companyName: string;
}

interface Assessment {
  id: string;
  company_name: string;
  risk_score: number;
  risk_level: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentAnalysis {
  id: string;
  company_id: string;
  calculated_ee_admin_cost: number;
  total_hard_costs: number;
  total_soft_costs: number;
  risk_adjustment: number;
  created_at: string;
  updated_at: string;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  version: number;
  created_at: string;
  sent_at?: string;
}

// Helper function to map max_employees to assessment company size format
const mapEmployeeCountToSizeRange = (maxEmployees: number): string => {
  if (maxEmployees <= 10) return "1-10";
  if (maxEmployees <= 50) return "11-50";
  if (maxEmployees <= 100) return "51-100";
  if (maxEmployees <= 500) return "101-500";
  if (maxEmployees <= 1000) return "501-1000";
  return "1000+";
};

// Helper function to map service_type to industry (basic mapping)
const mapServiceTypeToIndustry = (serviceType?: string): string => {
  if (!serviceType) return "";
  
  switch (serviceType.toLowerCase()) {
    case "healthcare":
    case "hro":
      return "healthcare";
    case "manufacturing":
      return "manufacturing";
    case "retail":
      return "retail";
    case "education":
    case "lms":
      return "education";
    case "finance":
    case "banking":
      return "finance";
    case "technology":
    case "tech":
      return "technology";
    case "hospitality":
      return "hospitality";
    case "construction":
      return "construction";
    case "government":
      return "government";
    case "nonprofit":
    case "non-profit":
      return "nonprofit";
    default:
      return "other";
  }
};

export const PropGENTab = ({ companyId, companyName }: PropGENTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState("assessment");
  const [assessment, setAssessment] = useState<any>(null);
  const [investmentAnalysis, setInvestmentAnalysis] = useState<InvestmentAnalysis | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalApprovals, setProposalApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [showEmbeddedForm, setShowEmbeddedForm] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isSuperAdmin } = useAuth();
  const [companyData, setCompanyData] = useState<any>(null);
  
  // PropGEN Workflow Integration
  const { 
    workflow, 
    generateSpinContent, 
    saveInvestmentAnalysis, 
    requestProposalApproval,
    markProposalSent,
    isProcessing 
  } = usePropGENWorkflow(companyId);

  useEffect(() => {
    fetchCompanyData();
    fetchPropGENData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      const { data } = await supabase
        .from('company_settings')
        .select('max_employees, service_type, industry_type, industry')
        .eq('id', companyId)
        .maybeSingle();
      
      setCompanyData(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  const fetchPropGENData = async () => {
    try {
      setLoading(true);

      // Fetch latest assessment from both assessments and company_hr_assessments tables
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('company_name', companyName)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch latest HR assessment from company_hr_assessments table
      const { data: hrAssessmentData } = await supabase
        .from('company_hr_assessments')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Use the most recent assessment from either table
      let latestAssessment = null;
      if (assessmentData && hrAssessmentData) {
        const assessmentDate = new Date(assessmentData.created_at);
        const hrAssessmentDate = new Date(hrAssessmentData.created_at);
        latestAssessment = hrAssessmentDate > assessmentDate ? hrAssessmentData : assessmentData;
      } else {
        latestAssessment = hrAssessmentData || assessmentData;
      }

      // Fetch latest investment analysis
      const { data: analysisData } = await supabase
        .from('investment_analysis')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch proposals for this company
      const { data: proposalData } = await supabase
        .from('proposals')
        .select('id, title, status, version, created_at, sent_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Fetch proposal approvals
      const { data: approvalData } = await supabase
        .from('proposal_approvals')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      setAssessment(latestAssessment);
      setInvestmentAnalysis(analysisData);
      setProposals(proposalData || []);
      setProposalApprovals(approvalData || []);
    } catch (error) {
      console.error('Error fetching PropGEN data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch PropGEN data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitProposalForApproval = async (proposalId: string) => {
    try {
      // Get current user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', user?.id)
        .single();

      const proposalData = {
        proposal_id: proposalId,
        company_id: companyId,
        submitted_by: user?.id,
        risk_score: assessment?.risk_score,
        investment_analysis: investmentAnalysis ? {
          currentAdminCost: investmentAnalysis.calculated_ee_admin_cost,
          easeworksAdminCost: investmentAnalysis.calculated_ee_admin_cost * 0.7, // Estimated
          projectedROI: 30 // Estimated 30% ROI
        } : null,
        proposal_data: {
          companyName,
          proposalId,
          submittedAt: new Date().toISOString()
        }
      };

      const { error: insertError } = await supabase
        .from('proposal_approvals')
        .insert(proposalData);

      if (insertError) throw insertError;

      // Send notification email
      await supabase.functions.invoke('send-proposal-approval-notification', {
        body: {
          companyName,
          repName: profile?.email || 'Unknown Rep',
          riskScore: assessment?.risk_score,
          investmentAnalysis: proposalData.investment_analysis,
          proposalId,
          submittedBy: user?.id
        }
      });

      toast({
        title: "Proposal Submitted for Approval",
        description: "Admin has been notified and will review your proposal shortly.",
      });

      fetchPropGENData(); // Refresh data
    } catch (error) {
      console.error('Error submitting proposal for approval:', error);
      toast({
        title: "Error",
        description: "Failed to submit proposal for approval",
        variant: "destructive",
      });
    }
  };

  const approveProposal = async (approvalId: string) => {
    try {
      const { error } = await supabase
        .from('proposal_approvals')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (error) throw error;

      toast({
        title: "Proposal Approved",
        description: "The proposal has been approved and actions are now unlocked.",
      });

      fetchPropGENData(); // Refresh data
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast({
        title: "Error",
        description: "Failed to approve proposal",
        variant: "destructive",
      });
    }
  };

  const isProposalApproved = (proposalId: string) => {
    return proposalApprovals.some(
      approval => approval.proposal_id === proposalId && approval.status === 'approved'
    );
  };

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'sent':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'draft':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const generateSPINContent = () => {
    if (!assessment || !investmentAnalysis) return null;

    return {
      situation: `${companyName} currently handles HR administration manually, with estimated costs of ${formatCurrency(investmentAnalysis.calculated_ee_admin_cost)} annually.`,
      problem: `Based on our assessment, your organization has a ${assessment.risk_level} risk profile with a score of ${assessment.risk_score}/100, indicating potential compliance and efficiency challenges.`,
      implication: `Without proper HR systems, you're exposed to compliance risks, inefficient processes, and potential costs that could reach ${formatCurrency(investmentAnalysis.calculated_ee_admin_cost * 1.5)} with penalties and inefficiencies.`,
      needPayoff: `Our comprehensive HR solution would streamline your processes, reduce compliance risks, and could save you up to ${formatCurrency(investmentAnalysis.calculated_ee_admin_cost * 0.3)} annually while improving employee satisfaction and reducing administrative burden.`
    };
  };

  const renderRiskAssessmentTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            HR Risk Assessment
          </CardTitle>
          <CardDescription>
            Comprehensive risk analysis and compliance evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assessment ? (
            <div className="space-y-4">
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-3 gap-4'}`}>
                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Risk Score</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-2xl font-bold ${isMobile ? 'mobile-text-large' : ''}`}>{assessment.risk_score}/100</span>
                    {assessment.risk_score < 50 ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : assessment.risk_score < 75 ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Risk Level</Label>
                  <div className="mt-1">
                    <Badge className={getRiskLevelColor(assessment.risk_level)} variant="outline">
                      {assessment.risk_level}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Status</Label>
                  <div className="mt-1">
                    <Badge className={getAssessmentStatusColor(assessment.status)} variant="outline">
                      {assessment.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Completed</Label>
                <p className="font-medium">{format(new Date(assessment.updated_at), 'PPP')}</p>
              </div>
              
              {/* Assessment Results Display */}
              <div className="mt-6">
                <AssessmentResults 
                  assessment={assessment}
                  onStartNew={() => setShowEmbeddedForm(true)}
                  onViewDetails={() => {
                    toast({
                      title: "Assessment Details",
                      description: "Viewing detailed assessment results",
                    });
                  }}
                  companyName={companyName}
                />
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowEmbeddedForm(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowPDFUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF Assessment
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {!showEmbeddedForm && !showPDFUpload ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No risk assessment completed yet</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowEmbeddedForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                    <Button variant="outline" onClick={() => setShowPDFUpload(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Existing Assessment
                    </Button>
                  </div>
                </div>
              ) : null}
              
              {/* Embedded Assessment Form */}
              {showEmbeddedForm && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Complete HR Risk Assessment</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowEmbeddedForm(false)}>
                      Cancel
                    </Button>
                  </div>
                  <EmbeddedAssessmentForm 
                    companyId={companyId}
                    companyName={companyName}
                    initialIndustry={companyData?.industry || companyData?.industry_type || mapServiceTypeToIndustry(companyData?.service_type)}
                    initialCompanySize={companyData?.max_employees ? mapEmployeeCountToSizeRange(companyData.max_employees) : undefined}
                    onComplete={(assessmentData) => {
                      setAssessment(assessmentData);
                      setShowEmbeddedForm(false);
                      toast({
                        title: "Assessment Completed!",
                        description: "Assessment saved and linked to proposal tools.",
                      });
                      // Refresh all PropGEN data to update other tabs
                      fetchPropGENData();
                    }}
                    onCancel={() => setShowEmbeddedForm(false)}
                  />
                </div>
              )}
              
              {/* PDF Upload Component */}
              {showPDFUpload && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Upload Existing Assessment</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowPDFUpload(false)}>
                      Cancel
                    </Button>
                  </div>
                  <PDFUploadAssessment 
                    companyId={companyId}
                    companyName={companyName}
                    onComplete={(assessmentData) => {
                      setAssessment(assessmentData);
                      setShowPDFUpload(false);
                      toast({
                        title: "Assessment Uploaded!",
                        description: "Assessment saved and linked to proposal tools.",
                      });
                      // Refresh all PropGEN data to update other tabs
                      fetchPropGENData();
                    }}
                    onCancel={() => setShowPDFUpload(false)}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderInvestmentAnalysisTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment Analysis
          </CardTitle>
          <CardDescription>
            EE Administration cost calculations and ROI projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {investmentAnalysis ? (
            <div className="space-y-4">
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                <div className="space-y-3">
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Total EE Admin Cost</Label>
                    <p className={`text-2xl font-bold text-primary ${isMobile ? 'mobile-text-large' : ''}`}>
                      {formatCurrency(investmentAnalysis.calculated_ee_admin_cost)}
                    </p>
                  </div>
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Hard Costs</Label>
                    <p className={`font-medium ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(investmentAnalysis.total_hard_costs)}</p>
                  </div>
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Soft Costs</Label>
                    <p className={`font-medium ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(investmentAnalysis.total_soft_costs)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Risk Adjustment</Label>
                    <p className={`font-medium ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(investmentAnalysis.risk_adjustment)}</p>
                  </div>
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Potential Savings</Label>
                    <p className={`font-medium text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      {formatCurrency(investmentAnalysis.calculated_ee_admin_cost * 0.3)}
                    </p>
                  </div>
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>ROI Timeline</Label>
                    <p className={`font-medium ${isMobile ? 'mobile-text-medium' : ''}`}>12-18 months</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <p className="font-medium">{format(new Date(investmentAnalysis.updated_at), 'PPP')}</p>
              </div>
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-semibold mb-3">Analysis Breakdown</h4>
                <div className={`grid grid-cols-1 ${isMobile ? 'propgen-metrics-mobile gap-3' : 'md:grid-cols-2 gap-4'} text-sm`}>
                  <div>
                    <span className={`font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Current Annual Cost:</span>
                    <p className={`font-bold text-lg ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(investmentAnalysis.calculated_ee_admin_cost)}</p>
                  </div>
                  <div>
                    <span className={`font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>With EaseWorks (30% savings):</span>
                    <p className={`font-bold text-lg text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      {formatCurrency(investmentAnalysis.calculated_ee_admin_cost * 0.7)}
                    </p>
                  </div>
                  <div>
                    <span className={`font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Annual Savings:</span>
                    <p className={`font-bold text-lg text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      {formatCurrency(investmentAnalysis.calculated_ee_admin_cost * 0.3)}
                    </p>
                  </div>
                  <div>
                    <span className={`font-medium text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Monthly Savings:</span>
                    <p className={`font-bold text-lg text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      {formatCurrency((investmentAnalysis.calculated_ee_admin_cost * 0.3) / 12)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  toast({
                    title: "Recalculating Analysis",
                    description: "Investment analysis will be updated with latest data",
                  });
                  fetchPropGENData();
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recalculate
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No investment analysis completed yet</p>
              <Button onClick={() => navigate(`/admin/proposals/propgen?company_id=${companyId}&company_name=${encodeURIComponent(companyName)}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSpinBuilderTab = () => {
    const spinContent = generateSPINContent();
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SPIN Selling Builder
          </CardTitle>
          <CardDescription>
            Auto-generated sales talking points based on assessment and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {spinContent ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="font-medium text-blue-700">Situation</Label>
                  <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                    {spinContent.situation}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-orange-700">Problem</Label>
                  <p className="text-sm bg-orange-50 p-3 rounded-lg border border-orange-200">
                    {spinContent.problem}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-red-700">Implication</Label>
                  <p className="text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {spinContent.implication}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-green-700">Need-Payoff</Label>
                  <p className="text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                    {spinContent.needPayoff}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  toast({
                    title: "Regenerating SPIN Content",
                    description: "New talking points generated based on latest assessment data",
                  });
                  fetchPropGENData();
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate from Risk Score
                </Button>
                <Button size="sm" onClick={() => navigate('/admin/proposals/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Include in Proposal
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Complete assessment and investment analysis to generate SPIN content
              </p>
              <Button disabled variant="outline">
                Generate SPIN Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderBenefitsComparisonTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Benefits Comparison
          </CardTitle>
          <CardDescription>
            Compare Easeworks vs current benefits setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Benefits comparison analysis coming soon</p>
            <Button onClick={() => navigate(`/admin/proposals/propgen?company_id=${companyId}&company_name=${encodeURIComponent(companyName)}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Configure Benefits
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAdditionalFeesTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Additional Fees
          </CardTitle>
          <CardDescription>
            Select and configure optional service fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Configure additional service fees and optional add-ons</p>
            <Button onClick={() => navigate(`/admin/proposals/propgen?company_id=${companyId}&company_name=${encodeURIComponent(companyName)}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Configure Fees
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProposalDraftsTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposal Drafts
          </CardTitle>
          <CardDescription>
            Generated proposals and approval workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposals.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {proposals.map((proposal) => {
                  const approved = isProposalApproved(proposal.id);
                  const pendingApproval = proposalApprovals.find(
                    approval => approval.proposal_id === proposal.id && approval.status === 'pending'
                  );

                  return (
                    <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{proposal.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getProposalStatusColor(proposal.status)} variant="outline">
                              {proposal.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">v{proposal.version}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                            </span>
                            
                            {/* Approval Status */}
                            {approved ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : pendingApproval ? (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200" variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Awaiting Approval
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 border-red-200" variant="outline">
                                <Lock className="h-3 w-3 mr-1" />
                                Awaiting Admin Approval
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/proposals/${proposal.id}/edit`)}>
                          <Eye className="h-3 w-3 mr-2" />
                          View
                        </Button>
                        
                        {/* Conditional Actions Based on Approval Status */}
                        {approved ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => {
                              toast({
                                title: "Download initiated",
                                description: "Proposal download will start shortly",
                              });
                            }}>
                              <Download className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </>
                        ) : pendingApproval ? (
                          <>
                            {isSuperAdmin && (
                              <Button 
                                size="sm" 
                                onClick={() => approveProposal(pendingApproval.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Approve
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled
                              className="opacity-50 cursor-not-allowed"
                            >
                              <Lock className="h-3 w-3 mr-2" />
                              Locked
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => submitProposalForApproval(proposal.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Submit for Approval
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled
                              className="opacity-50 cursor-not-allowed"
                            >
                              <Lock className="h-3 w-3 mr-2" />
                              Locked
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button className="w-full" onClick={() => navigate('/admin/proposals/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Proposal
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No proposals created yet</p>
              <Button onClick={() => navigate('/admin/proposals/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Proposal
              </Button>
            </div>
          )}
          
          {/* Approval History Section for Super Admins */}
          {isSuperAdmin && proposalApprovals.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Approval History
              </h4>
              <div className="space-y-2">
                {proposalApprovals.map((approval) => (
                  <div key={approval.id} className="text-sm p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Proposal ID: {approval.proposal_id}</span>
                      <Badge className={approval.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {approval.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      Submitted: {format(new Date(approval.submitted_at), 'PPp')}
                      {approval.approved_at && (
                        <span> • Approved: {format(new Date(approval.approved_at), 'PPp')}</span>
                      )}
                    </div>
                    {approval.risk_score && (
                      <div className="text-muted-foreground">
                        Risk Score: {approval.risk_score}/100
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading PropGEN data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        {/* Clean Progress Flow Bar - No borders */}
        <div className="relative">
          {/* Soft gradient background */}
          <div className="w-full h-16 bg-gradient-to-r from-[#E4E0F5] to-[#655DC6] rounded-lg"></div>
          
          {/* Tab navigation overlay - flat text over gradient */}
          <div className={`absolute inset-0 flex items-center ${isMobile ? 'justify-around px-1' : 'justify-between px-4'}`}>
            {[
              { value: 'assessment', label: '1. Assessment', icon: Shield },
              { value: 'investment-analysis', label: '2. Investment Analysis', icon: Calculator },
              { value: 'benefits-comparison', label: '3. Benefits Comparison', icon: Heart },
              { value: 'additional-fees', label: '4. Additional Fees', icon: DollarSign },
              { value: 'spin-selling', label: '5. SPIN Selling', icon: MessageSquare },
              { value: 'proposal', label: '6. Proposal', icon: FileText }
            ].map((tab, index, array) => (
              <div key={tab.value} className="flex items-center gap-2">
                {/* Tab button - clean, no background boxes */}
                <button
                  onClick={() => setActiveSubTab(tab.value)}
                  className={`
                    flex flex-col items-center gap-1 text-center transition-all duration-200 group
                    ${activeSubTab === tab.value 
                      ? 'text-white font-semibold transform scale-105' 
                      : 'text-white/75 hover:text-white font-medium hover:scale-102'
                    }
                  `}
                >
                  <tab.icon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} whitespace-nowrap`}>
                    {isMobile ? tab.label.split('.')[1]?.trim() || tab.label : tab.label}
                  </span>
                  {/* Subtle active indicator */}
                  {activeSubTab === tab.value && (
                    <div className="w-full h-0.5 bg-white rounded-full mt-1 opacity-90"></div>
                  )}
                </button>
                
                {/* Bold directional arrow */}
                {index < array.length - 1 && (
                  <ArrowRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-white/60`} strokeWidth={2} />
                )}
              </div>
            ))}
          </div>
        </div>

        <TabsContent value="assessment" className="space-y-6 mt-6">
          {renderRiskAssessmentTab()}
        </TabsContent>
        
        <TabsContent value="investment-analysis" className="space-y-6 mt-6">
          {renderInvestmentAnalysisTab()}
        </TabsContent>
        
        <TabsContent value="benefits-comparison" className="space-y-6 mt-6">
          {renderBenefitsComparisonTab()}
        </TabsContent>
        
        <TabsContent value="additional-fees" className="space-y-6 mt-6">
          {renderAdditionalFeesTab()}
        </TabsContent>
        
        <TabsContent value="spin-selling" className="space-y-6 mt-6">
          {renderSpinBuilderTab()}
        </TabsContent>
        
        <TabsContent value="proposal" className="space-y-6 mt-6">
          {renderProposalDraftsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};