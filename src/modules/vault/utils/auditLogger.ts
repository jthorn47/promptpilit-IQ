import { supabase } from '@/integrations/supabase/client';

export interface VaultAuditEvent {
  action: 'view' | 'download' | 'upload' | 'delete' | 'share' | 'search' | 'access_denied';
  resource_type: 'policy' | 'certificate' | 'legal_notice' | 'document' | 'vault_page';
  resource_id?: string;
  resource_name?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

class VaultAuditLogger {
  private isEnabled = true;
  private batchSize = 10;
  private pendingLogs: Array<VaultAuditEvent & { timestamp: string; user_id?: string }> = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Flush logs every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);

    // Flush logs before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  /**
   * Log a vault audit event
   */
  async log(event: VaultAuditEvent): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const auditEntry = {
        ...event,
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      this.pendingLogs.push(auditEntry);

      // If batch is full, flush immediately
      if (this.pendingLogs.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.warn('Failed to log vault audit event:', error);
    }
  }

  /**
   * Flush pending logs to database
   */
  private async flush(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToFlush = [...this.pendingLogs];
    this.pendingLogs = [];

    try {
      // Transform logs for database insertion
      const dbLogs = logsToFlush.map(log => ({
        action: log.action,
        file_id: log.resource_id,
        details: {
          resource_type: log.resource_type,
          resource_name: log.resource_name,
          details: log.details,
          timestamp: log.timestamp,
          user_agent: log.user_agent
        },
        user_id: log.user_id,
        ip_address: log.ip_address,
        created_at: log.timestamp
      }));

      const { error } = await supabase
        .from('vault_audit_logs')
        .insert(dbLogs);

      if (error) {
        console.warn('Failed to flush vault audit logs:', error);
        // Re-add logs to queue for retry
        this.pendingLogs.unshift(...logsToFlush);
      }
    } catch (error) {
      console.warn('Error flushing vault audit logs:', error);
      // Re-add logs to queue for retry
      this.pendingLogs.unshift(...logsToFlush);
    }
  }

  /**
   * Get client IP address (best effort)
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      // This would need to be implemented based on your infrastructure
      // For now, return undefined as IP tracking has privacy implications
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Log document view
   */
  async logView(resourceType: VaultAuditEvent['resource_type'], resourceId: string, resourceName: string): Promise<void> {
    await this.log({
      action: 'view',
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName
    });
  }

  /**
   * Log document download
   */
  async logDownload(resourceType: VaultAuditEvent['resource_type'], resourceId: string, resourceName: string): Promise<void> {
    await this.log({
      action: 'download',
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName
    });
  }

  /**
   * Log document upload
   */
  async logUpload(resourceType: VaultAuditEvent['resource_type'], resourceName: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action: 'upload',
      resource_type: resourceType,
      resource_name: resourceName,
      details
    });
  }

  /**
   * Log search activity
   */
  async logSearch(query: string, filters?: Record<string, any>, resultsCount?: number): Promise<void> {
    await this.log({
      action: 'search',
      resource_type: 'vault_page',
      details: {
        query,
        filters,
        results_count: resultsCount
      }
    });
  }

  /**
   * Log access denied events
   */
  async logAccessDenied(resourceType: VaultAuditEvent['resource_type'], resourceId?: string, reason?: string): Promise<void> {
    await this.log({
      action: 'access_denied',
      resource_type: resourceType,
      resource_id: resourceId,
      details: { reason }
    });
  }

  /**
   * Disable audit logging
   */
  disable(): void {
    this.isEnabled = false;
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Enable audit logging
   */
  enable(): void {
    this.isEnabled = true;
    if (!this.flushInterval) {
      this.flushInterval = setInterval(() => {
        this.flush();
      }, 30000);
    }
  }

  /**
   * Force flush all pending logs
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }
}

// Export singleton instance
export const vaultAuditLogger = new VaultAuditLogger();

// Export convenience functions
export const logVaultView = vaultAuditLogger.logView.bind(vaultAuditLogger);
export const logVaultDownload = vaultAuditLogger.logDownload.bind(vaultAuditLogger);
export const logVaultUpload = vaultAuditLogger.logUpload.bind(vaultAuditLogger);
export const logVaultSearch = vaultAuditLogger.logSearch.bind(vaultAuditLogger);
export const logVaultAccessDenied = vaultAuditLogger.logAccessDenied.bind(vaultAuditLogger);