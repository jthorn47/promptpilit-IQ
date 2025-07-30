/**
 * Leads Manager - Stage 5
 * Advanced lead management with AI scoring and nurturing workflows
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, User, Mail, Phone, Building, Edit, MessageCircle,
  Brain, Target, TrendingUp, Users, Filter, BarChart3, Sparkles,
  ArrowUpRight, Star, Clock, CheckCircle, AlertTriangle
} from "lucide-react";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'unqualified';
  source: string;
  score: number;
  lastActivity: string;
  created: string;
  assignedTo?: string;
  aiInsights?: {
    buyingIntent: number;
    responseRate: number;
    bestContactTime: string;
    preferredChannel: string;
  };
}

export const LeadsManager = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    setLeads([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@acme.com',
        phone: '+1-555-0123',
        company: 'Acme Corp',
        title: 'CEO',
        status: 'qualified',
        source: 'Website',
        score: 85,
        lastActivity: '2024-01-14',
        created: '2024-01-10',
        assignedTo: 'Sarah Johnson',
        aiInsights: {
          buyingIntent: 78,
          responseRate: 65,
          bestContactTime: '2-4 PM',
          preferredChannel: 'email'
        }
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@techstart.com',
        phone: '+1-555-0124',
        company: 'TechStart Inc',
        title: 'VP Marketing',
        status: 'contacted',
        source: 'LinkedIn',
        score: 72,
        lastActivity: '2024-01-13',
        created: '2024-01-08',
        assignedTo: 'Mike Wilson',
        aiInsights: {
          buyingIntent: 85,
          responseRate: 72,
          bestContactTime: '10-12 AM',
          preferredChannel: 'phone'
        }
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@enterprise.com',
        company: 'Enterprise Co',
        title: 'CTO',
        status: 'new',
        source: 'Referral',
        score: 91,
        lastActivity: '2024-01-15',
        created: '2024-01-15',
        aiInsights: {
          buyingIntent: 92,
          responseRate: 88,
          bestContactTime: '3-5 PM',
          preferredChannel: 'email'
        }
      }
    ]);
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesScore = scoreFilter === "all" || 
      (scoreFilter === "high" && lead.score >= 80) ||
      (scoreFilter === "medium" && lead.score >= 60 && lead.score < 80) ||
      (scoreFilter === "low" && lead.score < 60);
    
    return matchesSearch && matchesStatus && matchesSource && matchesScore;
  });

  // Calculate metrics
  const metrics = {
    total: leads.length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    highScore: leads.filter(l => l.score >= 80).length,
    avgScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length || 0),
    conversionRate: Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) || 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'nurturing': return 'bg-purple-100 text-purple-800';
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'unqualified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateAIInsights = () => {
    toast({
      title: "AI Analysis Complete",
      description: "Lead scoring and insights have been updated with latest data"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Lead Management
          </h1>
          <p className="text-muted-foreground">AI-powered lead scoring and nurturing workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateAIInsights}>
            <Brain className="h-4 w-4 mr-2" />
            AI Scoring
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold text-green-600">{metrics.qualified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Score</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.highScore}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-amber-600">{metrics.avgScore}</p>
              </div>
              <Target className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold text-emerald-600">{metrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Lead Pipeline</TabsTrigger>
          <TabsTrigger value="scoring">AI Scoring</TabsTrigger>
          <TabsTrigger value="nurturing">Nurturing Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Pipeline</CardTitle>
              <CardDescription>
                Manage and track your lead pipeline with AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="nurturing">Nurturing</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="high">High (80+)</SelectItem>
                    <SelectItem value="medium">Medium (60-79)</SelectItem>
                    <SelectItem value="low">Low (&lt;60)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{lead.firstName} {lead.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{lead.title || 'Contact'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {lead.source}
                        </span>
                      </div>

                      {lead.aiInsights && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-1 mb-2">
                            <Sparkles className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">AI Insights</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Buying Intent:</span>
                              <span className="font-medium">{lead.aiInsights.buyingIntent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Best Time:</span>
                              <span className="font-medium">{lead.aiInsights.bestContactTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Preferred:</span>
                              <span className="font-medium capitalize">{lead.aiInsights.preferredChannel}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground mt-2">
                        Last activity: {new Date(lead.lastActivity).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Scoring Model
                </CardTitle>
                <CardDescription>
                  Machine learning model for lead qualification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Company Size</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engagement Level</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Industry Match</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Budget Indicators</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Score Distribution
                </CardTitle>
                <CardDescription>
                  Lead quality breakdown across score ranges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Quality (80-100)</span>
                    <span className="text-sm font-medium">{leads.filter(l => l.score >= 80).length} leads</span>
                  </div>
                  <Progress value={(leads.filter(l => l.score >= 80).length / leads.length) * 100} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Quality (60-79)</span>
                    <span className="text-sm font-medium">{leads.filter(l => l.score >= 60 && l.score < 80).length} leads</span>
                  </div>
                  <Progress value={(leads.filter(l => l.score >= 60 && l.score < 80).length / leads.length) * 100} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Quality (0-59)</span>
                    <span className="text-sm font-medium">{leads.filter(l => l.score < 60).length} leads</span>
                  </div>
                  <Progress value={(leads.filter(l => l.score < 60).length / leads.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nurturing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Nurturing Workflows
              </CardTitle>
              <CardDescription>
                Automated sequences for lead nurturing and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nurturing Workflows Coming Soon</p>
                <p>Automated email sequences and engagement workflows will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Lead generation and conversion performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Analytics Dashboard Coming Soon</p>
                <p>Detailed performance metrics and conversion analytics will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};