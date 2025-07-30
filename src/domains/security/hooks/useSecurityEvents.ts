import { useState, useEffect } from 'react';
import { SecurityEvent } from '../types';

// Mock security events for demonstration
const mockEvents: SecurityEvent[] = [
  {
    id: '1',
    event_type: 'Failed Login Attempt',
    severity: 'medium',
    source: 'Authentication System',
    description: 'Multiple failed login attempts detected from IP 192.168.1.100',
    ip_address: '192.168.1.100',
    is_resolved: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    event_type: 'Suspicious API Activity',
    severity: 'high',
    source: 'API Gateway',
    description: 'Unusual API request patterns detected',
    is_resolved: true,
    resolved_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export const useSecurityEvents = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security events');
      setLoading(false);
    }
  };

  const resolveEvent = async (eventId: string, resolvedBy: string) => {
    try {
      const updatedEvents = events.map(event =>
        event.id === eventId
          ? {
              ...event,
              is_resolved: true,
              resolved_by: resolvedBy,
              resolved_at: new Date().toISOString()
            }
          : event
      );
      setEvents(updatedEvents);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve event';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    resolveEvent,
    refetch: fetchEvents
  };
};