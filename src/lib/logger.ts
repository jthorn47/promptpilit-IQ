import { isDevelopment } from '@/config/app';

// Enhanced logging utility with structured logging
class Logger {
  private isDev = isDevelopment;

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context) {
      return `${baseMessage}\n${JSON.stringify(context, null, 2)}`;
    }
    
    return baseMessage;
  }

  info(message: string, context?: any): void {
    if (this.isDev) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: any): void {
    if (this.isDev) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | any, context?: any): void {
    // Always log errors, even in production
    const errorMessage = this.formatMessage('error', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...context,
    });
    console.error(errorMessage);
  }

  debug(message: string, context?: any): void {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Specific domain loggers
  auth = {
    info: (message: string, context?: any) => this.info(`[AUTH] ${message}`, context),
    warn: (message: string, context?: any) => this.warn(`[AUTH] ${message}`, context),
    error: (message: string, error?: any, context?: any) => this.error(`[AUTH] ${message}`, error, context),
    debug: (message: string, context?: any) => this.debug(`[AUTH] ${message}`, context),
  };

  api = {
    info: (message: string, context?: any) => this.info(`[API] ${message}`, context),
    warn: (message: string, context?: any) => this.warn(`[API] ${message}`, context),
    error: (message: string, error?: any, context?: any) => this.error(`[API] ${message}`, error, context),
    debug: (message: string, context?: any) => this.debug(`[API] ${message}`, context),
  };

  ui = {
    info: (message: string, context?: any) => this.info(`[UI] ${message}`, context),
    warn: (message: string, context?: any) => this.warn(`[UI] ${message}`, context),
    error: (message: string, error?: any, context?: any) => this.error(`[UI] ${message}`, error, context),
    debug: (message: string, context?: any) => this.debug(`[UI] ${message}`, context),
  };

  performance = {
    time: (label: string) => {
      if (this.isDev) {
        console.time(`[PERF] ${label}`);
      }
    },
    timeEnd: (label: string) => {
      if (this.isDev) {
        console.timeEnd(`[PERF] ${label}`);
      }
    },
  };
}

export const logger = new Logger();