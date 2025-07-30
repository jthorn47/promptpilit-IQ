
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { KPISection } from '@/components/dashboard/system/KPISection';
import { SystemMonitoringSection } from '@/components/dashboard/system/SystemMonitoringSection';
import { TasksClientSection } from '@/components/dashboard/system/TasksClientSection';
import { SyncStatusGrid } from '@/components/dashboard/SyncStatusGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings, BarChart3, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const LaunchpadLayout: React.FC = () => {
  const { user, loading: authLoading, isSuperAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    
    // Add small delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "All system metrics have been updated.",
      });
    }, 1000);
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <UnifiedLayout>
      <div className="h-full p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 h-full"
        >
          <div className="flex items-center gap-2 flex-shrink-0" data-tour="action-buttons">
            <Link to="/superadmin/system/diagnostics">
              <Button variant="outline" className="gap-2 relative z-10">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">System Diagnostics</span>
                <span className="sm:hidden">Diagnostics</span>
              </Button>
            </Link>
            <Button 
              onClick={handleGlobalRefresh} 
              disabled={isRefreshing}
              variant="outline" 
              className="gap-2 relative z-10"
              size={isMobile ? "sm" : "default"}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isMobile ? 'Refresh' : 'Refresh All'}
            </Button>
            <Button variant="outline" size="icon" className="relative z-10">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Dashboard Content */}
          <div className={`flex-1 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
            {/* KPI Header Bar */}
            <KPISection key={`kpi-${refreshKey}`} />

            {/* System Monitoring Block */}
            <SystemMonitoringSection key={`monitoring-${refreshKey}`} />

            {/* DataBridge Sync Health */}
            <SyncStatusGrid key={`sync-${refreshKey}`} />

            {/* Tasks & Client Status */}
            <TasksClientSection key={`tasks-${refreshKey}`} />
          </div>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default LaunchpadLayout;
