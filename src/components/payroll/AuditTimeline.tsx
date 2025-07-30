import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock as TimelineIcon, 
  User, 
  Clock, 
  DollarSign,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, isToday, isYesterday, subDays } from 'date-fns';

interface AuditFilters {
  employee: string;
  payPeriod: string;
  changeType: string;
  dateRange: { start: string; end: string };
  user: string;
  impact: string;
}

interface TimelineEvent {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  target: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  dollarImpact?: number;
  description: string;
  category: 'payroll' | 'employee' | 'tax' | 'system';
}

interface AuditTimelineProps {
  filters: AuditFilters;
}

// Mock timeline data
const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date(2024, 1, 15, 14, 30),
    user: 'Sarah Johnson',
    action: 'Rate Increase',
    target: 'John Doe',
    impact: 'high',
    dollarImpact: 5200,
    description: 'Increased hourly rate from $25.00 to $27.50 effective immediately',
    category: 'employee'
  },
  {
    id: '2',
    timestamp: new Date(2024, 1, 15, 10, 15),
    user: 'System',
    action: 'Payroll Processing',
    target: 'Payroll Run #2024-004',
    impact: 'low',
    description: 'Automatically processed bi-weekly payroll for 23 employees',
    category: 'payroll'
  },
  {
    id: '3',
    timestamp: new Date(2024, 1, 14, 16, 45),
    user: 'Mike Chen',
    action: 'Tax Override',
    target: 'Jane Smith',
    impact: 'critical',
    dollarImpact: -450,
    description: 'Applied federal tax exemption override',
    category: 'tax'
  },
  {
    id: '4',
    timestamp: new Date(2024, 1, 14, 9, 20),
    user: 'System',
    action: 'Auto-Sync',
    target: 'Employee Database',
    impact: 'low',
    description: 'Synchronized employee data with HR system',
    category: 'system'
  },
  {
    id: '5',
    timestamp: new Date(2024, 1, 13, 11, 30),
    user: 'Lisa Davis',
    action: 'Deduction Change',
    target: 'Mike Johnson',
    impact: 'medium',
    dollarImpact: -125,
    description: 'Updated health insurance deduction amount',
    category: 'employee'
  }
];

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ filters }) => {
  const [groupBy, setGroupBy] = useState<'date' | 'user' | 'category'>('date');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today', 'yesterday']));

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payroll': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'tax': return 'bg-red-100 text-red-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const groupEvents = () => {
    const filteredEvents = mockTimelineEvents; // Apply filters here
    
    if (groupBy === 'date') {
      const grouped = new Map<string, TimelineEvent[]>();
      
      filteredEvents.forEach(event => {
        const dateKey = format(event.timestamp, 'yyyy-MM-dd');
        const label = getDateLabel(event.timestamp);
        
        if (!grouped.has(label)) {
          grouped.set(label, []);
        }
        grouped.get(label)!.push(event);
      });
      
      return Array.from(grouped.entries()).map(([label, events]) => ({
        label,
        events: events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      }));
    } else if (groupBy === 'user') {
      const grouped = new Map<string, TimelineEvent[]>();
      
      filteredEvents.forEach(event => {
        if (!grouped.has(event.user)) {
          grouped.set(event.user, []);
        }
        grouped.get(event.user)!.push(event);
      });
      
      return Array.from(grouped.entries()).map(([user, events]) => ({
        label: user,
        events: events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      }));
    } else {
      const grouped = new Map<string, TimelineEvent[]>();
      
      filteredEvents.forEach(event => {
        const category = event.category.charAt(0).toUpperCase() + event.category.slice(1);
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
        grouped.get(category)!.push(event);
      });
      
      return Array.from(grouped.entries()).map(([category, events]) => ({
        label: category,
        events: events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      }));
    }
  };

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  const groupedEvents = groupEvents();

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <TimelineIcon className="h-5 w-5" />
            Audit Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Group by:</span>
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline Content */}
      <div className="space-y-4">
        {groupedEvents.map((group) => (
          <Card key={group.label}>
            <CardHeader className="pb-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleGroup(group.label)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{group.label}</h3>
                  <Badge variant="outline">{group.events.length} events</Badge>
                </div>
                {expandedGroups.has(group.label) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            
            {expandedGroups.has(group.label) && (
              <CardContent className="pt-0">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                  
                  <div className="space-y-6">
                    {group.events.map((event, index) => (
                      <div key={event.id} className="relative flex gap-4">
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-3 h-3 rounded-full ${getImpactColor(event.impact)} mt-2 flex-shrink-0`}>
                        </div>
                        
                        {/* Event content */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{event.action}</h4>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            <Badge className={getCategoryColor(event.category)}>
                              {event.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{event.user}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(event.timestamp, 'h:mm a')}</span>
                            </div>
                            {event.dollarImpact && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span className={event.dollarImpact > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {event.dollarImpact > 0 ? '+' : ''}${Math.abs(event.dollarImpact).toLocaleString()}
                                </span>
                              </div>
                            )}
                            <div>
                              Target: {event.target}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {groupedEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <TimelineIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No timeline events found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};