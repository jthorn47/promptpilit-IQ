import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  Globe,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Download,
  Calendar,
  MapPin
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Sample data - In a real implementation, this would come from Google Analytics API
const sampleData = {
  realTimeUsers: 23,
  totalUsers: 1247,
  totalSessions: 1891,
  avgSessionDuration: "2m 34s",
  bounceRate: "45.2%",
  pageViews: 3456,
  newUsers: 892,
  returningUsers: 355,
  
  dailyData: [
    { date: "Jan 1", users: 120, sessions: 180, pageViews: 324 },
    { date: "Jan 2", users: 98, sessions: 145, pageViews: 289 },
    { date: "Jan 3", users: 156, sessions: 234, pageViews: 412 },
    { date: "Jan 4", users: 142, sessions: 198, pageViews: 378 },
    { date: "Jan 5", users: 189, sessions: 267, pageViews: 445 },
    { date: "Jan 6", users: 167, sessions: 245, pageViews: 398 },
    { date: "Jan 7", users: 134, sessions: 201, pageViews: 356 },
  ],
  
  topPages: [
    { page: "/", views: 1234, title: "Home Page" },
    { page: "/pricing", views: 567, title: "Pricing" },
    { page: "/admin", views: 345, title: "Admin Dashboard" },
    { page: "/auth", views: 234, title: "Authentication" },
    { page: "/blog", views: 189, title: "Blog" },
  ],
  
  devices: [
    { name: "Desktop", value: 65, count: 811 },
    { name: "Mobile", value: 28, count: 349 },
    { name: "Tablet", value: 7, count: 87 },
  ],
  
  countries: [
    { country: "United States", users: 456, percentage: 36.6 },
    { country: "Canada", users: 123, percentage: 9.9 },
    { country: "United Kingdom", users: 98, percentage: 7.9 },
    { country: "Germany", users: 87, percentage: 7.0 },
    { country: "France", users: 67, percentage: 5.4 },
  ],
  
  referrers: [
    { source: "Direct", users: 423, percentage: 33.9 },
    { source: "Google", users: 378, percentage: 30.3 },
    { source: "Social Media", users: 156, percentage: 12.5 },
    { source: "Email", users: 98, percentage: 7.9 },
    { source: "Other", users: 192, percentage: 15.4 },
  ]
};

const COLORS = ['#655DC6', '#8B7ED8', '#A99AE0', '#C7B7E8', '#E5D5F0'];

export const GoogleAnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState("7d");

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Desktop": return <Monitor className="w-4 h-4" />;
      case "Mobile": return <Smartphone className="w-4 h-4" />;
      case "Tablet": return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Analytics</h1>
          <p className="text-muted-foreground">Website performance and visitor insights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Property Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Property: Easelearn</h3>
              <p className="text-sm text-muted-foreground">Measurement ID: G-TWJXDYQW69</p>
              <p className="text-sm text-muted-foreground">URL: https://score.easelearn.com</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">{sampleData.realTimeUsers}</div>
          <p className="text-sm text-muted-foreground">Users currently on your site</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{sampleData.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(true)}
              <span className="text-sm text-green-600 ml-1">+12.5%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{sampleData.totalSessions.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(true)}
              <span className="text-sm text-green-600 ml-1">+8.3%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{sampleData.pageViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(false)}
              <span className="text-sm text-red-600 ml-1">-3.2%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Session Duration</p>
                <p className="text-2xl font-bold">{sampleData.avgSessionDuration}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(true)}
              <span className="text-sm text-green-600 ml-1">+5.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Website Traffic (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#655DC6" strokeWidth={2} />
                  <Line type="monotone" dataKey="sessions" stroke="#8B7ED8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{page.title}</h4>
                      <p className="text-sm text-muted-foreground">{page.page}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{page.views.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Types */}
            <Card>
              <CardHeader>
                <CardTitle>User Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>New Users</span>
                    <span className="font-semibold">{sampleData.newUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Returning Users</span>
                    <span className="font-semibold">{sampleData.returningUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleData.devices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device.name)}
                        <span>{device.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{device.count}</span>
                        <Badge variant="secondary">{device.value}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Data */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Top Countries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleData.countries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{country.country}</span>
                      <div className="flex items-center space-x-2">
                        <span>{country.users} users</span>
                        <Badge variant="outline">{country.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{sampleData.bounceRate}</div>
                <p className="text-sm text-muted-foreground">Percentage of single-page sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Views Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sampleData.dailyData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pageViews" fill="#655DC6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {sampleData.referrers.map((referrer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{referrer.source}</span>
                      <div className="flex items-center space-x-2">
                        <span>{referrer.users} users</span>
                        <Badge variant="outline">{referrer.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sampleData.referrers}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="users"
                      >
                        {sampleData.referrers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoogleAnalyticsPage;