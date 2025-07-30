import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Clock, 
  ArrowRight,
  Lightbulb,
  Star
} from "lucide-react";
import { ModuleDefinition, MODULE_DEFINITIONS } from "@/types/modules";

interface ModuleRecommendation {
  moduleId: string;
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: 'efficiency' | 'compliance' | 'growth' | 'cost_savings';
  estimatedImpact: {
    timesSaved: string;
    costReduction?: string;
    complianceImprovement?: string;
  };
}

interface IntelligentRecommendationsProps {
  recommendations: ModuleRecommendation[];
  onEnableModule: (moduleId: string) => void;
  loading: boolean;
}

export const IntelligentRecommendations = ({ 
  recommendations, 
  onEnableModule, 
  loading 
}: IntelligentRecommendationsProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency': return TrendingUp;
      case 'compliance': return Target;
      case 'growth': return Star;
      case 'cost_savings': return DollarSign;
      default: return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'efficiency': return 'bg-blue-500/10 text-blue-700';
      case 'compliance': return 'bg-red-500/10 text-red-700';
      case 'growth': return 'bg-green-500/10 text-green-700';
      case 'cost_savings': return 'bg-purple-500/10 text-purple-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Intelligent Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Intelligent Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Your module configuration is optimized! No additional recommendations at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Intelligent Recommendations
          <Badge variant="secondary" className="ml-auto">
            {recommendations.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => {
          const module = MODULE_DEFINITIONS.find(m => m.id === rec.moduleId);
          const CategoryIcon = getCategoryIcon(rec.category);
          
          if (!module) return null;

          return (
            <div key={rec.moduleId} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{module.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(rec.category)}`}
                    >
                      <CategoryIcon className="w-3 h-3 mr-1" />
                      {rec.category.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(rec.priority)}`}
                    >
                      {rec.priority} priority
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {rec.reason}
                  </p>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Save {rec.estimatedImpact.timesSaved}</span>
                    </div>
                    {rec.estimatedImpact.costReduction && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Reduce costs by {rec.estimatedImpact.costReduction}</span>
                      </div>
                    )}
                    {rec.estimatedImpact.complianceImprovement && (
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{rec.estimatedImpact.complianceImprovement}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">Match Score</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {Math.round(rec.score)}%
                    </div>
                    <Progress value={rec.score} className="w-16 h-2" />
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onEnableModule(rec.moduleId)}
                    className="shrink-0"
                  >
                    Enable Module
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Recommendations are based on your industry, company size, current usage patterns, and compliance requirements.</p>
        </div>
      </CardContent>
    </Card>
  );
};