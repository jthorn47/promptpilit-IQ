// Client Recommendations - AI-powered benefits insights
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb,
  TrendingUp,
  DollarSign,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";

interface ClientRecommendationsProps {
  companyId: string;
}

interface Recommendation {
  id: string;
  category: 'cost' | 'plan-design' | 'compliance' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  savings: number;
  effort: 'low' | 'medium' | 'high';
  status: 'new' | 'in-progress' | 'completed' | 'dismissed';
  actionItems: string[];
}

export const ClientRecommendations: React.FC<ClientRecommendationsProps> = ({ 
  companyId 
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadRecommendations();
  }, [companyId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Mock recommendations - in real app, this would come from AI analysis
      setRecommendations([
        {
          id: '1',
          category: 'cost',
          priority: 'high',
          title: 'Optimize Medical Plan Carriers',
          description: 'Consider switching to a more cost-effective carrier while maintaining coverage levels.',
          impact: 'Potential annual savings of $15,000-$20,000',
          savings: 17500,
          effort: 'medium',
          status: 'new',
          actionItems: [
            'Request quotes from 3 alternative carriers',
            'Compare plan designs and networks',
            'Conduct employee impact analysis',
            'Schedule carrier presentations'
          ]
        },
        {
          id: '2',
          category: 'plan-design',
          priority: 'medium',
          title: 'Introduce High-Deductible Health Plan Option',
          description: 'Add an HDHP with HSA to provide cost-conscious employees with a lower-premium option.',
          impact: 'Reduce employer costs by 12-15% for participants',
          savings: 8500,
          effort: 'low',
          status: 'new',
          actionItems: [
            'Design HDHP benefit structure',
            'Select HSA administrator',
            'Develop employee education materials',
            'Plan open enrollment communication'
          ]
        },
        {
          id: '3',
          category: 'strategy',
          priority: 'high',
          title: 'Implement Wellness Program',
          description: 'Launch a comprehensive wellness program to reduce healthcare costs and improve employee engagement.',
          impact: 'Potential 8-12% reduction in medical claims',
          savings: 12000,
          effort: 'high',
          status: 'new',
          actionItems: [
            'Partner with wellness vendor',
            'Define program components and incentives',
            'Establish biometric screening schedule',
            'Create participation tracking system'
          ]
        },
        {
          id: '4',
          category: 'compliance',
          priority: 'medium',
          title: 'Update COBRA Administration',
          description: 'Streamline COBRA administration processes to ensure compliance and reduce administrative burden.',
          impact: 'Reduce compliance risk and administrative time',
          savings: 3000,
          effort: 'low',
          status: 'in-progress',
          actionItems: [
            'Review current COBRA procedures',
            'Implement automated notification system',
            'Update tracking spreadsheets',
            'Train HR staff on new processes'
          ]
        },
        {
          id: '5',
          category: 'cost',
          priority: 'low',
          title: 'Voluntary Benefits Expansion',
          description: 'Add voluntary benefits to enhance the package while reducing employer costs.',
          impact: 'No additional employer cost, improved employee satisfaction',
          savings: 0,
          effort: 'low',
          status: 'new',
          actionItems: [
            'Research voluntary benefit options',
            'Request vendor proposals',
            'Survey employee interest',
            'Negotiate implementation terms'
          ]
        }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'plan-design': return <Shield className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'strategy': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cost': return 'bg-green-50 text-green-700';
      case 'plan-design': return 'bg-blue-50 text-blue-700';
      case 'compliance': return 'bg-purple-50 text-purple-700';
      case 'strategy': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-700';
      case 'in-progress': return 'bg-yellow-50 text-yellow-700';
      case 'completed': return 'bg-green-50 text-green-700';
      case 'dismissed': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const updateRecommendationStatus = (id: string, status: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: status as any } : rec)
    );
  };

  const filteredRecommendations = recommendations.filter(rec => 
    selectedCategory === 'all' || rec.category === selectedCategory
  );

  const totalSavings = recommendations
    .filter(rec => rec.status !== 'dismissed')
    .reduce((sum, rec) => sum + rec.savings, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Recommendations
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered insights to optimize your benefits program
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="cost">Cost Optimization</option>
                <option value="plan-design">Plan Design</option>
                <option value="compliance">Compliance</option>
                <option value="strategy">Strategy</option>
              </select>
              <Button variant="outline" onClick={loadRecommendations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold">${totalSavings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">
                  {recommendations.filter(r => r.priority === 'high').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {recommendations.filter(r => r.status === 'in-progress').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                <p className="text-muted-foreground">
                  {selectedCategory !== 'all' 
                    ? 'No recommendations found for the selected category.'
                    : 'All recommendations have been addressed.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1.5 rounded-lg ${getCategoryColor(recommendation.category)}`}>
                          {getCategoryIcon(recommendation.category)}
                        </div>
                        <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <Badge className={getCategoryColor(recommendation.category)}>
                          {recommendation.category.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(recommendation.status)}>
                          {recommendation.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {recommendation.savings > 0 && (
                        <div className="text-2xl font-bold text-green-600">
                          ${recommendation.savings.toLocaleString()}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Effort: <span className={getEffortColor(recommendation.effort)}>
                          {recommendation.effort}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-muted-foreground mb-2">{recommendation.description}</p>
                    <p className="text-sm font-medium">{recommendation.impact}</p>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="font-medium mb-2">Action Items:</h4>
                    <ul className="space-y-1">
                      {recommendation.actionItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    {recommendation.status === 'new' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => updateRecommendationStatus(recommendation.id, 'in-progress')}
                        >
                          Start Implementation
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateRecommendationStatus(recommendation.id, 'dismissed')}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                    {recommendation.status === 'in-progress' && (
                      <Button 
                        size="sm"
                        onClick={() => updateRecommendationStatus(recommendation.id, 'completed')}
                      >
                        Mark Complete
                        <CheckCircle className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                    {recommendation.status === 'completed' && (
                      <Badge className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};