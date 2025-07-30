import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, DollarSign, Calendar, User, Building } from 'lucide-react';
import { useCrmOpportunities, useCrmOpportunityMutations } from '@/domains/crm/hooks';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-100' },
  { id: 'prospect', name: 'Prospect', color: 'bg-blue-100' },
  { id: 'assessment', name: 'Assessment', color: 'bg-yellow-100' },
  { id: 'proposal_sent', name: 'Proposal Sent', color: 'bg-orange-100' },
  { id: 'verbal', name: 'Verbal', color: 'bg-purple-100' },
  { id: 'won', name: 'Won', color: 'bg-green-100' },
  { id: 'lost', name: 'Lost', color: 'bg-red-100' },
];

const getRiskBadge = (riskScore?: number) => {
  if (!riskScore) return null;
  
  if (riskScore >= 80) return <Badge variant="outline" className="bg-green-50 text-green-700">🟢 Low Risk</Badge>;
  if (riskScore >= 60) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">🟡 Medium Risk</Badge>;
  if (riskScore >= 40) return <Badge variant="outline" className="bg-orange-50 text-orange-700">🟠 High Risk</Badge>;
  return <Badge variant="outline" className="bg-red-50 text-red-700">🔴 Critical Risk</Badge>;
};

interface NavigatorViewProps {
  className?: string;
}

export function NavigatorView({ className }: NavigatorViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignedRep, setFilterAssignedRep] = useState<string>('all');
  
  const { toast } = useToast();
  const { updateOpportunityStage } = useCrmOpportunityMutations();
  
  const { data: opportunities = [], isLoading, error } = useCrmOpportunities({
    search: searchTerm || undefined,
    assignedRepId: filterAssignedRep !== 'all' ? filterAssignedRep : undefined,
  });

  const opportunitiesByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = opportunities.filter(opp => opp.stage === stage.id);
    return acc;
  }, {} as Record<string, any[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    try {
      await updateOpportunityStage.mutateAsync({
        id: draggableId,
        stage: destination.droppableId,
      });
      
      toast({
        title: "Stage Updated",
        description: "Opportunity stage has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update opportunity stage.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'No value';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Error Loading Opportunities</div>
          <div className="text-muted-foreground text-sm">{error.message}</div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline Navigator</h1>
          <p className="text-muted-foreground">Drag and drop opportunities between stages</p>
        </div>
        <Button
          onClick={() => {
            toast({
              title: "Coming Soon",
              description: "New opportunity creation is being implemented.",
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAssignedRep} onValueChange={setFilterAssignedRep}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by rep" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reps</SelectItem>
            {/* Add dynamic rep options here */}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 min-h-96">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col">
              <div className={`p-3 rounded-t-lg border-b ${stage.color}`}>
                <h3 className="font-medium text-sm">{stage.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {opportunitiesByStage[stage.id]?.length || 0} opportunities
                </p>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 bg-muted/20 rounded-b-lg border-l border-r border-b min-h-32 ${
                      snapshot.isDraggingOver ? 'bg-muted/40' : ''
                    }`}
                  >
                    {opportunitiesByStage[stage.id]?.map((opportunity, index) => (
                      <Draggable
                        key={opportunity.id}
                        draggableId={opportunity.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                           <Card
                             ref={provided.innerRef}
                             {...provided.draggableProps}
                             {...provided.dragHandleProps}
                             className={`cursor-move transition-transform hover:scale-105 ${
                               snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                             }`}
                             onClick={() => {
                               toast({
                                 title: "Opportunity Details",
                                 description: `View details for ${opportunity.name}`,
                               });
                             }}
                           >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium truncate" title={opportunity.name}>
                                {opportunity.name}
                              </CardTitle>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building className="w-3 h-3" />
                                <span className="truncate">{opportunity.company?.name || opportunity.company?.company_name || 'Unknown Company'}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-green-600 font-medium">
                                  <DollarSign className="w-3 h-3" />
                                  {formatCurrency(opportunity.deal_value)}
                                </div>
                                {opportunity.close_probability && (
                                  <Badge variant="secondary" className="text-xs">
                                    {opportunity.close_probability}%
                                  </Badge>
                                )}
                              </div>
                              
                              {opportunity.forecast_close_date && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Close: {formatDistanceToNow(new Date(opportunity.forecast_close_date), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                              
                              {opportunity.assigned_rep_id && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  <span>Rep: {opportunity.assigned_rep_id}</span>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap gap-1">
                                {getRiskBadge(opportunity.company?.risk_score)}
                                {opportunity.product_line && (
                                  <Badge variant="outline" className="text-xs">
                                    {typeof opportunity.product_line === 'string' 
                                      ? opportunity.product_line.replace('HaaLO_', '')
                                      : 'Product'
                                    }
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}