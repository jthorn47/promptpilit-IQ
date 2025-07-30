import { useEffect, useRef, useCallback } from 'react';
import { eventBus } from '../services/EventBusService';
import type { HaaLOEvent } from '../types';

interface UseEventSubscriptionOptions {
  module: string;
  filter?: (event: HaaLOEvent) => boolean;
  once?: boolean;
  priority?: number;
  enabled?: boolean;
}

export const useEventSubscription = (
  eventType: string,
  callback: (event: HaaLOEvent) => void | Promise<void>,
  options: UseEventSubscriptionOptions
) => {
  const subscriptionIdRef = useRef<string | null>(null);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const subscribe = useCallback(() => {
    if (subscriptionIdRef.current || !options.enabled) return;

    subscriptionIdRef.current = eventBus.subscribe(
      eventType,
      (event) => callbackRef.current(event),
      {
        module: options.module,
        filter: options.filter,
        once: options.once,
        priority: options.priority
      }
    );
  }, [eventType, options]);

  const unsubscribe = useCallback(() => {
    if (subscriptionIdRef.current) {
      eventBus.unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
    }
  }, []);

  // Subscribe/unsubscribe based on enabled state
  useEffect(() => {
    if (options.enabled !== false) {
      subscribe();
    } else {
      unsubscribe();
    }

    return unsubscribe;
  }, [subscribe, unsubscribe, options.enabled]);

  return {
    isSubscribed: subscriptionIdRef.current !== null,
    subscribe,
    unsubscribe
  };
};

// Convenience hook for publishing events
export const useEventPublisher = (sourceModule: string) => {
  const publish = useCallback((
    type: string,
    payload: any,
    metadata?: Record<string, any>
  ) => {
    eventBus.publish({
      type,
      payload,
      sourceModule,
      metadata
    });
  }, [sourceModule]);

  return { publish };
};