import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Users, 
  Target,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface ScenarioReviewProps {
  userPath: string[];
  outcome: 'optimal' | 'risky' | 'harmful';
  finalScore: number;
  peerComparison: {
    outcomeStats: {
      optimal: number;
      risky: number; 
      harmful: number;
      total: number;
    };
    avgScore: number;
    commonPaths: Array<{
      path: string;
      count: number;
      percentage: number;
    }>;
  };
  onRetry: () => void;
  onContinue: () => void;
  alternativePaths?: Array<{
    path: string[];
    outcome: 'optimal' | 'risky' | 'harmful';
    description: string;
  }>;
}

const getOutcomeIcon = (outcome: string) => {
  switch (outcome) {
    case 'optimal':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'risky':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'harmful':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case 'optimal':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'risky':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'harmful':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export const ScenarioReviewPanel: React.FC<ScenarioReviewProps> = ({
  userPath,
  outcome,
  finalScore,
  peerComparison,
  onRetry,
  onContinue,
  alternativePaths = []
}) => {
  const pathString = userPath.join(' → ');
  const userOutcomePercentage = (peerComparison.outcomeStats[outcome] / peerComparison.outcomeStats.total) * 100;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Main Outcome */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getOutcomeIcon(outcome)}
            <span>Scenario Complete</span>
            <Badge className={getOutcomeColor(outcome)}>
              {outcome.charAt(0).toUpperCase() + outcome.slice(1)} Outcome
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Your Decision Path:</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{pathString}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Score:</span>
              <div className="flex items-center space-x-2">
                <Progress value={finalScore} className="w-20" />
                <span className="text-sm font-medium">{finalScore}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peer Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>How Others Performed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((peerComparison.outcomeStats.optimal / peerComparison.outcomeStats.total) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Optimal</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round((peerComparison.outcomeStats.risky / peerComparison.outcomeStats.total) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Risky</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round((peerComparison.outcomeStats.harmful / peerComparison.outcomeStats.total) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Harmful</p>
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">{Math.round(userOutcomePercentage)}%</span> of peers in your role 
                achieved the same <span className="font-medium">{outcome}</span> outcome
              </p>
              {finalScore < peerComparison.avgScore && (
                <p className="text-xs text-muted-foreground mt-1">
                  Average peer score: {Math.round(peerComparison.avgScore)}%
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Paths */}
      {peerComparison.commonPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Popular Decision Paths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peerComparison.commonPaths.map((pathData, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-mono">{pathData.path}</span>
                  <Badge variant="outline">{Math.round(pathData.percentage)}% chose this</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Paths */}
      {alternativePaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Alternative Approaches</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alternativePaths.map((alt, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{alt.path.join(' → ')}</span>
                    <Badge className={getOutcomeColor(alt.outcome)}>
                      {alt.outcome}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alt.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onRetry} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Different Strategy
        </Button>
        <Button onClick={onContinue} className="flex-1">
          Continue Learning
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};