import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

export interface DateFormatOptions {
  format?: string;
  locale?: string;
  includeTime?: boolean;
  relative?: boolean;
  distance?: boolean;
}

export const formatDate = (
  date: Date | string | number,
  options: DateFormatOptions = {}
): string => {
  const {
    format: formatString = 'PPP',
    includeTime = false,
    relative = false,
    distance = false
  } = options;

  let dateObj: Date;

  // Convert input to Date object
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Validate date
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }

  try {
    // Format relative time (e.g., "2 hours ago", "next Friday")
    if (relative) {
      return formatRelative(dateObj, new Date());
    }

    // Format distance (e.g., "2 hours", "3 days")
    if (distance) {
      return formatDistance(dateObj, new Date(), { addSuffix: true });
    }

    // Standard formatting
    let pattern = formatString;
    if (includeTime && !formatString.includes('p') && !formatString.includes('H')) {
      pattern = `${formatString} p`;
    }

    return format(dateObj, pattern);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateObj.toLocaleDateString();
  }
};

// Common date format presets
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  TIME_12: 'h:mm a',
  TIME_24: 'HH:mm',
  DATETIME_SHORT: 'MM/dd/yyyy h:mm a',
  DATETIME_MEDIUM: 'MMM dd, yyyy h:mm a',
  DATETIME_LONG: 'MMMM dd, yyyy h:mm a'
};

export const formatDateShort = (date: Date | string | number): string => {
  return formatDate(date, { format: DATE_FORMATS.SHORT });
};

export const formatDateMedium = (date: Date | string | number): string => {
  return formatDate(date, { format: DATE_FORMATS.MEDIUM });
};

export const formatDateLong = (date: Date | string | number): string => {
  return formatDate(date, { format: DATE_FORMATS.LONG });
};

export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, { format: DATE_FORMATS.DATETIME_MEDIUM });
};

export const formatRelativeTime = (date: Date | string | number): string => {
  return formatDate(date, { relative: true });
};

export const formatTimeAgo = (date: Date | string | number): string => {
  return formatDate(date, { distance: true });
};

export const formatTime = (date: Date | string | number, use24Hour = false): string => {
  return formatDate(date, { 
    format: use24Hour ? DATE_FORMATS.TIME_24 : DATE_FORMATS.TIME_12 
  });
};

export const formatDateRange = (
  startDate: Date | string | number,
  endDate: Date | string | number,
  options: DateFormatOptions = {}
): string => {
  const start = formatDate(startDate, options);
  const end = formatDate(endDate, options);
  return `${start} - ${end}`;
};

export const getQuarterFromDate = (date: Date | string | number): { quarter: number; year: number } => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  const month = dateObj.getMonth() + 1; // getMonth() returns 0-11
  const quarter = Math.ceil(month / 3);
  const year = dateObj.getFullYear();
  
  return { quarter, year };
};

export const getDateRangeForQuarter = (quarter: number, year: number): { start: Date; end: Date } => {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0); // Last day of the quarter
  
  return { start, end };
};