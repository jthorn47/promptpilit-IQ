interface ErrorReport {
  id: string;
  error: Error;
  context: {
    route: string;
    userId?: string;
    timestamp: number;
    userAgent: string;
    component?: string;
    action?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class ErrorReportingService {
  private reports: ErrorReport[] = [];
  private maxReports = 100;
  private subscribers: ((report: ErrorReport) => void)[] = [];

  /**
   * Report an error with context
   */
  reportError(
    error: Error,
    context: Partial<ErrorReport['context']> = {},
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    const report: ErrorReport = {
      id: this.generateId(),
      error,
      context: {
        route: window.location.pathname,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        ...context
      },
      severity,
      resolved: false
    };

    this.reports.unshift(report);
    
    // Keep only last maxReports
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports);
    }

    // Log to console with appropriate level
    this.logError(report);

    // Notify subscribers
    this.subscribers.forEach(subscriber => subscriber(report));

    // Auto-recovery for certain error types
    this.attemptAutoRecovery(report);

    return report.id;
  }

  /**
   * Log error with appropriate console method
   */
  private logError(report: ErrorReport): void {
    const message = `[${report.severity.toUpperCase()}] ${report.error.message}`;
    const details = {
      id: report.id,
      route: report.context.route,
      component: report.context.component,
      timestamp: new Date(report.context.timestamp).toISOString(),
      stack: report.error.stack
    };

    switch (report.severity) {
      case 'critical':
        console.error('🚨', message, details);
        break;
      case 'high':
        console.error('❌', message, details);
        break;
      case 'medium':
        console.warn('⚠️', message, details);
        break;
      case 'low':
        console.info('ℹ️', message, details);
        break;
    }
  }

  /**
   * Attempt automatic recovery for known error patterns
   */
  private attemptAutoRecovery(report: ErrorReport): void {
    const errorMessage = report.error.message.toLowerCase();

    // Network errors - retry after delay
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      setTimeout(() => {
        console.log('🔄 Attempting network recovery...');
        // Could trigger a retry mechanism here
      }, 2000);
    }

    // Memory errors - trigger cleanup
    if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
      console.log('🧹 Triggering memory cleanup due to error...');
      // Trigger aggressive cleanup
      window.dispatchEvent(new CustomEvent('memory-cleanup'));
    }

    // Component errors - mark for reload
    if (report.context.component) {
      console.log(`🔄 Component ${report.context.component} may need reload`);
    }
  }

  /**
   * Mark error as resolved
   */
  resolveError(id: string): boolean {
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.resolved = true;
      console.log(`✅ Error resolved: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Get error reports with filtering
   */
  getReports(filter?: {
    severity?: ErrorReport['severity'];
    resolved?: boolean;
    since?: number;
  }): ErrorReport[] {
    let filtered = this.reports;

    if (filter) {
      if (filter.severity) {
        filtered = filtered.filter(r => r.severity === filter.severity);
      }
      if (filter.resolved !== undefined) {
        filtered = filtered.filter(r => r.resolved === filter.resolved);
      }
      if (filter.since) {
        filtered = filtered.filter(r => r.context.timestamp > filter.since);
      }
    }

    return filtered;
  }

  /**
   * Subscribe to error reports
   */
  subscribe(callback: (report: ErrorReport) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Generate unique error ID
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all reports
   */
  clearReports(): void {
    this.reports = [];
  }

  /**
   * Get error statistics
   */
  getStats() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const lastDay = now - (24 * 60 * 60 * 1000);

    return {
      total: this.reports.length,
      unresolved: this.reports.filter(r => !r.resolved).length,
      lastHour: this.reports.filter(r => r.context.timestamp > lastHour).length,
      lastDay: this.reports.filter(r => r.context.timestamp > lastDay).length,
      bySeverity: {
        critical: this.reports.filter(r => r.severity === 'critical').length,
        high: this.reports.filter(r => r.severity === 'high').length,
        medium: this.reports.filter(r => r.severity === 'medium').length,
        low: this.reports.filter(r => r.severity === 'low').length,
      }
    };
  }
}

export const errorReporter = new ErrorReportingService();

// Global error handler
window.addEventListener('error', (event) => {
  errorReporter.reportError(
    new Error(event.message),
    {
      component: 'Global',
      action: 'unhandled_error'
    },
    'high'
  );
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorReporter.reportError(
    new Error(event.reason),
    {
      component: 'Global',
      action: 'unhandled_promise_rejection'
    },
    'high'
  );
});
