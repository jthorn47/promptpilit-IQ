import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { DataBridgeLogFilters } from '@/components/databridge/DataBridgeLogFilters';
import { DataBridgeLogTable } from '@/components/databridge/DataBridgeLogTable';
import { LogFilters } from '@/services/databridge/logService';

export const DataBridgeLogsPage: React.FC = () => {
  const { user, loading: authLoading, isSuperAdmin } = useAuth();
  const [filters, setFilters] = useState<LogFilters>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
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
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">DataBridge Logs</h1>
              <p className="text-muted-foreground">
                Monitor and manage sync events between modules
              </p>
            </div>
          </div>

          {/* Filters */}
          <DataBridgeLogFilters
            filters={filters}
            onFiltersChange={setFilters}
            onRefresh={handleRefresh}
          />

          {/* Log Table */}
          <DataBridgeLogTable
            filters={filters}
            refreshTrigger={refreshTrigger}
            onRefresh={handleRefresh}
          />
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};