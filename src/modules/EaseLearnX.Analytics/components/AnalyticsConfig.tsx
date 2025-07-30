import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Brain, Target } from "lucide-react";
import { useState } from "react";

const AnalyticsConfig = () => {
  const [config, setConfig] = useState({
    behaviorTracking: true,
    realTimeAnalytics: true,
    aiInsights: false,
    contentRecommendations: true,
    strugglerDetection: true,
    engagementAlerts: false
  });

  const handleConfigChange = (key: string, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">EaseLearnX Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Configure intelligent learning behavior analytics
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Experimental
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Core Analytics Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="behavior-tracking">Behavior Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track learner interactions, pause patterns, and engagement
                </p>
              </div>
              <Switch
                id="behavior-tracking"
                checked={config.behaviorTracking}
                onCheckedChange={(value) => handleConfigChange('behaviorTracking', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="realtime-analytics">Real-time Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Live dashboard updates and instant metrics
                </p>
              </div>
              <Switch
                id="realtime-analytics"
                checked={config.realTimeAnalytics}
                onCheckedChange={(value) => handleConfigChange('realTimeAnalytics', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="content-recommendations">Content Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  AI-powered suggestions for improving content effectiveness
                </p>
              </div>
              <Switch
                id="content-recommendations"
                checked={config.contentRecommendations}
                onCheckedChange={(value) => handleConfigChange('contentRecommendations', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Advanced Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-insights">AI Learning Insights</Label>
                <p className="text-sm text-muted-foreground">
                  Machine learning analysis of learning patterns
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Beta</Badge>
                <Switch
                  id="ai-insights"
                  checked={config.aiInsights}
                  onCheckedChange={(value) => handleConfigChange('aiInsights', value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="struggler-detection">Struggling Learner Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically identify learners who need additional support
                </p>
              </div>
              <Switch
                id="struggler-detection"
                checked={config.strugglerDetection}
                onCheckedChange={(value) => handleConfigChange('strugglerDetection', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="engagement-alerts">Engagement Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Real-time notifications for low engagement patterns
                </p>
              </div>
              <Switch
                id="engagement-alerts"
                checked={config.engagementAlerts}
                onCheckedChange={(value) => handleConfigChange('engagementAlerts', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900">EaseLearnX Intelligence</h3>
                <p className="text-sm text-purple-700 mt-1">
                  This experimental module uses advanced analytics to transform how learners interact with content. 
                  Data is processed to identify struggle points, optimize learning paths, and provide personalized recommendations.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    Behavior Analysis
                  </Badge>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    Predictive Learning
                  </Badge>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    Content Optimization
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsConfig;