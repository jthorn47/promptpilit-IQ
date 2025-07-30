import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Flag, 
  Eye, 
  Clock, 
  TrendingUp,
  User,
  DollarSign,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface SuspiciousActivity {
  id: string;
  type: 'unusual_time' | 'large_change' | 'multiple_overrides' | 'ip_anomaly' | 'rapid_changes';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  user: string;
  description: string;
  details: {
    affectedEmployee?: string;
    dollarImpact?: number;
    changeCount?: number;
    timeWindow?: string;
    ipAddress?: string;
    riskScore?: number;
  };
  status: 'flagged' | 'investigating' | 'resolved' | 'false_positive';
  investigatedBy?: string;
  notes?: string;
}

const mockSuspiciousActivities: SuspiciousActivity[] = [
  {
    id: '1',
    type: 'large_change',
    severity: 'high',
    timestamp: new Date(2024, 1, 14, 21, 30),
    user: 'Mike Chen',
    description: 'Unusually large salary adjustment made after hours',
    details: {
      affectedEmployee: 'Jane Smith',
      dollarImpact: 15000,
      riskScore: 85
    },
    status: 'flagged'
  },
  {
    id: '2',
    type: 'multiple_overrides',
    severity: 'critical',
    timestamp: new Date(2024, 1, 13, 16, 45),
    user: 'Sarah Johnson',
    description: 'Multiple tax overrides applied in succession',
    details: {
      changeCount: 5,
      timeWindow: '15 minutes',
      dollarImpact: -2250,
      riskScore: 95
    },
    status: 'investigating',
    investigatedBy: 'Security Team'
  },
  {
    id: '3',
    type: 'unusual_time',
    severity: 'medium',
    timestamp: new Date(2024, 1, 12, 2, 15),
    user: 'Admin User',
    description: 'Payroll changes made during unusual hours',
    details: {
      affectedEmployee: 'Multiple employees',
      changeCount: 3,
      riskScore: 65
    },
    status: 'resolved',
    investigatedBy: 'HR Manager',
    notes: 'Emergency payroll correction for holiday pay'
  },
  {
    id: '4',
    type: 'ip_anomaly',
    severity: 'medium',
    timestamp: new Date(2024, 1, 11, 14, 20),
    user: 'Lisa Davis',
    description: 'Access from unusual IP address location',
    details: {
      ipAddress: '203.45.67.89',
      riskScore: 70
    },
    status: 'false_positive',
    investigatedBy: 'IT Security',
    notes: 'User working from approved remote location'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'flagged': return 'bg-red-100 text-red-800';
    case 'investigating': return 'bg-orange-100 text-orange-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'false_positive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'unusual_time': return Clock;
    case 'large_change': return TrendingUp;
    case 'multiple_overrides': return AlertTriangle;
    case 'ip_anomaly': return Shield;
    case 'rapid_changes': return User;
    default: return AlertTriangle;
  }
};

const getTypeLabel = (type: string) => {
  const labels = {
    'unusual_time': 'Unusual Time Access',
    'large_change': 'Large Financial Change',
    'multiple_overrides': 'Multiple Overrides',
    'ip_anomaly': 'IP Address Anomaly',
    'rapid_changes': 'Rapid Changes'
  };
  return labels[type as keyof typeof labels] || type;
};

export const SuspiciousActivityMonitor: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<SuspiciousActivity | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredActivities = mockSuspiciousActivities.filter(activity => 
    statusFilter === 'all' || activity.status === statusFilter
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    // Handle status change logic
    console.log(`Changing status of ${id} to ${newStatus}`);
  };

  const criticalCount = mockSuspiciousActivities.filter(a => a.severity === 'critical').length;
  const flaggedCount = mockSuspiciousActivities.filter(a => a.status === 'flagged').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Flagged Items</p>
                <p className="text-2xl font-bold text-orange-600">{flaggedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-blue-600">78</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">At Risk Amount</p>
                <p className="text-2xl font-bold text-green-600">$17.2K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Suspicious Activities
          </CardTitle>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="flagged">Flagged</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const IconComponent = getTypeIcon(activity.type);
              return (
                <Card key={activity.id} className="border-l-4 border-l-red-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent className="h-5 w-5 text-red-600" />
                          <h3 className="font-semibold">{getTypeLabel(activity.type)}</h3>
                          <Badge className={getSeverityColor(activity.severity)}>
                            {activity.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{activity.description}</p>
                        
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">User:</span> {activity.user}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span> {format(activity.timestamp, 'MMM d, HH:mm')}
                          </div>
                          {activity.details.riskScore && (
                            <div>
                              <span className="text-muted-foreground">Risk Score:</span> 
                              <span className="font-medium text-red-600"> {activity.details.riskScore}/100</span>
                            </div>
                          )}
                          {activity.details.dollarImpact && (
                            <div>
                              <span className="text-muted-foreground">Impact:</span> 
                              <span className={`font-medium ${activity.details.dollarImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${Math.abs(activity.details.dollarImpact).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {activity.status === 'resolved' && activity.notes && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                            <div className="font-medium text-green-800">Resolution Notes:</div>
                            <div className="text-green-700">{activity.notes}</div>
                            <div className="text-green-600 text-xs mt-1">
                              Resolved by: {activity.investigatedBy}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedActivity(activity)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {activity.status === 'flagged' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(activity.id, 'investigating')}>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Start Investigation
                            </DropdownMenuItem>
                          )}
                          {activity.status === 'investigating' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(activity.id, 'resolved')}>
                                Mark as Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(activity.id, 'false_positive')}>
                                Mark as False Positive
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No suspicious activities found</p>
                <p className="text-sm">Your payroll system appears secure</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Activity View */}
      {selectedActivity && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activity Details</CardTitle>
            <Button variant="outline" onClick={() => setSelectedActivity(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Activity Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> {getTypeLabel(selectedActivity.type)}</div>
                  <div><span className="text-muted-foreground">Severity:</span> {selectedActivity.severity}</div>
                  <div><span className="text-muted-foreground">User:</span> {selectedActivity.user}</div>
                  <div><span className="text-muted-foreground">Timestamp:</span> {format(selectedActivity.timestamp, 'PPP p')}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Risk Assessment</h4>
                <div className="space-y-2 text-sm">
                  {selectedActivity.details.riskScore && (
                    <div><span className="text-muted-foreground">Risk Score:</span> {selectedActivity.details.riskScore}/100</div>
                  )}
                  {selectedActivity.details.dollarImpact && (
                    <div><span className="text-muted-foreground">Financial Impact:</span> ${selectedActivity.details.dollarImpact.toLocaleString()}</div>
                  )}
                  {selectedActivity.details.changeCount && (
                    <div><span className="text-muted-foreground">Changes Made:</span> {selectedActivity.details.changeCount}</div>
                  )}
                  {selectedActivity.details.ipAddress && (
                    <div><span className="text-muted-foreground">IP Address:</span> {selectedActivity.details.ipAddress}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedActivity.description}</p>
            </div>
            
            {selectedActivity.investigatedBy && (
              <div>
                <h4 className="font-medium mb-2">Investigation Status</h4>
                <div className="text-sm">
                  <div><span className="text-muted-foreground">Investigated by:</span> {selectedActivity.investigatedBy}</div>
                  {selectedActivity.notes && (
                    <div className="mt-2">
                      <span className="text-muted-foreground">Notes:</span>
                      <div className="mt-1 p-2 bg-muted rounded text-sm">{selectedActivity.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};