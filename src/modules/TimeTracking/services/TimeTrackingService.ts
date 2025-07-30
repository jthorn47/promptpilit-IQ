import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TimeEntry, 
  TimeEntryFilters, 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest,
  TimeSummary,
  TimeTrackingEvent 
} from '../types';
import { EventBus } from '@/modules/shared/services/EventBus';

export class TimeTrackingService {
  private eventBus = EventBus.getInstance();

  async getTimeEntries(filters?: TimeEntryFilters): Promise<TimeEntry[]> {
    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.case_id) {
        query = query.eq('case_id', filters.case_id);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.is_billable !== undefined) {
        query = query.eq('is_billable', filters.is_billable);
      }
      if (filters?.date_range) {
        query = query
          .gte('entry_date', filters.date_range.start)
          .lte('entry_date', filters.date_range.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch time entries');
    }
  }

  async getTimeEntryById(id: string): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching time entry:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch time entry');
    }
  }

  async createTimeEntry(entryData: CreateTimeEntryRequest): Promise<TimeEntry> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;

      // Emit domain event
      const event: TimeTrackingEvent = {
        type: 'TIME_ENTRY_CREATED',
        payload: {
          entryId: data.id,
          entry: data,
          timestamp: new Date().toISOString(),
        },
      };
      this.eventBus.emit('timeEntry:created', event);

      toast.success('Time entry logged successfully');
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast.error('Failed to log time entry');
      throw error;
    }
  }

  async updateTimeEntry(id: string, updates: UpdateTimeEntryRequest): Promise<TimeEntry> {
    try {
      // Get current state for event
      const currentEntry = await this.getTimeEntryById(id);
      if (!currentEntry) {
        throw new Error('Time entry not found');
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Emit domain event
      const event: TimeTrackingEvent = {
        type: 'TIME_ENTRY_UPDATED',
        payload: {
          entryId: id,
          changes: updates,
          previousState: currentEntry,
          timestamp: new Date().toISOString(),
        },
      };
      this.eventBus.emit('timeEntry:updated', event);

      toast.success('Time entry updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast.error('Failed to update time entry');
      throw error;
    }
  }

  async deleteTimeEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Time entry deleted successfully');
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast.error('Failed to delete time entry');
      throw error;
    }
  }

  async getTimeSummary(filters?: TimeEntryFilters): Promise<TimeSummary> {
    try {
      const entries = await this.getTimeEntries(filters);
      
      const totalHours = entries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
      const billableHours = entries
        .filter(entry => entry.is_billable)
        .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
      const nonBillableHours = totalHours - billableHours;
      const totalCost = entries.reduce((sum, entry) => {
        return sum + (entry.duration_minutes / 60) * entry.billable_rate;
      }, 0);

      return {
        totalHours,
        billableHours,
        nonBillableHours,
        totalCost,
        entriesCount: entries.length,
      };
    } catch (error) {
      console.error('Error calculating time summary:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate time summary');
    }
  }

  async getTimeEntriesForCase(caseId: string): Promise<TimeEntry[]> {
    return this.getTimeEntries({ case_id: caseId });
  }

  async getTimeEntriesForUser(userId: string): Promise<TimeEntry[]> {
    return this.getTimeEntries({ user_id: userId });
  }
}

// Singleton instance
export const timeTrackingService = new TimeTrackingService();