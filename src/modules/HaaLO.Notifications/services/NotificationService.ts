import { supabase } from '../../../integrations/supabase/client';
import type { 
  NotificationMessage, 
  NotificationTemplate, 
  NotificationRecipient,
  NotificationChannel,
  NotificationEvent
} from '../types';

export class NotificationService {
  private static instance: NotificationService;
  private static initialized = false;
  private subscribers: Map<string, ((event: NotificationEvent) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  static async initialize(config?: any): Promise<void> {
    if (NotificationService.initialized) return;
    
    console.log('🔔 Initializing Notification Service', config);
    NotificationService.initialized = true;
    
    // Initialize notification templates
    await NotificationService.getInstance().loadDefaultTemplates();
  }

  // Publish a notification
  async publish(notification: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<string> {
    const message: NotificationMessage = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: 'queued',
      retryCount: 0,
    };

    // Store in database queue
    await this.storeMessage(message);

    // Process immediately for in-app notifications
    if (message.channels.includes('in_app')) {
      await this.processInAppNotification(message);
    }

    // Queue for other channels
    if (message.channels.some(ch => ch !== 'in_app')) {
      await this.queueForProcessing(message);
    }

    return message.id;
  }

  // Subscribe to notification events
  subscribe(eventType: string, callback: (event: NotificationEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);
  }

  // Unsubscribe from notification events
  unsubscribe(eventType: string, callback: (event: NotificationEvent) => void): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Send notification to multiple recipients
  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    options: {
      type?: 'info' | 'success' | 'warning' | 'error';
      channels?: NotificationChannel[];
      templateId?: string;
      metadata?: Record<string, any>;
      sourceModule: string;
    }
  ): Promise<string> {
    const recipients: NotificationRecipient[] = [];
    
    // Fetch user details for recipients
    for (const userId of userIds) {
      const recipient = await this.getUserNotificationPreferences(userId);
      if (recipient) {
        recipients.push(recipient);
      }
    }

    return this.publish({
      templateId: options.templateId,
      type: options.type || 'info',
      title,
      body,
      channels: options.channels || ['in_app'],
      recipients,
      metadata: options.metadata,
      sourceModule: options.sourceModule,
    });
  }

  // Get user notification preferences
  private async getUserNotificationPreferences(userId: string): Promise<NotificationRecipient | null> {
    // Mock implementation - in real app would fetch from user preferences
    return {
      id: userId,
      userId,
      email: `user${userId}@example.com`,
      preferredChannels: ['in_app', 'email'],
    };
  }

  // Store message in database
  private async storeMessage(message: NotificationMessage): Promise<void> {
    // Mock implementation - would store in actual notification_messages table
    console.log('📝 Storing notification message:', message.id);
  }

  // Process in-app notification
  private async processInAppNotification(message: NotificationMessage): Promise<void> {
    // Emit event for real-time delivery
    const event: NotificationEvent = {
      type: 'notification_delivered',
      payload: { message },
      sourceModule: message.sourceModule,
      timestamp: new Date(),
    };

    this.emitEvent('notification_delivered', event);
  }

  // Queue for background processing
  private async queueForProcessing(message: NotificationMessage): Promise<void> {
    // Mock implementation - would add to job queue
    console.log('📤 Queuing notification for processing:', message.id);
  }

  // Emit events to subscribers
  private emitEvent(eventType: string, event: NotificationEvent): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in notification event callback:`, error);
        }
      });
    }
  }

  // Load default notification templates
  private async loadDefaultTemplates(): Promise<void> {
    const templates: NotificationTemplate[] = [
      {
        id: 'payroll_success',
        name: 'Payroll Run Completed',
        subject: 'Payroll processed successfully',
        body: 'Your payroll for {{period}} has been processed. Total amount: {{amount}}',
        channels: ['in_app', 'email'],
        variables: ['period', 'amount'],
        isActive: true,
      },
      {
        id: 'employee_welcome',
        name: 'Employee Welcome',
        subject: 'Welcome to {{company}}',
        body: 'Welcome {{name}}! Your account has been set up.',
        channels: ['email'],
        variables: ['company', 'name'],
        isActive: true,
      },
    ];

    // Store templates (mock implementation)
    console.log('📋 Loaded notification templates:', templates.length);
  }

  // Retry failed notifications
  async retryFailedNotifications(): Promise<number> {
    // Mock implementation - would fetch failed notifications and retry
    console.log('🔄 Retrying failed notifications');
    return 0;
  }

  // Get delivery statistics
  async getDeliveryStats(dateRange: { start: Date; end: Date }): Promise<Record<string, number>> {
    // Mock implementation
    return {
      delivered: 150,
      failed: 5,
      pending: 10,
    };
  }
}