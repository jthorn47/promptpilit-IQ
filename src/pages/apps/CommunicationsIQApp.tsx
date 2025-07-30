import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Inbox,
  Settings,
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CommunicationsIQApp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      title: 'Email Client',
      description: 'Unified inbox for all your email communications',
      icon: Mail,
      path: '/admin/crm/email-client',
      color: 'bg-blue-500',
      stats: { unread: 12, total: 156 },
      status: 'active'
    },
    {
      title: 'Email Templates',
      description: 'Create and manage reusable email templates',
      icon: FileText,
      path: '/admin/crm/email-templates',
      color: 'bg-green-500',
      stats: { templates: 8, used: 24 },
      status: 'active'
    },
    {
      title: 'Email Campaigns',
      description: 'Send bulk emails and track performance',
      icon: Send,
      path: '/admin/crm/email-campaigns',
      color: 'bg-purple-500',
      stats: { active: 3, sent: 1250 },
      status: 'active'
    },
    {
      title: 'Communications Log',
      description: 'Track all communications with clients',
      icon: MessageSquare,
      path: '/admin/crm/activities',
      color: 'bg-orange-500',
      stats: { today: 15, week: 89 },
      status: 'active'
    }
  ];

  const recentActivity = [
    { type: 'email', message: 'Email sent to Acme Corp', time: '2 minutes ago', status: 'sent' },
    { type: 'template', message: 'Welcome template updated', time: '15 minutes ago', status: 'updated' },
    { type: 'campaign', message: 'Q4 Newsletter campaign started', time: '1 hour ago', status: 'started' },
    { type: 'log', message: 'Call logged with TechStart Inc', time: '2 hours ago', status: 'logged' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'started': return 'text-purple-600';
      case 'logged': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Communications IQ</h1>
          <p className="text-muted-foreground">Unified communication management for your CRM</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(feature.path)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{feature.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {feature.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {Object.entries(feature.stats).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(feature.stats).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{value}</p>
                            <p className="text-xs text-muted-foreground capitalize">{key}</p>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(feature.path)}
                      >
                        Open {feature.title}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Open Rate</span>
                    <span className="font-bold text-green-600">68.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Click Rate</span>
                    <span className="font-bold text-blue-600">24.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="font-bold text-purple-600">12.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Emails Sent</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Templates Used</span>
                    <span className="font-bold">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Campaigns Active</span>
                    <span className="font-bold">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average</span>
                    <span className="font-bold">2.3 hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fastest</span>
                    <span className="font-bold text-green-600">12 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">SLA Met</span>
                    <span className="font-bold text-blue-600">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationsIQApp;