import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const LearnerInsights = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Learner Insights</h1>
        <p className="text-muted-foreground">
          AI-powered insights into individual learner behavior and performance patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Style</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Visual</div>
            <p className="text-xs text-muted-foreground">85% confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Improving</div>
            <p className="text-xs text-muted-foreground">+15% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Low</div>
            <p className="text-xs text-muted-foreground">Stable performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Individual Learner Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Detailed learner profiles and personalized recommendations will be displayed here based on behavioral analytics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm text-blue-900">Optimize Learning Time</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Learner performs best during 9-11 AM sessions
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-sm text-green-900">Content Preference</h4>
                <p className="text-xs text-green-700 mt-1">
                  Responds well to interactive video content
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-sm text-amber-900">Attention Alert</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Consider shorter sessions for complex topics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearnerInsights;