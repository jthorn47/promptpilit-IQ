import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useDeals } from '../hooks/useDeals';
import { Deal } from '@/domains/crm/types';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  FileText,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Users,
  BarChart3,
  Lightbulb,
  MessageSquare,
  CheckSquare,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface EnhancedDeal extends Deal {
  company_settings?: {
    id: string;
    company_name: string;
  };
  risk_assessment?: {
    id: string;
    risk_score: number;
    risk_level: string;
  };
}

const PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-800' },
  { value: 'prospect', label: 'Prospect', color: 'bg-blue-100 text-blue-800' },
  { value: 'assessment_complete', label: 'Assessment Complete', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'proposal_sent', label: 'Proposal Sent', color: 'bg-orange-100 text-orange-800' },
  { value: 'verbal', label: 'Verbal', color: 'bg-purple-100 text-purple-800' },
  { value: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
];

const PRODUCT_LINES = [
  { value: 'HRO', label: 'HRO (Human Resources Outsourcing)' },
  { value: 'Staffing', label: 'Staffing' },
  { value: 'LMS', label: 'LMS (Learning Management)' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Other', label: 'Other' }
];

export const OpportunitiesManager: React.FC = () => {
  const { deals, loading, fetchDeals, createDeal, updateDeal } = useDeals();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<EnhancedDeal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  // Form state for new/edit opportunity
  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    value: '',
    probability: '',
    expected_close_date: '',
    product_line: '',
    stage_id: 'lead',
    contact_name: '',
    contact_email: '',
    notes: '',
    spin_situation: '',
    spin_problem: '',
    spin_implication: '',
    spin_need_payoff: ''
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  // Mock enhanced data (in real implementation, this would come from database joins)
  const enhancedDeals: EnhancedDeal[] = deals.map(deal => ({
    ...deal,
    company_settings: {
      id: deal.company_id || 'unknown',
      company_name: deal.company_name
    },
    risk_assessment: (deal as any).risk_assessment_id ? {
      id: (deal as any).risk_assessment_id,
      risk_score: Math.floor(Math.random() * 100),
      risk_level: Math.random() > 0.5 ? 'high' : 'medium'
    } : undefined
  }));

  const filteredOpportunities = enhancedDeals.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'all' || opp.stage_id === selectedStage;
    return matchesSearch && matchesStage;
  });

  const getStageBadge = (stage: string) => {
    const stageInfo = PIPELINE_STAGES.find(s => s.value === stage) || PIPELINE_STAGES[0];
    return <Badge className={stageInfo.color}>{stageInfo.label}</Badge>;
  };

  const getRiskBadge = (deal: EnhancedDeal) => {
    if (!deal.risk_assessment) return <Badge variant="outline">No Assessment</Badge>;
    
    const score = deal.risk_assessment.risk_score;
    if (score >= 70) return <Badge className="bg-red-100 text-red-800">High Risk ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk ({score})</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk ({score})</Badge>;
  };

  const getSPINProgress = (deal: EnhancedDeal) => {
    const score = deal.spin_completion_score || 0;
    return (
      <div className="flex items-center space-x-2">
        <Progress value={score} className="w-16" />
        <span className="text-sm text-muted-foreground">{score}%</span>
      </div>
    );
  };

  const getSarahRecommendations = (deal: EnhancedDeal) => {
    const recommendations = deal.sarah_recommendations || [];
    
    // Mock smart recommendations based on deal state
    const mockRecommendations = [];
    
    if ((deal.spin_completion_score || 0) < 50) {
      mockRecommendations.push("🎯 Complete SPIN discovery - only " + (deal.spin_completion_score || 0) + "% done");
    }
    
    if (deal.risk_assessment && deal.risk_assessment.risk_score > 70) {
      mockRecommendations.push("⚠️ High risk deal - schedule follow-up within 24 hours");
    }
    
    if (deal.stage_id === 'proposal_sent' && !deal.proposal_id) {
      mockRecommendations.push("📋 Generate proposal using PropGEN");
    }
    
    const daysSinceActivity = deal.last_activity_date ? 
      Math.floor((Date.now() - new Date(deal.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    if (daysSinceActivity > 5) {
      mockRecommendations.push("📞 No activity for " + daysSinceActivity + " days - follow up needed");
    }

    return [...recommendations, ...mockRecommendations].slice(0, 3);
  };

  const handleCreateOpportunity = async () => {
    try {
      await createDeal({
        title: formData.title,
        company_name: formData.company_id, // This would be resolved from company selection
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        value: parseFloat(formData.value) || undefined,
        probability: parseInt(formData.probability) || undefined,
        stage_id: formData.stage_id,
        status: 'open',
        assigned_to: 'current-user', // Would be actual user ID
        expected_close_date: formData.expected_close_date,
        notes: formData.notes,
        // Extended fields (cast to any to handle new fields)
        ...({
          product_line: formData.product_line,
          spin_situation: formData.spin_situation,
          spin_problem: formData.spin_problem,
          spin_implication: formData.spin_implication,
          spin_need_payoff: formData.spin_need_payoff
        } as any)
      });
      
      setShowCreateModal(false);
      setFormData({
        title: '',
        company_id: '',
        value: '',
        probability: '',
        expected_close_date: '',
        product_line: '',
        stage_id: 'lead',
        contact_name: '',
        contact_email: '',
        notes: '',
        spin_situation: '',
        spin_problem: '',
        spin_implication: '',
        spin_need_payoff: ''
      });
      
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
    } catch (error) {
      console.error('Error creating opportunity:', error);
    }
  };

  // Metrics calculations
  const totalPipelineValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
  const weightedValue = filteredOpportunities.reduce((sum, opp) => 
    sum + ((opp.value || 0) * (opp.probability || 0) / 100), 0);
  const highRiskCount = filteredOpportunities.filter(opp => 
    opp.risk_assessment && opp.risk_assessment.risk_score >= 70).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Ask Sarah AI
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Opportunity</DialogTitle>
                <DialogDescription>
                  Create a comprehensive opportunity with SPIN selling methodology
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="spin">SPIN Selling</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Opportunity Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="E.g., HRO Implementation - Acme Corp"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company_id}
                        onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                        placeholder="Search companies..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_name">Primary Contact</Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Deal Value ($)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        placeholder="500000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="probability">Close Probability (%)</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => setFormData({...formData, probability: e.target.value})}
                        placeholder="75"
                      />
                    </div>
                    <div>
                      <Label htmlFor="product_line">Product Line</Label>
                      <Select value={formData.product_line} onValueChange={(value) => setFormData({...formData, product_line: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product line" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_LINES.map((line) => (
                            <SelectItem key={line.value} value={line.value}>
                              {line.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stage">Pipeline Stage</Label>
                      <Select value={formData.stage_id} onValueChange={(value) => setFormData({...formData, stage_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {PIPELINE_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="expected_close_date">Expected Close Date</Label>
                    <Input
                      id="expected_close_date"
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="spin" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="spin_situation">Situation</Label>
                      <Textarea
                        id="spin_situation"
                        value={formData.spin_situation}
                        onChange={(e) => setFormData({...formData, spin_situation: e.target.value})}
                        placeholder="Describe the client's current situation and context..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="spin_problem">Problem</Label>
                      <Textarea
                        id="spin_problem"
                        value={formData.spin_problem}
                        onChange={(e) => setFormData({...formData, spin_problem: e.target.value})}
                        placeholder="What problems or challenges is the client facing?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="spin_implication">Implication</Label>
                      <Textarea
                        id="spin_implication"
                        value={formData.spin_implication}
                        onChange={(e) => setFormData({...formData, spin_implication: e.target.value})}
                        placeholder="What are the consequences if these problems aren't solved?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="spin_need_payoff">Need-Payoff</Label>
                      <Textarea
                        id="spin_need_payoff"
                        value={formData.spin_need_payoff}
                        onChange={(e) => setFormData({...formData, spin_need_payoff: e.target.value})}
                        placeholder="What value would the client get from solving these problems?"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes & Additional Information</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes, meeting summaries, key insights..."
                      rows={6}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOpportunity}>
                  Create Opportunity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total opportunity value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(weightedValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Probability adjusted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Deals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredOpportunities.length > 0 ? Math.round(totalPipelineValue / filteredOpportunities.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per opportunity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStage === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStage('all')}
              >
                All Stages
              </Button>
              {PIPELINE_STAGES.map(stage => (
                <Button
                  key={stage.value}
                  variant={selectedStage === stage.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStage(stage.value)}
                >
                  {stage.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Opportunities Table */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>SPIN Progress</TableHead>
                <TableHead>Sarah's Insights</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading opportunities...
                  </TableCell>
                </TableRow>
              ) : filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No opportunities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell>
                      <div className="font-medium">{opportunity.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {opportunity.probability}% probability • {opportunity.product_line || 'No product line'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{opportunity.company_name}</div>
                      <div className="text-sm text-muted-foreground">{opportunity.contact_name}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${(opportunity.value || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStageBadge(opportunity.stage_id)}
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(opportunity)}
                    </TableCell>
                    <TableCell>
                      {getSPINProgress(opportunity)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getSarahRecommendations(opportunity).slice(0, 2).map((rec, idx) => (
                          <div key={idx} className="text-xs bg-blue-50 text-blue-700 p-1 rounded">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedOpportunity(opportunity);
                            setShowDetailModal(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Opportunity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Brain className="h-4 w-4 mr-2" />
                            Sarah's Analysis
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Target className="h-4 w-4 mr-2" />
                            SPIN Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Proposal
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Risk Assessment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};