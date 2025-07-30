import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  User, 
  Calendar, 
  DollarSign, 
  Flag,
  Eye,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface PayrollAuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  entityType: 'employee' | 'payroll_run' | 'pay_type' | 'tax_setting';
  entityId: string;
  entityName?: string;
  changes: PayrollChangeRecord[];
  ipAddress: string;
  userAgent: string;
  isSuspicious?: boolean;
}

interface PayrollChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
  dollarImpact?: number;
}

interface AuditFilters {
  employee: string;
  payPeriod: string;
  changeType: string;
  dateRange: { start: string; end: string };
  user: string;
  impact: string;
}

interface AuditDiffViewerProps {
  filters: AuditFilters;
}

// Mock data
const mockAuditEvents: PayrollAuditEvent[] = [
  {
    id: '1',
    timestamp: new Date(2024, 1, 15, 14, 30),
    userId: 'admin-1',
    userName: 'Sarah Johnson',
    action: 'Rate Change',
    entityType: 'employee',
    entityId: 'emp-001',
    entityName: 'John Doe',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    changes: [
      {
        field: 'hourlyRate',
        oldValue: 25.00,
        newValue: 27.50,
        impact: 'high',
        dollarImpact: 5200
      },
      {
        field: 'overtimeRate',
        oldValue: 37.50,
        newValue: 41.25,
        impact: 'medium',
        dollarImpact: 975
      }
    ]
  },
  {
    id: '2',
    timestamp: new Date(2024, 1, 14, 9, 15),
    userId: 'hr-1',
    userName: 'Mike Chen',
    action: 'Tax Override',
    entityType: 'tax_setting',
    entityId: 'tax-001',
    entityName: 'Jane Smith',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0...',
    isSuspicious: true,
    changes: [
      {
        field: 'federalTaxOverride',
        oldValue: null,
        newValue: true,
        impact: 'critical',
        dollarImpact: -450
      },
      {
        field: 'federalTaxAmount',
        oldValue: 450.00,
        newValue: 0.00,
        impact: 'critical',
        dollarImpact: -450
      }
    ]
  },
  {
    id: '3',
    timestamp: new Date(2024, 1, 13, 16, 45),
    userId: 'system',
    userName: 'System',
    action: 'Automatic Calculation',
    entityType: 'payroll_run',
    entityId: 'run-001',
    entityName: 'Payroll Run #2024-004',
    ipAddress: '127.0.0.1',
    userAgent: 'System Process',
    changes: [
      {
        field: 'grossPay',
        oldValue: 0,
        newValue: 3250.00,
        impact: 'low',
        dollarImpact: 3250
      }
    ]
  }
];

export const AuditDiffViewer: React.FC<AuditDiffViewerProps> = ({ filters }) => {
  const [selectedEvent, setSelectedEvent] = useState<PayrollAuditEvent | null>(null);

  // Filter events based on filters (simplified for demo)
  const filteredEvents = mockAuditEvents.filter(event => {
    if (filters.employee && !event.entityName?.toLowerCase().includes(filters.employee.toLowerCase())) return false;
    if (filters.user && event.userName !== filters.user) return false;
    if (filters.impact && !event.changes.some(change => change.impact === filters.impact)) return false;
    return true;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'number' && value % 1 !== 0) return value.toFixed(2);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value.toString();
  };

  const DiffView = ({ change }: { change: PayrollChangeRecord }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{change.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
        <Badge className={getImpactColor(change.impact)}>
          {change.impact.toUpperCase()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Before */}
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-xs text-red-600 font-medium mb-1">BEFORE</div>
          <div className="font-mono text-sm">{formatValue(change.oldValue)}</div>
        </div>
        
        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* After */}
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-xs text-green-600 font-medium mb-1">AFTER</div>
          <div className="font-mono text-sm">{formatValue(change.newValue)}</div>
        </div>
      </div>
      
      {change.dollarImpact && (
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4" />
          <span className={change.dollarImpact > 0 ? 'text-green-600' : 'text-red-600'}>
            {change.dollarImpact > 0 ? '+' : ''}${change.dollarImpact.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Event List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Audit Events ({filteredEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit events found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedEvent?.id === event.id ? 'border-primary bg-primary/5' : ''
                  } ${event.isSuspicious ? 'border-red-300 bg-red-50' : ''}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{event.action}</h3>
                          {event.isSuspicious && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              Suspicious
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {event.entityType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{event.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(event.timestamp, 'MMM d, yyyy HH:mm')}</span>
                          </div>
                          <div>
                            Target: {event.entityName}
                          </div>
                          <div>
                            {event.changes.length} change{event.changes.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Impact summary */}
                    <div className="mt-3 flex items-center gap-2">
                      {event.changes.map((change, index) => (
                        <Badge key={index} variant="outline" className={getImpactColor(change.impact)}>
                          {change.impact}
                        </Badge>
                      ))}
                      {event.changes.some(c => c.dollarImpact) && (
                        <div className="text-sm text-muted-foreground ml-auto">
                          Total Impact: ${event.changes.reduce((sum, c) => sum + (c.dollarImpact || 0), 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Diff View */}
      {selectedEvent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Change Details: {selectedEvent.action}
              {selectedEvent.isSuspicious && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Flagged
                </Badge>
              )}
            </CardTitle>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event metadata */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Modified By</div>
                <div>{selectedEvent.userName}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Timestamp</div>
                <div>{format(selectedEvent.timestamp, 'PPP p')}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">IP Address</div>
                <div className="font-mono">{selectedEvent.ipAddress}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Target</div>
                <div>{selectedEvent.entityName}</div>
              </div>
            </div>
            
            {/* Change diffs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Field Changes</h3>
              {selectedEvent.changes.map((change, index) => (
                <DiffView key={index} change={change} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};