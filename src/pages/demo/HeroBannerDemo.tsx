import React, { useState } from 'react';
import { IntelligentHeroBanner } from '@/components/hero/IntelligentHeroBanner';
import { CustomizableWidgetArea } from '@/components/widgets/CustomizableWidgetArea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const HeroBannerDemo = () => {
  const [userName, setUserName] = useState('Sarah Johnson');
  const [userRole, setUserRole] = useState('Marketing Director');
  const [contextType, setContextType] = useState<'crm' | 'pulse' | 'vault' | 'general'>('general');
  const [adminMessage, setAdminMessage] = useState('🎉 Great work team! We hit our Q4 targets early!');
  const [isAdmin, setIsAdmin] = useState(true);
  const [timeOverride, setTimeOverride] = useState<'morning' | 'afternoon' | 'evening' | null>(null);

  // Sample insights for different contexts
  const getContextualInsights = () => {
    switch (contextType) {
      case 'crm':
        return [
          {
            id: '1',
            title: 'Hot Leads',
            description: '12 leads scored 90+ this week',
            action: 'Review Leads',
            priority: 'high' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            count: 12
          },
          {
            id: '2',
            title: 'Follow-ups Due',
            description: '8 prospects need contact today',
            action: 'View Tasks',
            priority: 'medium' as const,
            icon: <Clock className="h-4 w-4" />,
            count: 8
          }
        ];
      case 'pulse':
        return [
          {
            id: '1',
            title: 'System Health',
            description: 'All systems operational',
            action: 'View Details',
            priority: 'low' as const,
            icon: <CheckCircle className="h-4 w-4" />
          },
          {
            id: '2',
            title: 'Active Monitoring',
            description: '247 endpoints being tracked',
            action: 'Monitor',
            priority: 'medium' as const,
            icon: <Users className="h-4 w-4" />,
            count: 247
          }
        ];
      case 'vault':
        return [
          {
            id: '1',
            title: 'Security Alerts',
            description: '2 failed login attempts detected',
            action: 'Investigate',
            priority: 'high' as const,
            icon: <AlertTriangle className="h-4 w-4" />,
            count: 2
          },
          {
            id: '2',
            title: 'Document Access',
            description: '156 secure files accessed today',
            action: 'View Log',
            priority: 'low' as const,
            icon: <FileText className="h-4 w-4" />,
            count: 156
          }
        ];
      default:
        return [
          {
            id: '1',
            title: 'Pending Reviews',
            description: '4 contracts need your signature',
            action: 'Review Now',
            priority: 'high' as const,
            icon: <FileText className="h-4 w-4" />,
            count: 4
          },
          {
            id: '2',
            title: 'Revenue Update',
            description: 'Monthly target: 87% complete',
            action: 'View Report',
            priority: 'medium' as const,
            icon: <TrendingUp className="h-4 w-4" />
          }
        ];
    }
  };

  const handleAdminMessageUpdate = (message: string) => {
    setAdminMessage(message);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Time Selector Controls */}
      <div className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={timeOverride === 'morning' ? 'default' : 'outline'}
            onClick={() => setTimeOverride('morning')}
          >
            🌅 Morning
          </Button>
          <Button 
            size="sm" 
            variant={timeOverride === 'afternoon' ? 'default' : 'outline'}
            onClick={() => setTimeOverride('afternoon')}
          >
            ☀️ Afternoon
          </Button>
          <Button 
            size="sm" 
            variant={timeOverride === 'evening' ? 'default' : 'outline'}
            onClick={() => setTimeOverride('evening')}
          >
            🌙 Evening
          </Button>
          <Button 
            size="sm" 
            variant={timeOverride === null ? 'default' : 'outline'}
            onClick={() => setTimeOverride(null)}
          >
            🕒 Auto
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Banner */}
        <IntelligentHeroBanner
          userName={userName}
          userRole={userRole}
          userAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face"
          contextType={contextType}
          insights={getContextualInsights()}
          adminMessage={adminMessage}
          isAdmin={isAdmin}
          onAdminMessageUpdate={handleAdminMessageUpdate}
          timeOfDayOverride={timeOverride}
        />

        {/* Customizable Widget Area Demo */}
        <div className="mt-8">
          <CustomizableWidgetArea 
            title="Your Customizable Quick Actions"
            className="px-4"
          />
        </div>

        {/* Demo Controls */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🎮 Hero Banner Demo Controls</CardTitle>
            <CardDescription>
              Customize the hero banner to see how it adapts to different contexts and user data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter user name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userRole">User Role</Label>
                <Input
                  id="userRole"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  placeholder="Enter user role"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contextType">Context Type</Label>
                <Select value={contextType} onValueChange={(value: any) => setContextType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="vault">Vault</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminMessage">Admin Message (24h display)</Label>
              <Input
                id="adminMessage"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Enter daily motivation message"
                maxLength={80}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isAdmin">Admin User (can edit daily message)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🌤️</span>
                <span>Time-Based Greetings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dynamic greetings that change throughout the day with beautiful animated backgrounds.
              </p>
              <div className="mt-3 space-y-1">
                <Badge variant="outline">Morning: Sunrise gradient</Badge>
                <Badge variant="outline">Afternoon: Cloud animations</Badge>
                <Badge variant="outline">Evening: Starry night</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🧠</span>
                <span>Smart Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-driven, contextual insights that adapt based on user role and current system context.
              </p>
              <div className="mt-3 space-y-1">
                <Badge variant="outline">Personalized data</Badge>
                <Badge variant="outline">Priority indicators</Badge>
                <Badge variant="outline">Quick actions</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🧭</span>
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Scrollable carousel of contextual actions with smooth animations and mobile optimization.
              </p>
              <div className="mt-3 space-y-1">
                <Badge variant="outline">Horizontal scroll</Badge>
                <Badge variant="outline">Mobile-optimized</Badge>
                <Badge variant="outline">Role-based actions</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>✨</span>
                <span>Daily Motivation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rotating inspirational quotes and admin-configurable daily messages for team motivation.
              </p>
              <div className="mt-3 space-y-1">
                <Badge variant="outline">Auto-rotating quotes</Badge>
                <Badge variant="outline">Admin announcements</Badge>
                <Badge variant="outline">24h message display</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🎨</span>
                <span>Brand Adaptive</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically adapts to brand colors and context, with subtle background patterns for different modules.
              </p>
              <div className="mt-3 space-y-1">
                <Badge variant="outline">Brand color integration</Badge>
                <Badge variant="outline">Context backgrounds</Badge>
                <Badge variant="outline">Logo watermarks</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📱</span>
                <span>Responsive Design</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fully responsive with touch-friendly interactions and optimized animations for all devices.
              </p>
              <div className="mt-3 space-y-1">
                <Badge variant="outline">Mobile-first</Badge>
                <Badge variant="outline">Touch gestures</Badge>
                <Badge variant="outline">Accessibility</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time of Day Preview */}
        <Card>
          <CardHeader>
            <CardTitle>🕒 Time-Based Experience Preview</CardTitle>
            <CardDescription>
              The banner automatically adapts its appearance throughout the day. 
              Current time: <Badge>{new Date().toLocaleTimeString()}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-100 via-yellow-50 to-blue-100">
                <h4 className="font-semibold text-gray-900">🌅 Morning (6AM-12PM)</h4>
                <p className="text-sm text-gray-600 mt-1">Warm sunrise gradients with animated sun</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-100 via-white to-blue-200">
                <h4 className="font-semibold text-gray-900">☀️ Afternoon (12PM-5PM)</h4>
                <p className="text-sm text-gray-600 mt-1">Bright sky with floating cloud animations</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
                <h4 className="font-semibold text-white">🌙 Evening (5PM-6AM)</h4>
                <p className="text-sm text-gray-300 mt-1">Dark night sky with twinkling stars and moon phases</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HeroBannerDemo;