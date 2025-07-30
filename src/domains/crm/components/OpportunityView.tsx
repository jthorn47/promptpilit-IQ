import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, ExternalLink, DollarSign, Calendar, User } from 'lucide-react';
import { useCrmOpportunity } from '../hooks/useCrmOpportunities';
import { useCrmTasks } from '../hooks/useCrmTasks';
import { SpinSellingPanel } from './SpinSellingPanel';

interface OpportunityViewProps {
  opportunityId: string;
  className?: string;
}

const STAGE_COLORS = {
  'lead': 'bg-gray-500',
  'prospect': 'bg-blue-500',
  'assessment': 'bg-yellow-500',
  'proposal_sent': 'bg-purple-500',
  'verbal': 'bg-orange-500',
  'won': 'bg-green-500',
  'lost': 'bg-red-500',
};

export function OpportunityView({ opportunityId, className }: OpportunityViewProps) {
  const { data: opportunity, isLoading } = useCrmOpportunity(opportunityId);
  const { data: tasks, isLoading: tasksLoading } = useCrmTasks({ opportunityId });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading opportunity details...</div>;
  }

  if (!opportunity) {
    return <div className="flex items-center justify-center h-64">Opportunity not found</div>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/crm/companies/${opportunity.company_id}`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <Building className="w-4 h-4" />
              {opportunity.company?.name}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold">{opportunity.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS] || 'bg-gray-100'}>
              {opportunity.stage?.replace('_', ' ').toUpperCase()}
            </Badge>
            {opportunity.close_probability && (
              <Badge variant="outline">
                {opportunity.close_probability}% probability
              </Badge>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-lg font-semibold">
            <DollarSign className="w-5 h-5" />
            {opportunity.deal_value ? opportunity.deal_value.toLocaleString() : 'TBD'}
          </div>
          <p className="text-sm text-muted-foreground">Deal Value</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Close Date</p>
                <p className="text-sm text-muted-foreground">
                  {opportunity.forecast_close_date 
                    ? new Date(opportunity.forecast_close_date).toLocaleDateString()
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Assigned Rep</p>
                <p className="text-sm text-muted-foreground">
                  {opportunity.assigned_rep_id || 'Unassigned'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Product Line</p>
              <p className="text-sm text-muted-foreground">
                {opportunity.product_line?.replace('_', ' ') || 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Lead Source</p>
              <p className="text-sm text-muted-foreground">
                {opportunity.lead_source || 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="spin" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spin">SPIN Selling</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="spin">
          <SpinSellingPanel opportunityId={opportunityId} />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Stage</p>
                    <p className="text-muted-foreground">{opportunity.stage?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="font-medium">Probability</p>
                    <p className="text-muted-foreground">{opportunity.close_probability || 0}%</p>
                  </div>
                  <div>
                    <p className="font-medium">Discovery Completed</p>
                    <p className="text-muted-foreground">{opportunity.discovery_completed ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Demo Completed</p>
                    <p className="text-muted-foreground">{opportunity.demo_completed ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Proposal Sent</p>
                    <p className="text-muted-foreground">{opportunity.proposal_sent ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Contract Sent</p>
                    <p className="text-muted-foreground">{opportunity.contract_sent ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {opportunity.decision_makers && opportunity.decision_makers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Decision Makers</h4>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.decision_makers.map((maker, index) => (
                        <Badge key={index} variant="outline">{maker}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {opportunity.competitors && opportunity.competitors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Competitors</h4>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.competitors.map((competitor, index) => (
                        <Badge key={index} variant="secondary">{competitor}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {opportunity.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{opportunity.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                {opportunity.risk_assessment ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Score: <span className="font-medium">{opportunity.risk_assessment.score}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed: {opportunity.risk_assessment.completed_at 
                        ? new Date(opportunity.risk_assessment.completed_at).toLocaleDateString()
                        : 'Not completed'
                      }
                    </p>
                    <Button variant="outline" size="sm">
                      View Full Assessment
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No risk assessment completed</p>
                    <Button variant="outline">
                      Start Risk Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Opportunity Tasks</h3>
            <Button>Add Task</Button>
          </div>
          
          <div className="grid gap-4">
            {tasksLoading ? (
              <div>Loading tasks...</div>
            ) : tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                            {task.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {task.priority && (
                            <Badge variant="outline">{task.priority}</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No tasks found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Activity feed coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}