import type { 
  HaaLOEvent, 
  EventSubscription, 
  EventBusMetrics, 
  EventBusConfig 
} from '../types';

class EventBusService {
  private subscriptions = new Map<string, EventSubscription[]>();
  private eventHistory: HaaLOEvent[] = [];
  private metrics: EventBusMetrics = {
    totalEvents: 0,
    eventsPerMinute: 0,
    activeSubscriptions: 0,
    eventTypes: [],
    moduleActivity: [],
    performance: {
      averageProcessingTime: 0,
      slowestEvents: []
    }
  };
  
  private config: EventBusConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    enableLogging: true,
    enableMetrics: true,
    eventHistoryLimit: 1000,
    processingTimeout: 5000
  };

  private static instance: EventBusService;

  private constructor() {
    // Start metrics collection
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService();
    }
    return EventBusService.instance;
  }

  /**
   * Publish an event to all subscribers
   */
  publish(event: Omit<HaaLOEvent, 'id' | 'timestamp'>): void {
    const fullEvent: HaaLOEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now()
    };

    if (this.config.enableLogging) {
      console.log(`📤 EventBus: Publishing ${event.type} from ${event.sourceModule}`, fullEvent);
    }

    // Add to history
    this.addToHistory(fullEvent);
    
    // Update metrics
    this.updateMetrics(fullEvent);

    // Get subscribers for this event type
    const subscribers = this.subscriptions.get(event.type) || [];
    
    // Process subscribers
    subscribers.forEach(subscription => {
      this.processSubscription(subscription, fullEvent);
    });
  }

  /**
   * Subscribe to events
   */
  subscribe(
    eventType: string,
    callback: (event: HaaLOEvent) => void | Promise<void>,
    options: {
      module: string;
      filter?: (event: HaaLOEvent) => boolean;
      once?: boolean;
      priority?: number;
    }
  ): string {
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      eventType,
      callback,
      module: options.module,
      filter: options.filter,
      once: options.once,
      priority: options.priority || 0
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscribers = this.subscriptions.get(eventType)!;
    subscribers.push(subscription);
    
    // Sort by priority (higher priority first)
    subscribers.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    if (this.config.enableLogging) {
      console.log(`📥 EventBus: ${options.module} subscribed to ${eventType}`);
    }

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    for (const [eventType, subscribers] of this.subscriptions.entries()) {
      const index = subscribers.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        const subscription = subscribers[index];
        subscribers.splice(index, 1);
        
        if (this.config.enableLogging) {
          console.log(`📤 EventBus: ${subscription.module} unsubscribed from ${eventType}`);
        }
        
        // Clean up empty subscription arrays
        if (subscribers.length === 0) {
          this.subscriptions.delete(eventType);
        }
        break;
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): EventBusMetrics {
    return { ...this.metrics };
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): HaaLOEvent[] {
    const events = [...this.eventHistory];
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): Map<string, EventSubscription[]> {
    return new Map(this.subscriptions);
  }

  private async processSubscription(subscription: EventSubscription, event: HaaLOEvent): Promise<void> {
    try {
      // Apply filter if exists
      if (subscription.filter && !subscription.filter(event)) {
        return;
      }

      const startTime = Date.now();
      
      // Execute callback with timeout
      await Promise.race([
        Promise.resolve(subscription.callback(event)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Subscription callback timeout')), this.config.processingTimeout)
        )
      ]);

      const processingTime = Date.now() - startTime;
      this.recordProcessingTime(event.type, processingTime);

      // Remove one-time subscriptions
      if (subscription.once) {
        this.unsubscribe(subscription.id);
      }

    } catch (error) {
      console.error(`❌ EventBus: Error processing subscription for ${event.type}:`, error);
      
      // Implement retry logic here if needed
      if (this.config.maxRetries > 0) {
        // Could implement retry queue
      }
    }
  }

  private addToHistory(event: HaaLOEvent): void {
    this.eventHistory.push(event);
    
    // Limit history size
    if (this.eventHistory.length > this.config.eventHistoryLimit) {
      this.eventHistory = this.eventHistory.slice(-this.config.eventHistoryLimit);
    }
  }

  private updateMetrics(event: HaaLOEvent): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalEvents++;
    
    // Update event types
    let eventTypeMetric = this.metrics.eventTypes.find(et => et.type === event.type);
    if (!eventTypeMetric) {
      eventTypeMetric = { type: event.type, count: 0, lastSeen: 0 };
      this.metrics.eventTypes.push(eventTypeMetric);
    }
    eventTypeMetric.count++;
    eventTypeMetric.lastSeen = event.timestamp;

    // Update module activity
    let moduleMetric = this.metrics.moduleActivity.find(ma => ma.module === event.sourceModule);
    if (!moduleMetric) {
      moduleMetric = { module: event.sourceModule, published: 0, subscribed: 0 };
      this.metrics.moduleActivity.push(moduleMetric);
    }
    moduleMetric.published++;

    // Update active subscriptions count
    this.metrics.activeSubscriptions = Array.from(this.subscriptions.values())
      .reduce((total, subs) => total + subs.length, 0);
  }

  private recordProcessingTime(eventType: string, processingTime: number): void {
    // Update average processing time (simple moving average)
    this.metrics.performance.averageProcessingTime = 
      (this.metrics.performance.averageProcessingTime * (this.metrics.totalEvents - 1) + processingTime) / this.metrics.totalEvents;

    // Track slowest events
    this.metrics.performance.slowestEvents.push({
      type: eventType,
      processingTime,
      timestamp: Date.now()
    });

    // Keep only top 10 slowest events
    this.metrics.performance.slowestEvents.sort((a, b) => b.processingTime - a.processingTime);
    this.metrics.performance.slowestEvents = this.metrics.performance.slowestEvents.slice(0, 10);
  }

  private startMetricsCollection(): void {
    // Calculate events per minute
    setInterval(() => {
      const oneMinuteAgo = Date.now() - 60000;
      const recentEvents = this.eventHistory.filter(event => event.timestamp > oneMinuteAgo);
      this.metrics.eventsPerMinute = recentEvents.length;
    }, 60000); // Update every minute
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const eventBus = EventBusService.getInstance();
export { EventBusService };
