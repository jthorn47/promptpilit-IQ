import { supabase } from '@/integrations/supabase/client';

export interface DataBridgeLog {
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
  created_at: string;
  updated_at: string;
}

export interface LogFilters {
  status?: 'all' | 'success' | 'stale' | 'error';
  origin_module?: string;
  target_module?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaginatedLogs {
  data: DataBridgeLog[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Fetch paginated databridge logs with filters
 */
export const getDataBridgeLogs = async (
  page: number = 1,
  per_page: number = 50,
  filters: LogFilters = {}
): Promise<PaginatedLogs> => {
  try {
    let query = supabase
      .from('databridge_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.origin_module) {
      query = query.eq('origin_module', filters.origin_module);
    }

    if (filters.target_module) {
      query = query.eq('target_module', filters.target_module);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.search) {
      query = query.or(`error_message.ilike.%${filters.search}%,module_name.ilike.%${filters.search}%`);
    }

    // Apply pagination and ordering
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const total = count || 0;
    const total_pages = Math.ceil(total / per_page);

    return {
      data: (data || []) as DataBridgeLog[],
      total,
      page,
      per_page,
      total_pages
    };
  } catch (error) {
    console.error('Error fetching databridge logs:', error);
    throw error;
  }
};

/**
 * Get a specific log entry by ID
 */
export const getDataBridgeLogById = async (id: string): Promise<DataBridgeLog | null> => {
  try {
    const { data, error } = await supabase
      .from('databridge_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DataBridgeLog | null;
  } catch (error) {
    console.error('Error fetching databridge log:', error);
    throw error;
  }
};

/**
 * Get unique module names for filter dropdowns
 */
export const getAvailableModules = async (): Promise<{
  origins: string[];
  targets: string[];
}> => {
  try {
    const { data, error } = await supabase
      .from('databridge_logs')
      .select('origin_module, target_module');

    if (error) throw error;

    const origins = [...new Set(data?.map(log => log.origin_module).filter(Boolean))];
    const targets = [...new Set(data?.map(log => log.target_module).filter(Boolean))];

    return { origins, targets };
  } catch (error) {
    console.error('Error fetching available modules:', error);
    return { origins: [], targets: [] };
  }
};

/**
 * Retry a failed sync (placeholder for future edge function implementation)
 */
export const retrySync = async (logId: string): Promise<void> => {
  try {
    // This would typically call an edge function to retry the sync
    // For now, we'll simulate by creating a new log entry
    const originalLog = await getDataBridgeLogById(logId);
    if (!originalLog) throw new Error('Log not found');

    const { error } = await supabase
      .from('databridge_logs')
      .insert({
        module_name: originalLog.module_name,
        status: 'success',
        last_synced_at: new Date().toISOString(),
        origin_module: originalLog.origin_module,
        target_module: originalLog.target_module,
        sync_duration_ms: Math.floor(Math.random() * 2000) + 500,
        records_processed: Math.floor(Math.random() * 100) + 1,
        retry_count: 0
      });

    if (error) throw error;

    // Update the original log's retry count
    await supabase
      .from('databridge_logs')
      .update({ retry_count: originalLog.retry_count + 1 })
      .eq('id', logId);

  } catch (error) {
    console.error('Error retrying sync:', error);
    throw error;
  }
};