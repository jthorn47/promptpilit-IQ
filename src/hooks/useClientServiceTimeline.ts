import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimelineEvent {
  id: string;
  type: 'case' | 'service_log' | 'time_entry';
  date: string;
  title: string;
  description: string;
  hours?: number;
  consultant_name?: string;
  status?: string;
  case_id?: string;
  service_log_id?: string;
  time_entry_id?: string;
  billable?: boolean;
  category?: string;
}

export const useClientServiceTimeline = (companyId: string, dateRange?: { start: string; end: string }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const { data: timelineData, isLoading, error } = useQuery({
    queryKey: ['client-service-timeline', companyId, dateRange],
    queryFn: async () => {
      // Fetch cases
      let casesQuery = supabase
        .from('cases')
        .select('*')
        .eq('client_id', companyId)
        .order('created_at', { ascending: false });

      if (dateRange) {
        casesQuery = casesQuery.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
      }

      const { data: cases, error: casesError } = await casesQuery;
      if (casesError) throw casesError;

      // Fetch service logs
      let serviceLogsQuery = supabase
        .from('hroiq_service_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('service_date', { ascending: false });

      if (dateRange) {
        serviceLogsQuery = serviceLogsQuery.gte('service_date', dateRange.start).lte('service_date', dateRange.end);
      }

      const { data: serviceLogs, error: serviceLogsError } = await serviceLogsQuery;
      if (serviceLogsError) throw serviceLogsError;

      // Fetch time entries
      let timeEntriesQuery = supabase
        .from('unified_time_entries')
        .select('*')
        .eq('company_id', companyId)
        .order('work_date', { ascending: false });

      if (dateRange) {
        timeEntriesQuery = timeEntriesQuery.gte('work_date', dateRange.start).lte('work_date', dateRange.end);
      }

      const { data: timeEntries, error: timeEntriesError } = await timeEntriesQuery;
      if (timeEntriesError) throw timeEntriesError;

      return { cases: cases || [], serviceLogs: serviceLogs || [], timeEntries: timeEntries || [] };
    },
    enabled: !!companyId,
  });

  useEffect(() => {
    if (!timelineData) return;

    const mergedEvents: TimelineEvent[] = [];

    // Process cases
    timelineData.cases.forEach(case_ => {
      mergedEvents.push({
        id: `case-${case_.id}`,
        type: 'case',
        date: case_.created_at,
        title: `Case Created: ${case_.title}`,
        description: case_.description || '',
        status: case_.status,
        case_id: case_.id,
        category: case_.type,
        hours: case_.actual_hours
      });

      if (case_.closed_at) {
        mergedEvents.push({
          id: `case-closed-${case_.id}`,
          type: 'case',
          date: case_.closed_at,
          title: `Case Closed: ${case_.title}`,
          description: `Case resolved after ${case_.actual_hours || 0} hours`,
          status: 'closed',
          case_id: case_.id,
          category: case_.type,
          hours: case_.actual_hours
        });
      }
    });

    // Process service logs
    timelineData.serviceLogs.forEach(log => {
      mergedEvents.push({
        id: `service-${log.id}`,
        type: 'service_log',
        date: log.log_date,
        title: `Service Log Entry`,
        description: log.description || '',
        hours: log.hours_logged,
        consultant_name: log.consultant_id,
        service_log_id: log.id,
        billable: log.billable,
        category: 'service',
        case_id: log.service_request_id
      });
    });

    // Process time entries (but don't duplicate case-related entries)
    timelineData.timeEntries.forEach(entry => {
      if (!entry.case_id) { // Only show non-case time entries to avoid duplication
        mergedEvents.push({
          id: `time-${entry.id}`,
          type: 'time_entry',
          date: entry.work_date,
          title: `Time Entry: ${entry.time_type}`,
          description: entry.description || '',
          hours: entry.hours_logged,
          time_entry_id: entry.id,
          billable: entry.billable,
          category: entry.time_type
        });
      }
    });

    // Sort by date (newest first)
    mergedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setEvents(mergedEvents);
  }, [timelineData]);

  const getEventsByType = (type: 'case' | 'service_log' | 'time_entry') => {
    return events.filter(event => event.type === type);
  };

  const getTotalHours = () => {
    return events.reduce((total, event) => total + (event.hours || 0), 0);
  };

  const getBillableHours = () => {
    return events
      .filter(event => event.billable !== false)
      .reduce((total, event) => total + (event.hours || 0), 0);
  };

  const getEventsByDateRange = (start: string, end: string) => {
    return events.filter(event => event.date >= start && event.date <= end);
  };

  return {
    events,
    isLoading,
    error,
    getEventsByType,
    getTotalHours,
    getBillableHours,
    getEventsByDateRange
  };
};