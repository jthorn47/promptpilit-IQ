import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Megaphone, 
  Plus,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";

const SocialMedia = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Management</h1>
          <p className="text-muted-foreground">
            Manage your social media presence and track engagement across platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Marketing IQ
          </Badge>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,847</div>
                <p className="text-xs text-muted-foreground">
                  +1,234 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48.7K</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.8%</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posts This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Across all platforms
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Facebook</CardTitle>
                  <Facebook className="h-6 w-6 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Followers</span>
                    <span className="font-medium">4,567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reach</span>
                    <span className="font-medium">18.2K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <span className="font-medium">5.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">LinkedIn</CardTitle>
                  <Linkedin className="h-6 w-6 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connections</span>
                    <span className="font-medium">3,289</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reach</span>
                    <span className="font-medium">15.8K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <span className="font-medium">8.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Twitter</CardTitle>
                  <Twitter className="h-6 w-6 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Followers</span>
                    <span className="font-medium">2,891</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Impressions</span>
                    <span className="font-medium">9.4K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <span className="font-medium">4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Instagram</CardTitle>
                  <Instagram className="h-6 w-6 text-pink-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Followers</span>
                    <span className="font-medium">2,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reach</span>
                    <span className="font-medium">5.3K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <span className="font-medium">7.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest social media posts and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    platform: "LinkedIn",
                    content: "Excited to announce our new HR solution that helps companies...",
                    time: "2 hours ago",
                    likes: 47,
                    comments: 12,
                    shares: 8,
                    reach: "1.2K"
                  },
                  {
                    platform: "Facebook",
                    content: "Check out our latest case study on improving employee retention...",
                    time: "4 hours ago", 
                    likes: 23,
                    comments: 5,
                    shares: 3,
                    reach: "856"
                  },
                  {
                    platform: "Twitter",
                    content: "5 tips for better workforce management in the digital age",
                    time: "6 hours ago",
                    likes: 18,
                    comments: 7,
                    shares: 12,
                    reach: "1.8K"
                  }
                ].map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{post.platform}</Badge>
                      <div>
                        <p className="text-sm">{post.content}</p>
                        <p className="text-xs text-muted-foreground">{post.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {post.shares}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.reach}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                Manage and schedule your social media posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content calendar coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Social media analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Scheduler</CardTitle>
              <CardDescription>
                Schedule posts across all your social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Post scheduling interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMedia;