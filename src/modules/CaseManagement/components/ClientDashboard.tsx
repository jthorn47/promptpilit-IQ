import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Filter,
  Mail,
  Plus,
  Heart,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ClientExperienceService, type ClientDashboardData, type ClientCase } from '../services/ClientExperienceService';
import { ClientBenefitsIQ } from '@/modules/Halo.BenefitsIQ/components/client/ClientBenefitsIQ';

interface ClientDashboardProps {
  companyId: string;
  companyName: string;
  onCreateCase?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  companyId, 
  companyName,
  onCreateCase 
}) => {
  const [dashboardData, setDashboardData] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, [companyId]);

  const loadDashboardData = async () => {
    try {
      const { data, error } = await ClientExperienceService.getClientDashboard(companyId);
      if (error) throw error;
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterCases = (cases: ClientCase[]) => {
    return cases.filter(case_ => {
      const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           case_.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || case_.type === selectedType;
      return matchesSearch && matchesType;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'waiting': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'closed': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hr': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'payroll': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'benefits': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'compliance': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getUniqueTypes = () => {
    if (!dashboardData) return [];
    const allCases = [...dashboardData.openCases, ...dashboardData.closedCases];
    return Array.from(new Set(allCases.map(c => c.type)));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Unable to load your case dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
          <p className="text-muted-foreground">{companyName}</p>
        </div>
        {onCreateCase && (
          <Button onClick={onCreateCase} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold">{dashboardData.openCases.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">{dashboardData.totalCases}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{dashboardData.avgResolutionTime}d</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Navigation Tabs */}
      <Tabs defaultValue="support" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Support Cases
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Benefits Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="space-y-4">
          {/* Cases Sub-Tabs */}
          <Tabs defaultValue="open" className="space-y-4">
            <TabsList>
              <TabsTrigger value="open">
                Open Cases ({filterCases(dashboardData.openCases).length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed Cases ({filterCases(dashboardData.closedCases).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {filterCases(dashboardData.openCases).length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Open Cases</h3>
                      <p className="text-muted-foreground">All your cases are resolved!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filterCases(dashboardData.openCases).map(case_ => (
                    <Card key={case_.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{case_.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className={getStatusColor(case_.status)}>
                                {case_.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={getPriorityColor(case_.priority)}>
                                {case_.priority.toUpperCase()}
                              </Badge>
                              <Badge className={getTypeColor(case_.type)}>
                                {case_.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Created {format(new Date(case_.created_at), 'MMM d, yyyy')}</span>
                          <span>Updated {format(new Date(case_.updated_at), 'MMM d, yyyy')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              {filterCases(dashboardData.closedCases).length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Closed Cases</h3>
                      <p className="text-muted-foreground">No cases have been closed yet.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filterCases(dashboardData.closedCases).map(case_ => (
                    <Card key={case_.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{case_.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className={getStatusColor(case_.status)}>
                                RESOLVED
                              </Badge>
                              <Badge className={getPriorityColor(case_.priority)}>
                                {case_.priority.toUpperCase()}
                              </Badge>
                              <Badge className={getTypeColor(case_.type)}>
                                {case_.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Created {format(new Date(case_.created_at), 'MMM d, yyyy')}</span>
                          <span>Resolved {format(new Date(case_.updated_at), 'MMM d, yyyy')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <ClientBenefitsIQ 
            companyId={companyId} 
            companyName={companyName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};