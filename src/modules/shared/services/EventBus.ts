// Simple Event Bus for microservices communication
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Array<(event: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(eventType: string, listener: (event: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  off(eventType: string, listener: (event: any) => void): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(eventType: string, event: any): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}