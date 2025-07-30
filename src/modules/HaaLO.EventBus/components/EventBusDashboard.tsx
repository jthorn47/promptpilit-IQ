import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Users, Zap, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { eventBus } from '../services/EventBusService';
import type { EventBusMetrics, HaaLOEvent } from '../types';
import { formatRelativeTime } from '../../HaaLO.Shared/utils/dateFormatter';

export const EventBusDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<EventBusMetrics>({
    totalEvents: 0,
    eventsPerMinute: 0,
    activeSubscriptions: 0,
    eventTypes: [],
    moduleActivity: [],
    performance: { averageProcessingTime: 0, slowestEvents: [] }
  });
  const [eventHistory, setEventHistory] = useState<HaaLOEvent[]>([]);
  const [activeTab, setActiveTab] = useState('metrics');

  const refreshData = () => {
    setMetrics(eventBus.getMetrics());
    setEventHistory(eventBus.getEventHistory(50));
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    eventBus.clearHistory();
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Event Bus Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{metrics.totalEvents}</p>
                <p className="text-xs text-muted-foreground">{metrics.eventsPerMinute}/min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{metrics.activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground">across modules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Event Types</p>
                <p className="text-2xl font-bold">{metrics.eventTypes.length}</p>
                <p className="text-xs text-muted-foreground">registered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">{Math.round(metrics.performance.averageProcessingTime)}ms</p>
                <p className="text-xs text-muted-foreground">per event</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="events">Event History</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
                <CardDescription>Most active event types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.eventTypes
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((eventType) => (
                      <div key={eventType.type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{eventType.type}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{eventType.count}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(eventType.lastSeen)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module Activity</CardTitle>
                <CardDescription>Event publishing by module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.moduleActivity
                    .sort((a, b) => b.published - a.published)
                    .map((module) => (
                      <div key={module.module} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{module.module}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{module.published}</Badge>
                          <span className="text-xs text-muted-foreground">published</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest events in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {eventHistory.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{event.type}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{event.sourceModule}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                ))}
                {eventHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No events in history
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Current event subscriptions by module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(eventBus.getActiveSubscriptions().entries()).map(([eventType, subscriptions]) => (
                  <div key={eventType} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{eventType}</h3>
                    <div className="space-y-2">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="flex items-center justify-between text-sm">
                          <span>{subscription.module}</span>
                          <div className="flex items-center gap-2">
                            {subscription.priority && subscription.priority > 0 && (
                              <Badge variant="secondary">Priority: {subscription.priority}</Badge>
                            )}
                            {subscription.once && (
                              <Badge variant="outline">Once</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Event processing performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Average Processing Time</h4>
                    <p className="text-2xl font-bold">{Math.round(metrics.performance.averageProcessingTime)}ms</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Total Events Processed</h4>
                    <p className="text-2xl font-bold">{metrics.totalEvents}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Slowest Events</h4>
                  <div className="space-y-2">
                    {metrics.performance.slowestEvents.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{event.type}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{event.processingTime}ms</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventBusDashboard;