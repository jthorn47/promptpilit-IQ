import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Timer,
  Award,
  Target,
  Trophy,
  Star,
  Zap
} from 'lucide-react';
import { addDays } from 'date-fns';

interface AgentMetrics {
  agent_id: string;
  agent_name: string;
  first_response_time: number; // minutes
  avg_resolution_time: number; // hours
  messages_handled: number;
  active_cases: number;
  pending_cases: number;
  satisfaction_score: number; // 1-5 scale
  cases_closed: number;
}

interface TeamMetrics {
  team_name: string;
  avg_first_response: number;
  avg_resolution: number;
  total_volume: number;
  satisfaction_avg: number;
}

export const HALIPerformanceMetrics = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['hali_performance', dateRange, agentFilter, teamFilter, clientFilter],
    queryFn: async () => {
      // Mock data for demo - replace with actual queries
      const agentMetrics: AgentMetrics[] = [
        {
          agent_id: '1',
          agent_name: 'Sarah Johnson',
          first_response_time: 3.2,
          avg_resolution_time: 1.8,
          messages_handled: 127,
          active_cases: 8,
          pending_cases: 3,
          satisfaction_score: 4.7,
          cases_closed: 89
        },
        {
          agent_id: '2',
          agent_name: 'Mike Chen',
          first_response_time: 4.1,
          avg_resolution_time: 2.1,
          messages_handled: 98,
          active_cases: 12,
          pending_cases: 5,
          satisfaction_score: 4.5,
          cases_closed: 67
        },
        {
          agent_id: '3',
          agent_name: 'Emily Rodriguez',
          first_response_time: 2.8,
          avg_resolution_time: 1.5,
          messages_handled: 156,
          active_cases: 6,
          pending_cases: 2,
          satisfaction_score: 4.9,
          cases_closed: 112
        }
      ];

      const teamMetrics: TeamMetrics[] = [
        {
          team_name: 'HR Support',
          avg_first_response: 3.4,
          avg_resolution: 1.8,
          total_volume: 245,
          satisfaction_avg: 4.6
        },
        {
          team_name: 'Payroll Support',
          avg_first_response: 2.9,
          avg_resolution: 1.2,
          total_volume: 178,
          satisfaction_avg: 4.8
        },
        {
          team_name: 'Tech Support',
          avg_first_response: 4.2,
          avg_resolution: 2.3,
          total_volume: 89,
          satisfaction_avg: 4.3
        }
      ];

      return {
        agentMetrics,
        teamMetrics,
        totalMetrics: {
          avg_first_response: 3.4,
          avg_resolution: 1.8,
          total_messages: 512,
          satisfaction_avg: 4.6,
          active_agents: 8,
          response_sla_met: 89
        }
      };
    }
  });

  const COLORS = ['#655DC6', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 4.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(date) => setDateRange({ from: date?.from, to: date?.to })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Agent</label>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {performanceData?.agentMetrics.map(agent => (
                    <SelectItem key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Team</label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="hr">HR Support</SelectItem>
                  <SelectItem value="payroll">Payroll Support</SelectItem>
                  <SelectItem value="tech">Tech Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="client1">Sample Client 1</SelectItem>
                  <SelectItem value="client2">Sample Client 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg First Response</p>
                <p className="text-2xl font-bold">{performanceData?.totalMetrics.avg_first_response}m</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{performanceData?.totalMetrics.avg_resolution}h</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{performanceData?.totalMetrics.total_messages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction Score</p>
                <p className="text-2xl font-bold">{performanceData?.totalMetrics.satisfaction_avg}/5</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Performance Views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard 🏆</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Performance
              </CardTitle>
            </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData?.agentMetrics.map((agent) => (
              <div key={agent.agent_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{agent.agent_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{agent.cases_closed} closed</Badge>
                      <Badge 
                        className={getSatisfactionColor(agent.satisfaction_score)}
                        variant="secondary"
                      >
                        {agent.satisfaction_score}★
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{agent.active_cases} active • {agent.pending_cases} pending</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">First Response</p>
                    <p className="font-medium">{agent.first_response_time}m avg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Resolution Time</p>
                    <p className="font-medium">{agent.avg_resolution_time}h avg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Messages Handled</p>
                    <p className="font-medium">{agent.messages_handled}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Workload</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium">
                        {agent.active_cases + agent.pending_cases < 15 ? 'Normal' : 'High'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Performers This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.agentMetrics
                  .sort((a, b) => b.satisfaction_score - a.satisfaction_score)
                  .map((agent, index) => (
                    <div key={agent.agent_id} className={`flex items-center gap-4 p-4 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200' :
                      'bg-muted/30'
                    }`}>
                      <div className="flex-shrink-0">
                        {index === 0 && <Trophy className="h-8 w-8 text-yellow-500" />}
                        {index === 1 && <Star className="h-8 w-8 text-gray-500" />}
                        {index === 2 && <Award className="h-8 w-8 text-orange-500" />}
                        {index > 2 && <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-full text-sm font-bold">{index + 1}</div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{agent.agent_name}</h3>
                          {index < 3 && <Badge variant="secondary">Top Performer</Badge>}
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Rating: </span>
                            <span className="font-medium">{agent.satisfaction_score}★</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Closed: </span>
                            <span className="font-medium">{agent.cases_closed}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Response: </span>
                            <span className="font-medium">{agent.first_response_time}m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Resolution: </span>
                            <span className="font-medium">{agent.avg_resolution_time}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Team Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData?.teamMetrics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg_first_response" fill="#655DC6" name="First Response (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Satisfaction Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData?.teamMetrics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team_name" />
                <YAxis domain={[3, 5]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction_avg" 
                  stroke="#655DC6" 
                  strokeWidth={3}
                  name="Satisfaction"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SLA Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SLA Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {performanceData?.totalMetrics.response_sla_met}%
              </div>
              <p className="text-sm text-muted-foreground">Response SLA Met</p>
              <Badge variant="secondary" className="mt-2">Target: 90%</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">94%</div>
              <p className="text-sm text-muted-foreground">Resolution SLA Met</p>
              <Badge variant="secondary" className="mt-2">Target: 85%</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.6/5</div>
              <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
              <Badge variant="secondary" className="mt-2">Target: 4.0</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};