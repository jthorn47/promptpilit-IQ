import { supabase } from '@/integrations/supabase/client';

export interface SyncStatus {
  id: string;
  module_name: string;
  status: 'success' | 'stale' | 'error';
  last_synced_at: string;
  error_message?: string;
  retry_count: number;
  origin_module?: string;
  target_module?: string;
  sync_duration_ms?: number;
  records_processed: number;
}

export interface SyncHealthMetrics {
  module_name: string;
  status: 'success' | 'stale' | 'error';
  last_synced_at: string;
  error_count_24h: number;
  latest_error?: string;
  sync_duration_ms?: number;
  records_processed: number;
}

/**
 * Get sync status for all modules with health metrics
 */
export const getSyncStatus = async (): Promise<SyncHealthMetrics[]> => {
  try {
    // Get the latest sync status for each module
    const { data: latestSyncs, error: latestError } = await supabase
      .from('databridge_logs')
      .select('*')
      .order('last_synced_at', { ascending: false });

    if (latestError) throw latestError;

    // Get error counts for last 24 hours
    const { data: errorCounts, error: errorCountError } = await supabase
      .from('databridge_logs')
      .select('module_name, status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'error');

    if (errorCountError) throw errorCountError;

    // Group by module and get latest status for each
    const moduleMap = new Map<string, any>();
    latestSyncs?.forEach(sync => {
      if (!moduleMap.has(sync.module_name)) {
        moduleMap.set(sync.module_name, sync as SyncStatus);
      }
    });

    // Count errors by module
    const errorCountMap = new Map<string, number>();
    errorCounts?.forEach(error => {
      const count = errorCountMap.get(error.module_name) || 0;
      errorCountMap.set(error.module_name, count + 1);
    });

    // Transform to health metrics
    const healthMetrics: SyncHealthMetrics[] = Array.from(moduleMap.values()).map(sync => {
      const now = new Date();
      const lastSync = new Date(sync.last_synced_at);
      const minutesAgo = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
      
      // Determine status based on time and errors
      let status: 'success' | 'stale' | 'error' = sync.status;
      if (sync.status === 'success') {
        if (minutesAgo > 120) { // > 2 hours
          status = 'error';
        } else if (minutesAgo > 15) { // > 15 minutes
          status = 'stale';
        }
      }

      return {
        module_name: sync.module_name,
        status,
        last_synced_at: sync.last_synced_at,
        error_count_24h: errorCountMap.get(sync.module_name) || 0,
        latest_error: sync.error_message,
        sync_duration_ms: sync.sync_duration_ms,
        records_processed: sync.records_processed
      };
    });

    return healthMetrics;
  } catch (error) {
    console.error('Error fetching sync status:', error);
    throw error;
  }
};

/**
 * Trigger manual sync for a specific module using real integration
 */
export const triggerManualSync = async (moduleName: string): Promise<void> => {
  try {
    console.log(`🔄 Triggering real sync for ${moduleName}`)
    
    // Call the real sync edge function
    const { data, error } = await supabase.functions.invoke('sync-integration', {
      body: {
        moduleName: moduleName,
        targetModule: 'Manual Sync',
        syncType: 'manual',
        companyId: 'default' // This would be the actual company ID
      }
    })

    if (error) {
      console.error(`❌ Sync failed for ${moduleName}:`, error)
      
      // Log the failure
      await supabase.from('databridge_logs').insert({
        module_name: moduleName,
        status: 'error',
        last_synced_at: new Date().toISOString(),
        origin_module: moduleName,
        target_module: 'Manual Sync',
        sync_duration_ms: 0,
        records_processed: 0,
        error_message: error.message || 'Unknown sync error',
        retry_count: 0
      })
      
      throw error
    }

    console.log(`✅ Sync completed for ${moduleName}:`, data)
  } catch (error) {
    console.error(`❌ Error triggering manual sync for ${moduleName}:`, error)
    throw error
  }
};