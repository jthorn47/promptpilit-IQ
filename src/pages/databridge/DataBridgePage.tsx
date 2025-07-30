import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { SyncStatusGrid } from '@/components/dashboard/SyncStatusGrid';
import { DataBridgeLogTable } from '@/components/databridge/DataBridgeLogTable';
import { DataBridgeLogFilters } from '@/components/databridge/DataBridgeLogFilters';
import { LogFilters } from '@/services/databridge/logService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Activity, FileText } from 'lucide-react';

export const DataBridgePage: React.FC = () => {
  console.log('🔗 DataBridge page is loading!');
  const { user, loading: authLoading, isSuperAdmin } = useAuth();
  const [filters, setFilters] = React.useState<LogFilters>({});
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Temporarily remove super admin check for testing
  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <StandardPageLayout
      title="DataBridge"
      subtitle="API/ETL connections and sync monitoring for external systems"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Direct component without extra card wrapper */}
            <SyncStatusGrid />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Direct component without extra card wrapper */}
            <SyncStatusGrid />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Event Logs</CardTitle>
                <CardDescription>
                  Detailed logs of all synchronization events and errors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DataBridgeLogFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
                <DataBridgeLogTable
                  filters={filters}
                  refreshTrigger={refreshTrigger}
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </StandardPageLayout>
  );
};