import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingPlaybackTracker } from "@/components/analytics/TrainingPlaybackTracker";
import { Activity, Users, Target, TrendingUp } from "lucide-react";

const BehaviorAnalytics = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Behavior Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into learner behavior patterns and engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2</div>
            <p className="text-xs text-muted-foreground">+3% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">+24% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="playback">Playback Tracking</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Analysis</TabsTrigger>
          <TabsTrigger value="struggles">Struggle Points</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrainingPlaybackTracker />
            
            <Card>
              <CardHeader>
                <CardTitle>Learning Pattern Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Learning Hours</span>
                    <span className="font-medium">9-11 AM, 2-4 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Session Length</span>
                    <span className="font-medium">23 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Effective Content</span>
                    <span className="font-medium">Interactive Videos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Common Drop-off Point</span>
                    <span className="font-medium">15:30 mark</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="playback" className="space-y-6">
          <TrainingPlaybackTracker />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed engagement analysis coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="struggles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Struggle Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Struggle point identification and recommendations coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BehaviorAnalytics;