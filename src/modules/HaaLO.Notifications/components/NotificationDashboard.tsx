import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Bell, Send, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { NotificationService } from '../services/NotificationService';

export const NotificationDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    delivered: 0,
    failed: 0,
    pending: 0,
  });

  const [isRetrying, setIsRetrying] = useState(false);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    };
    const deliveryStats = await notificationService.getDeliveryStats(dateRange);
    setStats({
      delivered: deliveryStats.delivered || 0,
      failed: deliveryStats.failed || 0,
      pending: deliveryStats.pending || 0
    });
  };

  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      const retried = await notificationService.retryFailedNotifications();
      console.log(`Retried ${retried} failed notifications`);
      await loadStats();
    } catch (error) {
      console.error('Failed to retry notifications:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleTestNotification = async () => {
    await notificationService.sendToUsers(
      ['test-user'],
      'Test Notification',
      'This is a test notification from the HaaLO Notification Service',
      {
        type: 'info',
        channels: ['in_app'],
        sourceModule: 'HaaLO.Notifications',
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notification Center
          </h1>
          <p className="text-muted-foreground">
            Manage notifications across all HaaLO modules
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTestNotification} variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Button 
            onClick={handleRetryFailed}
            disabled={isRetrying}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            Retry Failed
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              In queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Latest notification activity across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock recent notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Delivered</Badge>
                    <div>
                      <p className="font-medium">Payroll Run Completed</p>
                      <p className="text-sm text-muted-foreground">
                        HaaLO.PayrollEngine • 2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    25 recipients
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Pending</Badge>
                    <div>
                      <p className="font-medium">Benefits Enrollment Reminder</p>
                      <p className="text-sm text-muted-foreground">
                        HaaLO.Benefits • 5 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    150 recipients
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">Failed</Badge>
                    <div>
                      <p className="font-medium">Background Job Failed</p>
                      <p className="text-sm text-muted-foreground">
                        HaaLO.BackgroundJobs • 10 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    3 failed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Manage reusable notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Template management interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Logs</CardTitle>
              <CardDescription>
                Detailed notification delivery history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Delivery logs interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification service settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Enable email delivery channel
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Enable SMS delivery channel
                    </p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">In-App Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Enable real-time in-app notifications
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};