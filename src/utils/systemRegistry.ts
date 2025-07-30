import { supabase } from "@/integrations/supabase/client";

export interface SystemRegistryEntry {
  id: string;
  key: string;
  value: string; // Changed from any to string since DB stores as text
  description: string | null;
  data_type: string; // Changed to string to match DB
  category: string;
  status: string; // Changed from is_active to status
  requires_restart: boolean | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface SystemRegistryAuditEntry {
  id: string;
  registry_id: string; // Changed from registry_key to registry_id 
  action_type: string; // Changed to string to match DB
  old_value: string | null;
  new_value: string | null;
  old_metadata: any;
  new_metadata: any;
  performed_by: string | null;
  performed_at: string; // Changed from created_at to performed_at
}

// In-memory cache for registry values
const registryCache = new Map<string, any>();
let cacheLastRefreshed: Date | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a registry value by key with caching
 */
export async function getRegistryValue(key: string, defaultValue?: any): Promise<any> {
  try {
    // Check cache first
    if (registryCache.has(key) && cacheLastRefreshed && 
        (Date.now() - cacheLastRefreshed.getTime()) < CACHE_TTL) {
      return registryCache.get(key);
    }

    const { data, error } = await supabase
      .from('system_registry')
      .select('value, data_type, status')
      .eq('key', key)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return defaultValue;
      }
      throw error;
    }

    let processedValue: any = data.value;

    // Process value based on data type for runtime use, but return original value for display
    switch (data.data_type) {
      case 'number':
        processedValue = Number(data.value);
        break;
      case 'boolean':
        processedValue = data.value.toLowerCase() === 'true';
        break;
      case 'json':
        try {
          processedValue = JSON.parse(data.value);
        } catch {
          processedValue = data.value;
        }
        break;
      case 'date':
        processedValue = new Date(data.value);
        break;
      default:
        processedValue = String(data.value);
    }

    // Update cache
    registryCache.set(key, processedValue);
    
    return processedValue;
  } catch (error) {
    console.error(`Error getting registry value for key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Set a registry value
 */
export async function setRegistryValue(
  key: string,
  value: any,
  description?: string,
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'date' = 'string',
  category: string = 'General',
  isActive: boolean = true,
  requiresRestart: boolean = false
): Promise<void> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Convert value to string for storage
    let stringValue: string;
    switch (dataType) {
      case 'json':
        stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        break;
      default:
        stringValue = String(value);
    }
    
    // Check if entry exists
    const { data: existing } = await supabase
      .from('system_registry')
      .select('*')
      .eq('key', key)
      .single();

    const registryData = {
      key,
      value: stringValue,
      description,
      data_type: dataType,
      category,
      status: isActive ? 'active' : 'inactive',
      requires_restart: requiresRestart,
      updated_by: user?.id || null
    };

    if (existing) {
      // Update existing entry
      const { error } = await supabase
        .from('system_registry')
        .update(registryData)
        .eq('key', key);

      if (error) throw error;

      // Log audit entry
      await logRegistryAudit(existing.id, 'updated', existing.value, stringValue);
    } else {
      // Create new entry
      const { data: newEntry, error } = await supabase
        .from('system_registry')
        .insert(registryData)
        .select('id')
        .single();

      if (error) throw error;

      // Log audit entry
      await logRegistryAudit(newEntry.id, 'created', null, stringValue);
    }

    // Update cache
    registryCache.set(key, value);
    
  } catch (error) {
    console.error(`Error setting registry value for key ${key}:`, error);
    throw error;
  }
}

/**
 * Delete a registry value
 */
export async function deleteRegistryValue(key: string): Promise<void> {
  try {
    // Get current value for audit log
    const { data: existing } = await supabase
      .from('system_registry')
      .select('id, value')
      .eq('key', key)
      .single();

    const { error } = await supabase
      .from('system_registry')
      .delete()
      .eq('key', key);

    if (error) throw error;

    // Log audit entry
    if (existing) {
      await logRegistryAudit(existing.id, 'deleted', existing.value, null);
    }

    // Remove from cache
    registryCache.delete(key);
    
  } catch (error) {
    console.error(`Error deleting registry value for key ${key}:`, error);
    throw error;
  }
}

/**
 * Get all registry entries
 */
export async function getAllRegistryEntries(): Promise<SystemRegistryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('system_registry')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) throw error;

    // Update cache with all values
    data.forEach(entry => {
      registryCache.set(entry.key, entry.value);
    });
    cacheLastRefreshed = new Date();

    return data;
  } catch (error) {
    console.error('Error getting all registry entries:', error);
    throw error;
  }
}

/**
 * Refresh the registry cache
 */
export async function refreshRegistryCache(): Promise<void> {
  try {
    registryCache.clear();
    await getAllRegistryEntries();
  } catch (error) {
    console.error('Error refreshing registry cache:', error);
    throw error;
  }
}

/**
 * Get registry audit log
 */
export async function getRegistryAuditLog(
  registryId?: string,
  limit: number = 100
): Promise<SystemRegistryAuditEntry[]> {
  try {
    let query = supabase
      .from('system_registry_audit')
      .select('*')
      .order('performed_at', { ascending: false })
      .limit(limit);

    if (registryId) {
      query = query.eq('registry_id', registryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting registry audit log:', error);
    throw error;
  }
}

/**
 * Log a registry audit entry
 */
async function logRegistryAudit(
  registryId: string,
  actionType: 'created' | 'updated' | 'deleted',
  oldValue: string | null,
  newValue: string | null
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('system_registry_audit')
      .insert({
        registry_id: registryId,
        action_type: actionType,
        old_value: oldValue,
        new_value: newValue,
        performed_by: user?.id || null
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging registry audit:', error);
    // Don't throw here as audit logging is not critical
  }
}

/**
 * Check if a registry key exists
 */
export async function registryKeyExists(key: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('system_registry')
      .select('key')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error(`Error checking if registry key exists: ${key}`, error);
    return false;
  }
}

/**
 * Get registry values by category
 */
export async function getRegistryValuesByCategory(category: string): Promise<SystemRegistryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('system_registry')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('key', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error(`Error getting registry values for category ${category}:`, error);
    throw error;
  }
}

/**
 * Bulk update registry values
 */
export async function bulkUpdateRegistryValues(
  updates: Array<{
    key: string;
    value: any;
    description?: string;
    dataType?: 'string' | 'number' | 'boolean' | 'json' | 'date';
    category?: string;
  }>
): Promise<void> {
  try {
    for (const update of updates) {
      await setRegistryValue(
        update.key,
        update.value,
        update.description,
        update.dataType,
        update.category
      );
    }
  } catch (error) {
    console.error('Error bulk updating registry values:', error);
    throw error;
  }
}