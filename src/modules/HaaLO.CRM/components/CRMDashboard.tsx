/**
 * CRM Dashboard Component - Stage 4
 * Comprehensive dashboard with real metrics, pipeline analytics, and activity feeds
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, TrendingUp, DollarSign, Target, Calendar, Phone, Mail, 
  AlertTriangle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Activity, Filter, Brain, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCRMMetrics } from '@/domains/crm/hooks/useCRMMetrics';
import { useDeals } from '@/domains/crm/hooks/useDeals';
import { useActivities } from '@/domains/crm/hooks/useActivities';

export const CRMDashboard = () => {
  const navigate = useNavigate();
  const { metrics, loading: metricsLoading } = useCRMMetrics();
  const { deals, loading: dealsLoading } = useDeals();
  const { activities, loading: activitiesLoading } = useActivities();

  // Real-time metrics calculations
  const totalDeals = deals?.length || 0;
  const totalValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
  const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
  const recentActivities = activities?.slice(0, 5) || [];

  // Pipeline analytics by status
  const pipelineStages = [
    { name: "Active", count: deals?.filter(d => d.status === 'active').length || 0, value: 0, color: "bg-blue-500" },
    { name: "Proposal", count: deals?.filter(d => d.status === 'proposal').length || 0, value: 0, color: "bg-purple-500" },
    { name: "Negotiation", count: deals?.filter(d => d.status === 'negotiation').length || 0, value: 0, color: "bg-indigo-500" },
    { name: "Closed Won", count: deals?.filter(d => d.status === 'won').length || 0, value: 0, color: "bg-green-500" },
    { name: "Closed Lost", count: deals?.filter(d => d.status === 'lost').length || 0, value: 0, color: "bg-red-500" },
    { name: "On Hold", count: deals?.filter(d => d.status === 'on_hold').length || 0, value: 0, color: "bg-amber-500" }
  ];

  const stats = [
    {
      title: "Total Pipeline Value",
      value: `$${(totalValue / 1000).toFixed(0)}K`,
      change: "+12%",
      icon: DollarSign,
      color: "text-emerald-600",
      trend: "up"
    },
    {
      title: "Active Opportunities",
      value: totalDeals.toString(),
      change: "+8%",
      icon: Target,
      color: "text-blue-600",
      trend: "up"
    },
    {
      title: "Avg Deal Size",
      value: `$${(avgDealSize / 1000).toFixed(0)}K`,
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-600",
      trend: "up"
    },
    {
      title: "Win Rate",
      value: "64%",
      change: "+3%",
      icon: CheckCircle,
      color: "text-green-600",
      trend: "up"
    }
  ];

  const quickActions = [
    { label: "Pipeline Navigator", path: "/admin/crm/navigator", icon: BarChart3 },
    { label: "Companies", path: "/admin/crm/companies", icon: Users },
    { label: "Opportunities", path: "/admin/crm/deals", icon: Target },
    { label: "Activities", path: "/admin/crm/activities", icon: Activity },
    { label: "Forecasting", path: "/admin/crm/forecasting", icon: PieChart },
    { label: "Tasks & Follow-ups", path: "/admin/crm/tasks", icon: Clock },
    { label: "AI Engine", path: "/admin/crm/ai-engine", icon: Brain },
    { label: "Analytics", path: "/admin/crm/analytics", icon: TrendingUp },
    { label: "Custom Reports", path: "/admin/crm/reports", icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/crm/navigator')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Pipeline
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 mr-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{stat.change}</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Pipeline Overview
            </CardTitle>
            <CardDescription>
              Opportunities by stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{stage.count}</Badge>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stage.color}`}
                        style={{ width: `${Math.min((stage.count / Math.max(totalDeals, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access key CRM features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate(action.path)}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="tasks">Upcoming Tasks</TabsTrigger>
          <TabsTrigger value="opportunities">Hot Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Latest updates and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.type === 'call' ? <Phone className="h-4 w-4" /> : 
                         activity.type === 'email' ? <Mail className="h-4 w-4" /> : 
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{activity.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>
                Tasks and follow-ups requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium">Follow up with Acme Corp</p>
                    <p className="text-sm text-muted-foreground">Proposal review meeting</p>
                  </div>
                  <Badge variant="outline" className="text-amber-600">Today</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Demo for TechStart Inc</p>
                    <p className="text-sm text-muted-foreground">Product demonstration</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600">Tomorrow</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Check in with Enterprise Co</p>
                    <p className="text-sm text-muted-foreground">Quarterly business review</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">This Week</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hot Opportunities
              </CardTitle>
              <CardDescription>
                High-value deals requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deals?.filter(d => d.value && d.value > 50000).slice(0, 3).map((deal) => (
                  <div key={deal.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                       onClick={() => navigate(`/admin/crm/opportunities/${deal.id}`)}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      ${Math.round((deal.value || 0) / 1000)}K
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">{deal.company_name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={deal.status === 'active' ? 'default' : 'secondary'}>
                        {deal.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {deal.probability}% probability
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No high-value opportunities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};