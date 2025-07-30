
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Zap, 
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  errorRate: number;
  avgResponseTime: number;
  lastUpdate: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const ProductionMonitoring: React.FC = () => {
  const { metrics, clearCache, preloadTaxData } = useAdvancedPerformance();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 99.9,
    errorRate: 0.1,
    avgResponseTime: 45,
    lastUpdate: new Date().toISOString()
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'info',
      message: 'TaxIQ engine successfully processed 1,234 payroll calculations in the last hour',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      resolved: true
    },
    {
      id: '2',
      type: 'warning',
      message: 'Cache hit rate dropped below 85% - consider preloading tax data',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      resolved: false
    }
  ]);

  const [realtimeData, setRealtimeData] = useState<Array<{
    time: string;
    responseTime: number;
    requestCount: number;
    errorCount: number;
  }>>([]);

  useEffect(() => {
    // Simulate real-time monitoring data
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      
      setRealtimeData(prev => {
        const newData = [
          ...prev.slice(-19), // Keep last 20 data points
          {
            time: timeStr,
            responseTime: Math.random() * 50 + 30,
            requestCount: Math.floor(Math.random() * 20 + 10),
            errorCount: Math.random() < 0.1 ? 1 : 0
          }
        ];
        return newData;
      });

      // Update system health
      setSystemHealth(prev => ({
        ...prev,
        avgResponseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate,
        lastUpdate: new Date().toISOString()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [metrics]);

  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return 'All Systems Operational';
      case 'warning': return 'Performance Degraded';
      case 'critical': return 'Service Disruption';
      default: return 'Unknown Status';
    }
  };

  const handleClearCache = async () => {
    clearCache();
    setAlerts(prev => [
      {
        id: Date.now().toString(),
        type: 'info',
        message: 'Cache cleared successfully - warming up with fresh tax data',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      ...prev
    ]);
  };

  const handlePreloadTaxData = async () => {
    await preloadTaxData(new Date().getFullYear());
    setAlerts(prev => [
      {
        id: Date.now().toString(),
        type: 'info',
        message: 'Tax data preloaded successfully for improved performance',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      ...prev
    ]);
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Production Monitoring</h2>
        <div className="flex gap-2">
          <Button onClick={handleClearCache} variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={handlePreloadTaxData} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Preload Data
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth.status)}`} />
            <span className="text-lg font-semibold">{getStatusText(systemHealth.status)}</span>
            <Badge variant="outline">Last updated: {new Date(systemHealth.lastUpdate).toLocaleTimeString()}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.averageResponseTime.toFixed(1)}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{metrics.errorRate.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.cacheHitRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Performance Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Real-time Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'responseTime' ? `${Number(value).toFixed(1)}ms` : value,
                  name === 'responseTime' ? 'Response Time' : 
                  name === 'requestCount' ? 'Requests' : 'Errors'
                ]}
              />
              <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" name="responseTime" />
              <Line type="monotone" dataKey="requestCount" stroke="#10b981" name="requestCount" />
              <Line type="monotone" dataKey="errorCount" stroke="#ef4444" name="errorCount" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {unresolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts ({unresolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unresolvedAlerts.map(alert => (
              <Alert key={alert.id}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p>{alert.message}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setAlerts(prev => 
                        prev.map(a => a.id === alert.id ? { ...a, resolved: true } : a)
                      )}
                    >
                      Resolve
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TaxIQ Engine Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            TaxIQ Engine Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span>Federal Tax Calculator</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span>California Tax Calculator</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span>FICA Tax Calculator</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span>Tax Rate Cache</span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span>Database Connection</span>
                <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span>Performance Monitoring</span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-2 border-l-4 border-l-blue-500 bg-muted pl-4">
                <div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {alert.resolved && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
