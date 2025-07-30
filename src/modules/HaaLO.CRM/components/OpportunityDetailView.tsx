import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Calendar,
  FileText,
  CheckCircle,
  Users,
  AlertTriangle,
  Edit,
  Save,
  X,
  Plus,
  Eye,
  XCircle,
  Zap
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  company_name: string;
  company_id?: string;
  assigned_rep: string;
  deal_value: number;
  stage: string;
  close_probability: number;
  forecast_close_date: string;
  created_at: string;
  updated_at: string;
  // SPIN Selling fields
  spin_situation?: string;
  spin_problem?: string;
  spin_implication?: string;
  spin_need_payoff?: string;
  // Risk assessment
  risk_score?: number;
  risk_level?: string;
  // Proposal
  proposal_status?: string;
  proposal_id?: string;
}

interface Task {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  status: string;
  assigned_to: string;
}

interface RiskAssessment {
  id: string;
  score: number;
  level: string;
  last_updated: string;
  key_risks: string[];
  recommendations: string[];
}

export const OpportunityDetailView = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("spin");
  const [editingSpin, setEditingSpin] = useState(false);
  const [isPropGenModalOpen, setIsPropGenModalOpen] = useState(false);
  const [spinData, setSpinData] = useState({
    situation: '',
    problem: '',
    implication: '',
    need_payoff: ''
  });

  // Mock SPIN content state
  const spinContent = {
    situation: opportunity?.spin_situation,
    problem: opportunity?.spin_problem,
    implication: opportunity?.spin_implication,
    need_payoff: opportunity?.spin_need_payoff
  };

  // Check if PropGEN requirements are met
  const canGenerateProposal = () => {
    if (!spinContent || !opportunity) return false;
    
    const spinComplete = 
      spinContent.situation && 
      spinContent.problem && 
      spinContent.implication && 
      spinContent.need_payoff;
    
    const riskLinked = riskAssessment?.score;
    
    return spinComplete && riskLinked && !opportunity.proposal_id;
  };

  // Mock handlers for proposal actions
  const handleMarkProposalSent = () => {
    console.log('Mark proposal sent');
  };

  const handleMarkProposalSigned = () => {
    console.log('Mark proposal signed');
  };

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunityData();
    }
  }, [opportunityId]);

  const fetchOpportunityData = async () => {
    if (!opportunityId) return;
    
    try {
      setLoading(true);
      
      // Mock opportunity data (would connect to actual deals table)
      const mockOpportunity: Opportunity = {
        id: opportunityId,
        title: 'HRO Conversion',
        company_name: 'Acme Corp',
        company_id: 'comp-123',
        assigned_rep: 'Larry William',
        deal_value: 18500,
        stage: 'Proposal Sent',
        close_probability: 70,
        forecast_close_date: '2025-08-12',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        spin_situation: 'Client uses Gusto for payroll with no HRIS.',
        spin_problem: "They've missed multiple compliance deadlines.",
        spin_implication: 'Legal and financial risk exposure increasing.',
        spin_need_payoff: 'Switching to our ASO would reduce risk + admin time.',
        risk_score: 87,
        risk_level: 'High',
        proposal_status: 'Sent',
        proposal_id: 'prop-456'
      };
      
      setOpportunity(mockOpportunity);
      setSpinData({
        situation: mockOpportunity.spin_situation || '',
        problem: mockOpportunity.spin_problem || '',
        implication: mockOpportunity.spin_implication || '',
        need_payoff: mockOpportunity.spin_need_payoff || ''
      });

      // Mock tasks
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Follow up on proposal',
          due_date: '2025-01-30',
          priority: 'High',
          status: 'To Do',
          assigned_to: 'Larry William'
        },
        {
          id: '2', 
          title: 'Schedule demo call',
          due_date: '2025-02-01',
          priority: 'Medium',
          status: 'In Progress',
          assigned_to: 'Larry William'
        }
      ];
      setTasks(mockTasks);

      // Mock risk assessment
      const mockRisk: RiskAssessment = {
        id: 'risk-789',
        score: 87,
        level: 'High',
        last_updated: '2025-01-25',
        key_risks: ['Compliance deadlines', 'Legal exposure', 'Financial penalties'],
        recommendations: ['Immediate ASO implementation', 'Compliance audit', 'Legal review']
      };
      setRiskAssessment(mockRisk);

    } catch (error: any) {
      console.error('Error fetching opportunity data:', error);
      toast({
        title: "Error",
        description: "Failed to load opportunity data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSpinData = async () => {
    if (!opportunity) return;

    try {
      // Mock update - would connect to actual database
      setOpportunity({
        ...opportunity,
        spin_situation: spinData.situation,
        spin_problem: spinData.problem,
        spin_implication: spinData.implication,
        spin_need_payoff: spinData.need_payoff
      });

      toast({
        title: "Success",
        description: "SPIN data updated successfully"
      });
      setEditingSpin(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update SPIN data",
        variant: "destructive"
      });
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'lead': return 'bg-gray-500';
      case 'prospect': return 'bg-blue-500';
      case 'assessment done': return 'bg-yellow-500';
      case 'proposal sent': return 'bg-orange-500';
      case 'verbal': return 'bg-green-500';
      case 'closed/won': return 'bg-emerald-500';
      case 'closed/lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Opportunity not found</h2>
        <Button onClick={() => navigate('/admin/crm/deals')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deals
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/crm/deals')}
            className="hover-scale"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Opportunity Details</h1>
            <p className="text-muted-foreground">Manage deal progression and SPIN selling</p>
          </div>
        </div>
      </div>

      {/* Opportunity Header Card */}
      <Card className="hover-scale">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Opportunity</label>
                <h2 className="text-2xl font-bold">{opportunity.title}</h2>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="text-lg font-medium">{opportunity.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rep</label>
                <p className="text-lg">{opportunity.assigned_rep}</p>
              </div>
            </div>

            {/* Middle Column - Financial */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deal Value</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    ${opportunity.deal_value.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stage</label>
                <Badge className={`${getStageColor(opportunity.stage)} text-white`}>
                  {opportunity.stage}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Close Probability</label>
                <div className="flex items-center gap-2">
                  <Progress value={opportunity.close_probability} className="flex-1" />
                  <span className="text-sm font-medium">{opportunity.close_probability}%</span>
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Forecast Close</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {new Date(opportunity.forecast_close_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {riskAssessment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Risk Score</label>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRiskColor(riskAssessment.level)} text-white`}>
                      {riskAssessment.score}
                    </Badge>
                    <span className="text-sm">{riskAssessment.level} Risk</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spin">SPIN Selling</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* SPIN Selling Tab */}
        <TabsContent value="spin" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SPIN Selling Analysis</CardTitle>
                  <CardDescription>Situation, Problem, Implication, Need-Payoff methodology</CardDescription>
                </div>
                <Button 
                  variant={editingSpin ? "default" : "outline"}
                  onClick={() => {
                    if (editingSpin) {
                      updateSpinData();
                    } else {
                      setEditingSpin(true);
                    }
                  }}
                >
                  {editingSpin ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit SPIN
                    </>
                  )}
                </Button>
                {editingSpin && (
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      setEditingSpin(false);
                      setSpinData({
                        situation: opportunity.spin_situation || '',
                        problem: opportunity.spin_problem || '',
                        implication: opportunity.spin_implication || '',
                        need_payoff: opportunity.spin_need_payoff || ''
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Situation */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold mb-2">
                  📌 Situation
                </label>
                {editingSpin ? (
                  <Textarea
                    value={spinData.situation}
                    onChange={(e) => setSpinData({...spinData, situation: e.target.value})}
                    placeholder="Describe the client's current situation..."
                    rows={3}
                  />
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{opportunity.spin_situation || 'No situation defined'}</p>
                  </div>
                )}
              </div>

              {/* Problem */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold mb-2">
                  🔥 Problem
                </label>
                {editingSpin ? (
                  <Textarea
                    value={spinData.problem}
                    onChange={(e) => setSpinData({...spinData, problem: e.target.value})}
                    placeholder="Identify the key problems..."
                    rows={3}
                  />
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{opportunity.spin_problem || 'No problem defined'}</p>
                  </div>
                )}
              </div>

              {/* Implication */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold mb-2">
                  🚨 Implication
                </label>
                {editingSpin ? (
                  <Textarea
                    value={spinData.implication}
                    onChange={(e) => setSpinData({...spinData, implication: e.target.value})}
                    placeholder="Explain the implications of not solving the problem..."
                    rows={3}
                  />
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{opportunity.spin_implication || 'No implication defined'}</p>
                  </div>
                )}
              </div>

              {/* Need-Payoff */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold mb-2">
                  💰 Need-Payoff
                </label>
                {editingSpin ? (
                  <Textarea
                    value={spinData.need_payoff}
                    onChange={(e) => setSpinData({...spinData, need_payoff: e.target.value})}
                    placeholder="Describe the value and benefits of the solution..."
                    rows={3}
                  />
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{opportunity.spin_need_payoff || 'No need-payoff defined'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Linked Risk Assessment</CardTitle>
              <CardDescription>Compliance and risk analysis preview</CardDescription>
            </CardHeader>
            <CardContent>
              {riskAssessment ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full ${getRiskColor(riskAssessment.level)} flex items-center justify-center text-white text-xl font-bold`}>
                          {riskAssessment.score}
                        </div>
                        <p className="text-sm font-medium mt-2">{riskAssessment.level} Risk</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Risk Assessment Results</h4>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date(riskAssessment.last_updated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Key Risk Areas</h5>
                      <ul className="space-y-1">
                        {riskAssessment.key_risks.map((risk, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {riskAssessment.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Risk Assessment</h3>
                  <p className="text-muted-foreground mb-4">
                    Run a risk assessment to see compliance recommendations
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Run Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proposal Tab */}
        <TabsContent value="proposal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Proposal Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PropGEN Requirements Check */}
              {!canGenerateProposal() && !opportunity.proposal_id && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Requirements for PropGEN proposal generation:</p>
                      <div className="space-y-1 ml-4">
                        <div className="flex items-center gap-2 text-sm">
                          {spinContent?.situation && spinContent?.problem && spinContent?.implication && spinContent?.need_payoff ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span>Complete SPIN Selling content (all 4 sections)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {riskAssessment?.score ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span>Linked Risk Assessment</span>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* PropGEN Generation Button */}
              {canGenerateProposal() && (
                <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-lg">
                  <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">PropGEN Ready!</h3>
                  <p className="text-muted-foreground mb-4">
                    All requirements met. Generate a professional proposal with AI-powered PropGEN.
                  </p>
                  <Button 
                    onClick={() => setIsPropGenModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-primary/80"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Proposal with PropGEN
                  </Button>
                </div>
              )}

              {/* Existing Proposal */}
              {opportunity.proposal_id && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Proposal Generated</h3>
                  <p className="text-muted-foreground mb-4">
                    Proposal #{opportunity.proposal_id} - Status: {opportunity.proposal_status}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline">View Proposal</Button>
                    <Button>Mark as Sent</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks & Follow-ups</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover-scale">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(task.due_date).toLocaleDateString()}
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PropGEN Modal - TODO: Implement when ready */}
      {isPropGenModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">PropGEN Integration</h2>
            <p className="text-muted-foreground mb-4">
              PropGEN modal would appear here with SPIN content and risk assessment data.
            </p>
            <Button onClick={() => setIsPropGenModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};