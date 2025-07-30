import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDndMonitor
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';
import { useCRMMetrics } from '@/domains/crm/hooks/useCRMMetrics';
import { useDeals } from '../hooks/useDeals';
import { Deal } from '@/domains/crm/types';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter,
  DollarSign,
  Clock,
  Building2,
  TrendingUp,
  AlertTriangle,
  Eye,
  Calendar,
  Target,
  Plus,
  Lightbulb,
  Phone,
  Mail,
  FileText,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-50 border-gray-200', headerColor: 'bg-gray-100' },
  { id: 'prospect', label: 'Prospect', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-100' },
  { id: 'assessment_done', label: 'Assessment Done', color: 'bg-yellow-50 border-yellow-200', headerColor: 'bg-yellow-100' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-orange-50 border-orange-200', headerColor: 'bg-orange-100' },
  { id: 'verbal', label: 'Verbal', color: 'bg-purple-50 border-purple-200', headerColor: 'bg-purple-100' },
  { id: 'closed_won', label: 'Closed/Won', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-100' },
  { id: 'closed_lost', label: 'Closed/Lost', color: 'bg-red-50 border-red-200', headerColor: 'bg-red-100' }
];

const PRODUCT_LINES = ['All', 'HRO', 'Staffing', 'LMS', 'Consulting', 'Other'];
const RISK_LEVELS = ['All', 'Low Risk', 'Medium Risk', 'High Risk'];

interface EnhancedDeal extends Deal {
  daysSinceActivity?: number;
  riskLevel?: string;
  riskScore?: number;
  nextSuggestedAction?: {
    action: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: React.ReactNode;
  };
}

interface AIActionSuggestion {
  action: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

const generateAISuggestion = (deal: EnhancedDeal): AIActionSuggestion => {
  const daysSinceActivity = deal.daysSinceActivity || 0;
  const riskScore = deal.riskScore || 0;
  const stage = deal.stage_id;
  const dealValue = deal.value || 0;

  // AI logic for suggesting next best actions
  if (stage === 'proposal_sent' && daysSinceActivity > 5) {
    return {
      action: 'Follow up on proposal',
      description: `It's been ${daysSinceActivity} days since proposal was sent. Call to discuss questions or concerns.`,
      priority: 'high',
      icon: <Phone className="h-4 w-4" />
    };
  }

  if (stage === 'verbal' && daysSinceActivity > 3) {
    return {
      action: 'Send contract',
      description: 'Move quickly while momentum is high. Send contract and close the deal.',
      priority: 'high',
      icon: <FileText className="h-4 w-4" />
    };
  }

  if (riskScore > 70) {
    return {
      action: 'Risk mitigation call',
      description: 'High risk detected. Schedule a stakeholder call to address concerns.',
      priority: 'high',
      icon: <AlertTriangle className="h-4 w-4" />
    };
  }

  if (stage === 'prospect' && daysSinceActivity > 7) {
    return {
      action: 'Schedule risk assessment',
      description: 'Move prospect forward with comprehensive risk assessment demo.',
      priority: 'medium',
      icon: <Target className="h-4 w-4" />
    };
  }

  if (dealValue > 50000 && stage === 'lead') {
    return {
      action: 'Executive outreach',
      description: 'High-value opportunity. Consider C-level introduction call.',
      priority: 'medium',
      icon: <Users className="h-4 w-4" />
    };
  }

  if (daysSinceActivity > 14) {
    return {
      action: 'Re-engagement email',
      description: 'Long time since last contact. Send value-add content to re-engage.',
      priority: 'medium',
      icon: <Mail className="h-4 w-4" />
    };
  }

  return {
    action: 'Check in call',
    description: 'Regular touchpoint to maintain momentum and build relationship.',
    priority: 'low',
    icon: <Phone className="h-4 w-4" />
  };
};

interface OpportunityCardProps {
  opportunity: EnhancedDeal;
  onClick: () => void;
}

function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const [showPopover, setShowPopover] = useState(false);
  const navigate = useNavigate();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getDaysSinceActivity = () => {
    return opportunity.daysSinceActivity || 0;
  };

  const getRiskBadge = () => {
    const score = opportunity.riskScore || Math.floor(Math.random() * 100);
    if (score >= 70) return <Badge className="bg-red-100 text-red-700 text-xs">🔥 High</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-700 text-xs">⚠️ Medium</Badge>;
    return <Badge className="bg-green-100 text-green-700 text-xs">✅ Low</Badge>;
  };

  const suggestion = generateAISuggestion(opportunity);
  const daysSinceActivity = getDaysSinceActivity();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/crm/opportunities/${opportunity.id}`);
  };

  return (
    <Popover open={showPopover} onOpenChange={setShowPopover}>
      <PopoverTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="bg-white border rounded-lg p-3 mb-3 cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200 hover-scale"
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{opportunity.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {opportunity.company_name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2 opacity-60 hover:opacity-100"
                onClick={handleViewDetails}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="font-medium">${(opportunity.value || 0).toLocaleString()}</span>
              </div>
              <div className="text-muted-foreground">
                {opportunity.probability || 0}%
              </div>
            </div>

            <div className="flex items-center justify-between">
              {getRiskBadge()}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{daysSinceActivity}d ago</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Rep: {opportunity.assigned_to || 'Unassigned'}
              </div>
              {suggestion.priority === 'high' && (
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">Action needed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        side="right" 
        align="start"
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <h4 className="font-semibold text-sm">AI Suggested Action</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {suggestion.icon}
              <span className="font-medium text-sm">{suggestion.action}</span>
              <Badge 
                variant={suggestion.priority === 'high' ? 'destructive' : 
                        suggestion.priority === 'medium' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {suggestion.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Risk Score:</span>
              <span className="font-medium">{opportunity.riskScore || 0}/100</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Days inactive:</span>
              <span className="font-medium">{daysSinceActivity} days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Deal value:</span>
              <span className="font-medium">${(opportunity.value || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button size="sm" className="flex-1" onClick={handleViewDetails}>
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <ArrowRight className="h-3 w-3 mr-1" />
              Take Action
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface PipelineColumnProps {
  stage: typeof PIPELINE_STAGES[0];
  opportunities: EnhancedDeal[];
  onCardClick: (opportunity: EnhancedDeal) => void;
}

function PipelineColumn({ stage, opportunities, onCardClick }: PipelineColumnProps) {
  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
  const count = opportunities.length;
  const weightedValue = opportunities.reduce((sum, opp) => 
    sum + ((opp.value || 0) * (opp.probability || 0) / 100), 0);

  return (
    <div className={`${stage.color} border-2 border-dashed rounded-lg min-h-[600px] flex flex-col`}>
      <div className={`${stage.headerColor} p-3 rounded-t-lg border-b`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">{stage.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            Total: ${totalValue.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Weighted: ${Math.round(weightedValue).toLocaleString()}
          </div>
        </div>
      </div>

      <SortableContext items={opportunities.map(opp => opp.id)} strategy={verticalListSortingStrategy}>
        <div className="p-2 space-y-2 flex-1">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onClick={() => onCardClick(opportunity)}
            />
          ))}
          {opportunities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No opportunities</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Droppable area component for stage columns
function DroppableStageColumn({ stage, children }: { stage: typeof PIPELINE_STAGES[0], children: React.ReactNode }) {
  const { setNodeRef, isOver } = useSortable({ 
    id: stage.id,
    data: { type: 'stage', stage }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`${isOver ? 'ring-2 ring-primary ring-opacity-50' : ''} transition-all duration-200`}
    >
      {children}
    </div>
  );
}

export const Navigator: React.FC = () => {
  const { metrics } = useCRMMetrics();
  const { deals, loading, updateDeal } = useDeals();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [selectedProductLine, setSelectedProductLine] = useState('All');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<EnhancedDeal | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Enhanced deals with AI suggestions and risk scoring
  const enhancedDeals: EnhancedDeal[] = (deals || []).map(deal => {
    const daysSinceUpdate = deal.updated_at ? 
      Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Calculate risk score based on deal age, value, and stage
    let riskScore = 0;
    if (daysSinceUpdate > 30) riskScore += 40;
    if (daysSinceUpdate > 60) riskScore += 30;
    if ((deal.value || 0) > 100000) riskScore += 20;
    if (deal.stage_id === 'proposal_sent' && daysSinceUpdate > 14) riskScore += 30;
    
    const riskLevel = riskScore >= 70 ? 'High Risk' : 
                     riskScore >= 40 ? 'Medium Risk' : 'Low Risk';
    
    const enhancedDeal: EnhancedDeal = {
      ...deal,
      daysSinceActivity: daysSinceUpdate,
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      nextSuggestedAction: generateAISuggestion({
        ...deal,
        daysSinceActivity: daysSinceUpdate,
        riskScore: Math.min(riskScore, 100),
        riskLevel
      })
    };
    
    return enhancedDeal;
  });

  // Apply filters
  const filteredDeals = enhancedDeals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRep = selectedRep === 'All' || deal.assigned_to === selectedRep;
    const matchesProductLine = selectedProductLine === 'All' || (deal as any).product_line === selectedProductLine;
    const matchesRiskLevel = selectedRiskLevel === 'All' || deal.riskLevel === selectedRiskLevel;
    
    return matchesSearch && matchesRep && matchesProductLine && matchesRiskLevel;
  });

  // Group deals by stage
  const dealsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredDeals.filter(deal => deal.stage_id === stage.id);
    return acc;
  }, {} as Record<string, EnhancedDeal[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const deal = enhancedDeals.find(d => d.id === active.id);
    setDraggedDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedDeal) {
      setActiveId(null);
      setDraggedDeal(null);
      return;
    }

    const dealId = active.id as string;
    let newStageId = over.id as string;
    
    // Check if dropped on a stage column
    if (over.data.current?.type === 'stage') {
      newStageId = over.data.current.stage.id;
    }
    
    // Find the deal and update its stage
    if (draggedDeal.stage_id !== newStageId) {
      try {
        await updateDeal(dealId, { stage_id: newStageId });
        
        const stageName = PIPELINE_STAGES.find(s => s.id === newStageId)?.label;
        toast({
          title: "Deal Updated",
          description: `${draggedDeal.title} moved to ${stageName}`,
        });
      } catch (error) {
        console.error('Error updating deal stage:', error);
        toast({
          title: "Error",
          description: "Failed to update deal stage",
          variant: "destructive",
        });
      }
    }

    setActiveId(null);
    setDraggedDeal(null);
  };

  const handleCardClick = (opportunity: EnhancedDeal) => {
    navigate(`/admin/crm/opportunities/${opportunity.id}`);
  };

  // Get unique reps for filter
  const uniqueReps = Array.from(new Set((deals || []).map(deal => deal.assigned_to))).filter(Boolean);

  const totalPipelineValue = filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const weightedValue = filteredDeals.reduce((sum, deal) => 
    sum + ((deal.value || 0) * (deal.probability || 0) / 100), 0);

  const highRiskDeals = filteredDeals.filter(d => (d.riskScore || 0) >= 70);
  const actionNeededDeals = filteredDeals.filter(d => d.nextSuggestedAction?.priority === 'high');

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pipeline Navigator</h1>
          <p className="text-muted-foreground">
            AI-powered pipeline management with intelligent action suggestions
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Pipeline: ${(metrics?.pipelineValue || totalPipelineValue).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span>Weighted: ${Math.round(weightedValue).toLocaleString()}</span>
          </div>
          <Button onClick={() => navigate('/admin/crm/deals')}>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Active Deals</span>
            </div>
            <div className="text-2xl font-bold">{filteredDeals.length}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">High Risk</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{highRiskDeals.length}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Action Needed</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{actionNeededDeals.length}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Avg Deal Size</span>
            </div>
            <div className="text-lg font-bold">
              ${filteredDeals.length > 0 ? Math.round(totalPipelineValue / filteredDeals.length).toLocaleString() : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned Rep</label>
              <Select value={selectedRep} onValueChange={setSelectedRep}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Reps</SelectItem>
                  {uniqueReps.map((rep) => (
                    <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Line</label>
              <Select value={selectedProductLine} onValueChange={setSelectedProductLine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_LINES.map(line => (
                    <SelectItem key={line} value={line}>{line}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Level</label>
              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <DroppableStageColumn key={stage.id} stage={stage}>
              <PipelineColumn
                stage={stage}
                opportunities={dealsByStage[stage.id] || []}
                onCardClick={handleCardClick}
              />
            </DroppableStageColumn>
          ))}
        </div>

        <DragOverlay>
          {activeId && draggedDeal ? (
            <div className="opacity-90 rotate-3 scale-105">
              <OpportunityCard
                opportunity={draggedDeal}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mr-4"></div>
          <div className="text-muted-foreground">Loading pipeline...</div>
        </div>
      )}
    </div>
  );
};