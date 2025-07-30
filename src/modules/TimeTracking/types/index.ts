// Time Tracking Domain Types
export interface TimeEntry {
  id: string;
  case_id: string;
  user_id: string;
  duration_minutes: number;
  billable_rate: number;
  is_billable: boolean;
  notes: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryRequest extends Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateTimeEntryRequest extends Partial<Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>> {}

export interface TimeEntryFilters {
  case_id?: string;
  user_id?: string;
  is_billable?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface TimeSummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalCost: number;
  entriesCount: number;
}

// Domain Events
export interface TimeEntryCreatedEvent {
  type: 'TIME_ENTRY_CREATED';
  payload: {
    entryId: string;
    entry: TimeEntry;
    timestamp: string;
  };
}

export interface TimeEntryUpdatedEvent {
  type: 'TIME_ENTRY_UPDATED';
  payload: {
    entryId: string;
    changes: Partial<TimeEntry>;
    previousState: TimeEntry;
    timestamp: string;
  };
}

export type TimeTrackingEvent = TimeEntryCreatedEvent | TimeEntryUpdatedEvent;