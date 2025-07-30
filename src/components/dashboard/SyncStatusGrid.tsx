import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, RefreshCw } from 'lucide-react';
import { SyncStatusCard } from './SyncStatusCard';
import { getSyncStatus, SyncHealthMetrics } from '@/services/databridge/getSyncStatus';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const SyncStatusGrid: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [syncData, setSyncData] = useState<SyncHealthMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSyncStatus = async () => {
    if (!isSuperAdmin) return;
    
    try {
      setError(null);
      const data = await getSyncStatus();
      setSyncData(data);
    } catch (err) {
      console.error('Error fetching sync status:', err);
      setError('Failed to load sync status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSyncStatus();
  };

  useEffect(() => {
    fetchSyncStatus();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchSyncStatus, 60000);
    return () => clearInterval(interval);
  }, [isSuperAdmin]);

  // Don't render if user is not super admin
  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DataBridge Sync Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DataBridge Sync Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              DataBridge Sync Health
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {syncData.map((sync) => (
              <SyncStatusCard 
                key={sync.module_name} 
                sync={sync} 
                onRefresh={fetchSyncStatus}
              />
            ))}
          </div>
          
          {syncData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sync data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};