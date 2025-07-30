import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  ArrowLeft 
} from 'lucide-react';
import { useLaunchpadData } from '@/modules/SuperAdmin.Launchpad/hooks/useLaunchpadData';

const SystemDiagnostics: React.FC = () => {
  const { user, loading: authLoading, isSuperAdmin } = useAuth();
  const { data, loading, error, refetch } = useLaunchpadData();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'operational':
        return 'bg-green-500';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
      case 'offline':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'offline':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <UnifiedLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Server className="h-8 w-8" />
                System Diagnostics
              </h1>
              <p className="text-muted-foreground">
                Comprehensive system health monitoring and diagnostics
              </p>
            </div>
          </div>
          <Button onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">System Error</span>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* System Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.isArray(data.systemHealth) ? data.systemHealth.map((metric, index) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.name}</span>
                        {getStatusIcon(metric.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(metric.status)} text-white`}
                        >
                          {metric.status}
                        </Badge>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-4 text-center text-muted-foreground">
                      No system health data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Database Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Connection Pool</div>
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-xs text-green-600">Healthy</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Query Performance</div>
                    <div className="text-2xl font-bold">125ms</div>
                    <div className="text-xs text-yellow-600">Average</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Active Connections</div>
                    <div className="text-2xl font-bold">42/100</div>
                    <div className="text-xs text-green-600">Normal</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edge Functions Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Edge Functions Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'send-email', status: 'healthy', calls: '1.2k', errors: '0.1%' },
                    { name: 'generate-payroll', status: 'healthy', calls: '340', errors: '0%' },
                    { name: 'ai-assistant', status: 'warning', calls: '890', errors: '2.1%' },
                    { name: 'scorm-processor', status: 'healthy', calls: '156', errors: '0%' }
                  ].map((func, index) => (
                    <motion.div
                      key={func.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(func.status)}
                        <div>
                          <div className="font-medium">{func.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {func.calls} calls today
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={func.status === 'healthy' ? 'default' : 'destructive'}>
                          {func.errors} error rate
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent System Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent System Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '2 minutes ago', event: 'Edge function deployment completed', type: 'info' },
                    { time: '15 minutes ago', event: 'Database backup completed successfully', type: 'success' },
                    { time: '1 hour ago', event: 'High memory usage detected on server-2', type: 'warning' },
                    { time: '3 hours ago', event: 'Scheduled maintenance completed', type: 'info' }
                  ].map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        event.type === 'success' ? 'bg-green-500' :
                        event.type === 'warning' ? 'bg-yellow-500' :
                        event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm">{event.event}</div>
                        <div className="text-xs text-muted-foreground">{event.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </UnifiedLayout>
  );
};

export default SystemDiagnostics;