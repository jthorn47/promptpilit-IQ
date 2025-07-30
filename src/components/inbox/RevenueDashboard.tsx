import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  DollarSign, 
  MessageSquare, 
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  Calendar,
  Filter,
  Search,
  User,
  Building2,
  Target,
  FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

// Enhanced mock data with additional fields for sorting and filtering
const mockRevenueData = {
  // Weekly metrics
  proposalsSentThisWeek: 8,
  closedWonThisMonth: 6,
  followUpsDueToday: 3,
  
  // Overall metrics
  activeProposalThreads: 12,
  noResponseProposals: 4,
  totalPipelineValue: 485000,
  totalActiveValue: 385000,
  currency: 'USD',
  
  proposalOutcomes: [
    { name: 'Sent', value: 8, color: '#94a3b8' },
    { name: 'Viewed', value: 15, color: '#3b82f6' },
    { name: 'Closed-Won', value: 6, color: '#10b981' },
    { name: 'Closed-Lost', value: 3, color: '#ef4444' }
  ],
  
  // Enhanced proposals with sorting fields
  proposals: [
    { 
      id: '1', 
      company: 'Acme Corp', 
      value: 75000, 
      status: 'viewed', 
      daysSent: 3,
      salesRep: 'Sarah Johnson',
      industry: 'Technology',
      leadSource: 'Website',
      proposalType: 'PropGEN',
      followUpDue: new Date(Date.now() + 86400000), // Tomorrow
      createdAt: new Date(Date.now() - 3 * 86400000)
    },
    { 
      id: '2', 
      company: 'Tech Solutions', 
      value: 120000, 
      status: 'sent', 
      daysSent: 1,
      salesRep: 'Mike Chen',
      industry: 'Software',
      leadSource: 'Referral',
      proposalType: 'PDF',
      followUpDue: new Date(), // Today
      createdAt: new Date(Date.now() - 86400000)
    },
    { 
      id: '3', 
      company: 'StartupXYZ', 
      value: 45000, 
      status: 'no_response', 
      daysSent: 7,
      salesRep: 'Sarah Johnson',
      industry: 'Startup',
      leadSource: 'Cold Email',
      proposalType: 'PropGEN',
      followUpDue: new Date(), // Today
      createdAt: new Date(Date.now() - 7 * 86400000)
    },
    { 
      id: '4', 
      company: 'Enterprise Ltd', 
      value: 200000, 
      status: 'closed_won', 
      daysSent: 14,
      salesRep: 'Alex Rodriguez',
      industry: 'Manufacturing',
      leadSource: 'LinkedIn',
      proposalType: 'PropGEN',
      followUpDue: null,
      createdAt: new Date(Date.now() - 14 * 86400000)
    },
    { 
      id: '5', 
      company: 'Health Care Plus', 
      value: 90000, 
      status: 'viewed', 
      daysSent: 5,
      salesRep: 'Mike Chen',
      industry: 'Healthcare',
      leadSource: 'Trade Show',
      proposalType: 'PDF',
      followUpDue: new Date(), // Today
      createdAt: new Date(Date.now() - 5 * 86400000)
    },
    { 
      id: '6', 
      company: 'FinTech Innovation', 
      value: 150000, 
      status: 'sent', 
      daysSent: 2,
      salesRep: 'Sarah Johnson',
      industry: 'Finance',
      leadSource: 'Website',
      proposalType: 'PropGEN',
      followUpDue: new Date(Date.now() + 2 * 86400000), // In 2 days
      createdAt: new Date(Date.now() - 2 * 86400000)
    }
  ],
  
  monthlyTrends: [
    { month: 'Oct', sent: 12, won: 4, value: 320000 },
    { month: 'Nov', sent: 18, won: 6, value: 485000 },
    { month: 'Dec', sent: 15, won: 8, value: 620000 }
  ]
};

interface RevenueDashboardProps {
  onProposalClick?: (proposalId: string) => void;
}

export const RevenueDashboard: React.FC<RevenueDashboardProps> = ({ onProposalClick }) => {
  const [sortBy, setSortBy] = useState<'salesRep' | 'industry' | 'leadSource' | 'proposalType' | 'value' | 'date'>('date');
  const [filterBy, setFilterBy] = useState<{
    salesRep: string;
    industry: string;
    leadSource: string;
    proposalType: string;
  }>({
    salesRep: 'all',
    industry: 'all',
    leadSource: 'all',
    proposalType: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: mockRevenueData.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="w-4 h-4 text-slate-500" />;
      case 'viewed': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'closed_won': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed_lost': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'no_response': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-slate-100 text-slate-700';
      case 'viewed': return 'bg-blue-100 text-blue-700';
      case 'closed_won': return 'bg-green-100 text-green-700';
      case 'closed_lost': return 'bg-red-100 text-red-700';
      case 'no_response': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Calculated metrics
  const winRate = mockRevenueData.proposalOutcomes.find(p => p.name === 'Closed-Won')?.value || 0;
  const totalProposals = mockRevenueData.proposalOutcomes.reduce((sum, p) => sum + p.value, 0);
  const totalSent = mockRevenueData.proposalOutcomes.find(p => p.name === 'Sent')?.value || 0;
  const winPercentage = totalSent > 0 ? Math.round((winRate / totalSent) * 100) : 0;
  
  // Get unique values for filters
  const uniqueSalesReps = [...new Set(mockRevenueData.proposals.map(p => p.salesRep))];
  const uniqueIndustries = [...new Set(mockRevenueData.proposals.map(p => p.industry))];
  const uniqueLeadSources = [...new Set(mockRevenueData.proposals.map(p => p.leadSource))];
  const uniqueProposalTypes = [...new Set(mockRevenueData.proposals.map(p => p.proposalType))];
  
  // Filtered and sorted proposals
  const filteredAndSortedProposals = useMemo(() => {
    let filtered = mockRevenueData.proposals.filter(proposal => {
      const matchesSearch = proposal.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSalesRep = filterBy.salesRep === 'all' || proposal.salesRep === filterBy.salesRep;
      const matchesIndustry = filterBy.industry === 'all' || proposal.industry === filterBy.industry;
      const matchesLeadSource = filterBy.leadSource === 'all' || proposal.leadSource === filterBy.leadSource;
      const matchesProposalType = filterBy.proposalType === 'all' || proposal.proposalType === filterBy.proposalType;
      
      return matchesSearch && matchesSalesRep && matchesIndustry && matchesLeadSource && matchesProposalType;
    });
    
    // Sort proposals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'salesRep':
          return a.salesRep.localeCompare(b.salesRep);
        case 'industry':
          return a.industry.localeCompare(b.industry);
        case 'leadSource':
          return a.leadSource.localeCompare(b.leadSource);
        case 'proposalType':
          return a.proposalType.localeCompare(b.proposalType);
        case 'value':
          return b.value - a.value;
        case 'date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
    
    return filtered;
  }, [searchTerm, filterBy, sortBy]);
  
  // Calculate follow-ups due today
  const followUpsDueToday = mockRevenueData.proposals.filter(proposal => {
    if (!proposal.followUpDue) return false;
    const today = new Date();
    const dueDate = new Date(proposal.followUpDue);
    return dueDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Revenue Dashboard</h2>
          <p className="text-sm text-muted-foreground">Proposal tracking and pipeline overview</p>
        </div>
      </motion.div>

      {/* Enhanced Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Active Proposals</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {mockRevenueData.activeProposalThreads}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {formatCurrency(mockRevenueData.totalActiveValue)}
                </p>
              </div>
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Sent This Week</p>
                <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                  {mockRevenueData.proposalsSentThisWeek}
                </p>
              </div>
              <Send className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-300">Closed-Won This Month</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {mockRevenueData.closedWonThisMonth}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Win Rate</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {winPercentage}%
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {winRate}/{totalSent} proposals
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Follow-Ups Due Today</p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {followUpsDueToday}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Proposal Outcomes Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proposal Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockRevenueData.proposalOutcomes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockRevenueData.proposalOutcomes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mockRevenueData.proposalOutcomes.map((outcome) => (
                <div key={outcome.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: outcome.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {outcome.name}: {outcome.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? formatCurrency(value as number) : value,
                      name === 'sent' ? 'Sent' : name === 'won' ? 'Won' : 'Value'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="sent" fill="#94a3b8" name="Sent" />
                  <Bar dataKey="won" fill="#10b981" name="Won" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Proposals with Filters and Sorting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Proposal Pipeline</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3 pt-3">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="salesRep">Sales Rep</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="leadSource">Lead Source</SelectItem>
                  <SelectItem value="proposalType">Type</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy.salesRep} onValueChange={(value) => setFilterBy(prev => ({ ...prev, salesRep: value }))}>
                <SelectTrigger className="w-40">
                  <User className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sales Rep" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales Reps</SelectItem>
                  {uniqueSalesReps.map(rep => (
                    <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterBy.industry} onValueChange={(value) => setFilterBy(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger className="w-36">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterBy.leadSource} onValueChange={(value) => setFilterBy(prev => ({ ...prev, leadSource: value }))}>
                <SelectTrigger className="w-36">
                  <Target className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Lead Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueLeadSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterBy.proposalType} onValueChange={(value) => setFilterBy(prev => ({ ...prev, proposalType: value }))}>
                <SelectTrigger className="w-32">
                  <FileText className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueProposalTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {filteredAndSortedProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onProposalClick?.(proposal.id)}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(proposal.status)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-sm">{proposal.company}</p>
                        <Badge variant="outline" className="text-xs">
                          {proposal.proposalType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {proposal.salesRep}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {proposal.industry}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {proposal.leadSource}
                        </span>
                        {proposal.followUpDue && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Calendar className="w-3 h-3" />
                            Follow-up {proposal.followUpDue.toDateString() === new Date().toDateString() ? 'due today' : 'due'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">
                      {formatCurrency(proposal.value)}
                    </span>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </motion.div>
              ))}
              
              {filteredAndSortedProposals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No proposals match your current filters</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterBy({
                        salesRep: 'all',
                        industry: 'all',
                        leadSource: 'all',
                        proposalType: 'all'
                      });
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Win Rate Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Win Rate</span>
                <span>{winPercentage}%</span>
              </div>
              <Progress value={winPercentage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Response Rate</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Follow-up Rate</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};