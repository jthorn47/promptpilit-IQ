import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Zap,
  BarChart3,
  Download,
  RefreshCw,
  Bot,
  Lightbulb
} from "lucide-react";

const PredictiveAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("forecasting");

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictive Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered forecasting and predictive insights for strategic planning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            AI-Powered
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4.8M</div>
                <p className="text-xs text-muted-foreground">
                  Projected next quarter (+22%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Growth</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+67</div>
                <p className="text-xs text-muted-foreground">
                  Expected new clients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Model accuracy
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting Model</CardTitle>
              <CardDescription>
                Machine learning-based revenue predictions with trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Model Performance
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Current model accuracy: 87% with historical data spanning 24 months.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Forecasting Factors</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Seasonal trends and market cycles</li>
                    <li>• Client acquisition and retention rates</li>
                    <li>• Economic indicators and market conditions</li>
                    <li>• Historical performance patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Predictive risk analysis and early warning systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Risk analysis dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>
                AI-driven optimization recommendations and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Optimization tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Intelligent recommendations for business improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-semibold text-blue-900 mb-2">Revenue Optimization</h4>
                  <p className="text-sm text-blue-800">
                    Focus on enterprise clients in Q1 2025 for maximum revenue impact.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-semibold text-green-900 mb-2">Market Expansion</h4>
                  <p className="text-sm text-green-800">
                    Healthcare sector shows 34% growth potential in your region.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                  <h4 className="font-semibold text-orange-900 mb-2">Operational Efficiency</h4>
                  <p className="text-sm text-orange-800">
                    Automating client onboarding could reduce costs by 15%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;