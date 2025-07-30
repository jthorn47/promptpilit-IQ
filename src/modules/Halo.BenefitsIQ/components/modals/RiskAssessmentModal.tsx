
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertTriangle, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useRiskAssessment } from '../../hooks/useAnalytics';

interface RiskAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const RiskAssessmentModal: React.FC<RiskAssessmentModalProps> = ({
  open,
  onOpenChange,
  companyId,
}) => {
  const { data: riskData, isLoading, error } = useRiskAssessment(companyId);

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Risk Assessment</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p>Error loading risk assessment. Please try again later.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Risk Assessment Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading risk assessment...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Risk Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Overall Risk Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={riskData?.overall_score || 0} className="h-3" />
                    </div>
                    <div className="text-2xl font-bold">
                      {riskData?.overall_score || 0}%
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on enrollment patterns, cost trends, and utilization data
                  </p>
                </CardContent>
              </Card>

              {/* Risk Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskData?.risk_categories?.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="capitalize">{category.category}</span>
                        {getRiskIcon(category.risk_level)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Risk Level</span>
                            <Badge 
                              variant={category.risk_level === 'high' ? 'destructive' : 
                                      category.risk_level === 'medium' ? 'default' : 'secondary'}
                            >
                              {category.risk_level}
                            </Badge>
                          </div>
                          <Progress value={category.score} className="h-2" />
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-1">Key Factors</h5>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {category.factors?.map((factor, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="w-1 h-1 bg-current rounded-full mt-1.5 flex-shrink-0" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recommendations */}
              {riskData?.recommendations && riskData.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Mitigation Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskData.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium">{rec.title}</h5>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                            {rec.priority && (
                              <Badge variant="outline" className="mt-2">
                                {rec.priority} Priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
