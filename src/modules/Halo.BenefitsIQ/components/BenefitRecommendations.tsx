import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DollarSign, 
  Shield, 
  Settings, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Target,
  BarChart3,
  FileText,
  X,
  Archive,
  RefreshCw
} from 'lucide-react';

interface BenefitRecommendationsProps {
  companyId: string;
}

interface Recommendation {
  id: string;
  category: 'cost' | 'design' | 'compliance' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  supportingData: {
    currentValue?: string;
    benchmarkValue?: string;
    potentialSavings?: string;
    affectedEmployees?: number;
    percentageDifference?: number;
  };
  actions: Array<{
    label: string;
    type: 'primary' | 'secondary';
    action: string;
  }>;
  status: 'active' | 'dismissed' | 'archived';
}

export const BenefitRecommendations: React.FC<BenefitRecommendationsProps> = ({ companyId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    cost: true,
    design: true,
    compliance: true,
    strategy: false
  });

  // Mock recommendations data - in real app this would come from AI analysis
  const mockRecommendations: Recommendation[] = [
    {
      id: '1',
      category: 'cost',
      priority: 'high',
      title: 'Medical Premium Cost Above Market',
      description: 'Your medical plan premiums are 22% above industry average for similar companies.',
      reasoning: 'Based on Healthcare industry benchmarks for companies with 51-200 employees in your region.',
      supportingData: {
        currentValue: '$650/month',
        benchmarkValue: '$520/month',
        potentialSavings: '$180,000 annually',
        affectedEmployees: 145,
        percentageDifference: 22
      },
      actions: [
        { label: 'Run Cost Scenario', type: 'primary', action: 'scenario' },
        { label: 'View Benchmarks', type: 'secondary', action: 'benchmark' }
      ],
      status: 'active'
    },
    {
      id: '2',
      category: 'compliance',
      priority: 'high',
      title: 'ACA Affordability Risk',
      description: 'Current employee-only contribution may exceed ACA affordability threshold for 12% of workforce.',
      reasoning: 'Based on 2024 FPL guidelines and current contribution amounts.',
      supportingData: {
        currentValue: '9.8% of income',
        benchmarkValue: '9.12% maximum',
        affectedEmployees: 18
      },
      actions: [
        { label: 'Adjust Contributions', type: 'primary', action: 'contribution' },
        { label: 'View Details', type: 'secondary', action: 'details' }
      ],
      status: 'active'
    },
    {
      id: '3',
      category: 'design',
      priority: 'medium',
      title: 'Consider HSA-Eligible Plan',
      description: 'Adding a high-deductible health plan with HSA could provide tax advantages and employee choice.',
      reasoning: '78% of similar companies offer HDHP options, and it could reduce premium costs by 15-25%.',
      supportingData: {
        potentialSavings: '$85,000 annually',
        percentageDifference: 78
      },
      actions: [
        { label: 'Design HDHP', type: 'primary', action: 'design' },
        { label: 'Compare Plans', type: 'secondary', action: 'compare' }
      ],
      status: 'active'
    },
    {
      id: '4',
      category: 'strategy',
      priority: 'medium',
      title: 'Optimize Contribution Strategy',
      description: 'Consider moving from flat dollar to percentage-based contributions for better tier balance.',
      reasoning: 'Current 100% employer contribution across all tiers is above market norms of 70-85%.',
      supportingData: {
        currentValue: '100% all tiers',
        benchmarkValue: '70-85% typical',
        potentialSavings: '$120,000 annually'
      },
      actions: [
        { label: 'Model Strategy', type: 'primary', action: 'strategy' },
        { label: 'View Impact', type: 'secondary', action: 'impact' }
      ],
      status: 'active'
    },
    {
      id: '5',
      category: 'design',
      priority: 'low',
      title: 'Dental Plan Enhancement',
      description: 'Current dental annual maximum is below regional average.',
      reasoning: 'Regional average is $2,000 vs your current $1,500 maximum.',
      supportingData: {
        currentValue: '$1,500',
        benchmarkValue: '$2,000',
        percentageDifference: -25
      },
      actions: [
        { label: 'Review Options', type: 'secondary', action: 'review' }
      ],
      status: 'active'
    }
  ];

  const [recommendations, setRecommendations] = useState(mockRecommendations);

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: 'dismissed' } : rec)
    );
  };

  const handleArchiveRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: 'archived' } : rec)
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cost': return DollarSign;
      case 'design': return Settings;
      case 'compliance': return Shield;
      case 'strategy': return TrendingUp;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cost': return 'text-green-600';
      case 'design': return 'text-blue-600';
      case 'compliance': return 'text-red-600';
      case 'strategy': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const activeRecommendations = recommendations.filter(rec => rec.status === 'active');
  const groupedRecommendations = activeRecommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const categoryStats = {
    cost: { count: groupedRecommendations.cost?.length || 0, totalSavings: '$385,000' },
    design: { count: groupedRecommendations.design?.length || 0, totalSavings: '$85,000' },
    compliance: { count: groupedRecommendations.compliance?.length || 0, totalSavings: '-' },
    strategy: { count: groupedRecommendations.strategy?.length || 0, totalSavings: '$120,000' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Benefit Recommendations</h2>
          <p className="text-muted-foreground">AI-powered suggestions for optimizing your benefits strategy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isGenerating}>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleGenerateRecommendations} disabled={isGenerating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Refresh Analysis'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recommendations</p>
                <p className="text-2xl font-bold">{activeRecommendations.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {activeRecommendations.filter(r => r.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">$590k</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Issues</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activeRecommendations.filter(r => r.category === 'compliance').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Categories */}
      <div className="space-y-4">
        {Object.entries(groupedRecommendations).map(([category, categoryRecs]) => {
          const Icon = getCategoryIcon(category);
          const colorClass = getCategoryColor(category);
          const stats = categoryStats[category as keyof typeof categoryStats];
          
          return (
            <Card key={category}>
              <Collapsible 
                open={expandedCategories[category as keyof typeof expandedCategories]} 
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                        <div>
                          <CardTitle className="capitalize">{category} Optimization</CardTitle>
                          <CardDescription>
                            {stats.count} recommendation{stats.count !== 1 ? 's' : ''} 
                            {stats.totalSavings !== '-' && ` • Potential savings: ${stats.totalSavings}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{stats.count}</Badge>
                        {expandedCategories[category as keyof typeof expandedCategories] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {categoryRecs.map((recommendation) => (
                        <div key={recommendation.id} className="border rounded-lg p-4 space-y-3">
                          {/* Recommendation Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{recommendation.title}</h4>
                                <Badge variant={getPriorityBadgeVariant(recommendation.priority)}>
                                  {recommendation.priority} priority
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {recommendation.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <HelpCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{recommendation.reasoning}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleArchiveRecommendation(recommendation.id)}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDismissRecommendation(recommendation.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Supporting Data */}
                          {recommendation.supportingData && (
                            <div className="bg-muted/30 rounded-lg p-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {recommendation.supportingData.currentValue && (
                                  <div>
                                    <span className="text-muted-foreground">Current:</span>
                                    <div className="font-medium">{recommendation.supportingData.currentValue}</div>
                                  </div>
                                )}
                                {recommendation.supportingData.benchmarkValue && (
                                  <div>
                                    <span className="text-muted-foreground">Benchmark:</span>
                                    <div className="font-medium">{recommendation.supportingData.benchmarkValue}</div>
                                  </div>
                                )}
                                {recommendation.supportingData.potentialSavings && (
                                  <div>
                                    <span className="text-muted-foreground">Potential Savings:</span>
                                    <div className="font-medium text-green-600">{recommendation.supportingData.potentialSavings}</div>
                                  </div>
                                )}
                                {recommendation.supportingData.affectedEmployees && (
                                  <div>
                                    <span className="text-muted-foreground">Affected Employees:</span>
                                    <div className="font-medium">{recommendation.supportingData.affectedEmployees}</div>
                                  </div>
                                )}
                              </div>
                              {recommendation.supportingData.percentageDifference && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Difference from benchmark</span>
                                    <span className={recommendation.supportingData.percentageDifference > 0 ? 'text-red-600' : 'text-green-600'}>
                                      {recommendation.supportingData.percentageDifference > 0 ? '+' : ''}{recommendation.supportingData.percentageDifference}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={Math.abs(recommendation.supportingData.percentageDifference)} 
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {recommendation.actions.map((action, index) => (
                              <Button 
                                key={index}
                                variant={action.type === 'primary' ? 'default' : 'outline'}
                                size="sm"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {activeRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">All Recommendations Complete</h3>
            <p className="text-muted-foreground mb-4">
              Great job! You've addressed all current recommendations for your benefits program.
            </p>
            <Button onClick={handleGenerateRecommendations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for New Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};