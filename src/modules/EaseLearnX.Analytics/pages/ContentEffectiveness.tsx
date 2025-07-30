import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Clock, Target } from "lucide-react";

const ContentEffectiveness = () => {
  const contentData = [
    {
      title: "Workplace Violence Prevention - Intro",
      completion_rate: 94,
      avg_engagement: 8.2,
      struggle_points: 2,
      total_learners: 1234,
      avg_time: "12:30",
      effectiveness_score: 92
    },
    {
      title: "Sexual Harassment Training",
      completion_rate: 87,
      avg_engagement: 7.8,
      struggle_points: 3,
      total_learners: 856,
      avg_time: "18:45",
      effectiveness_score: 85
    },
    {
      title: "Safety Procedures Overview",
      completion_rate: 76,
      avg_engagement: 6.4,
      struggle_points: 5,
      total_learners: 654,
      avg_time: "25:12",
      effectiveness_score: 72
    }
  ];

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getEffectivenessLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    return "Needs Improvement";
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Content Effectiveness</h1>
        <p className="text-muted-foreground">
          Analyze how well your training content performs and identify areas for improvement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Effectiveness</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,744</div>
            <p className="text-xs text-muted-foreground">Across all content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18:49</div>
            <p className="text-xs text-muted-foreground">Per training module</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.1/10</div>
            <p className="text-xs text-muted-foreground">Learner feedback</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Performance Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of how each training module performs
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {contentData.map((content, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{content.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={`${getEffectivenessColor(content.effectiveness_score)} text-white`}
                  >
                    {getEffectivenessLabel(content.effectiveness_score)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Completion Rate</p>
                    <p className="font-medium">{content.completion_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Engagement</p>
                    <p className="font-medium">{content.avg_engagement}/10</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Struggle Points</p>
                    <p className="font-medium">{content.struggle_points}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Learners</p>
                    <p className="font-medium">{content.total_learners.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Time</p>
                    <p className="font-medium">{content.avg_time}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Effectiveness Score</span>
                    <span>{content.effectiveness_score}%</span>
                  </div>
                  <Progress value={content.effectiveness_score} className="h-2" />
                </div>

                {content.struggle_points > 3 && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-900 font-medium">⚠️ High Struggle Points Detected</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Consider reviewing content complexity or adding interactive elements
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentEffectiveness;