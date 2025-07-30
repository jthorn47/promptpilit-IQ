import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Clock, 
  MapPin, 
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw
} from "lucide-react";
import { SupervisorService } from "../services/SupervisorService";
import { EmployeePunchStatus, DashboardFilters } from "../types/supervisor";

interface RealTimePunchViewProps {
  companyId: string;
  supervisorId: string;
  onEmployeeClick?: (employeeId: string) => void;
}

export function RealTimePunchView({ 
  companyId, 
  supervisorId, 
  onEmployeeClick 
}: RealTimePunchViewProps) {
  const [employees, setEmployees] = useState<EmployeePunchStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters, setFilters] = useState<DashboardFilters>({
    status_filter: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployeeStatus();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadEmployeeStatus, 30000);
    return () => clearInterval(interval);
  }, [companyId, supervisorId, filters]);

  const loadEmployeeStatus = async () => {
    try {
      setLoading(true);
      const status = await SupervisorService.getEmployeePunchStatus(
        supervisorId,
        companyId,
        filters
      );
      setEmployees(status);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load employee status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: EmployeePunchStatus['status']) => {
    const config = {
      clocked_in: { 
        label: 'Clocked In', 
        variant: 'default' as const, 
        className: 'bg-green-100 text-green-800' 
      },
      scheduled_not_in: { 
        label: 'Missing', 
        variant: 'destructive' as const, 
        className: 'bg-red-100 text-red-800' 
      },
      not_scheduled: { 
        label: 'Off', 
        variant: 'secondary' as const, 
        className: 'bg-gray-100 text-gray-600' 
      },
      clocked_out: { 
        label: 'Completed', 
        variant: 'outline' as const, 
        className: 'bg-blue-100 text-blue-800' 
      }
    };

    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const getStatusIcon = (status: EmployeePunchStatus['status']) => {
    switch (status) {
      case 'clocked_in':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled_not_in':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'clocked_out':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatVariance = (minutes?: number) => {
    if (!minutes || minutes === 0) return '';
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    return minutes > 0 ? `+${timeStr}` : `-${timeStr}`;
  };

  const filteredEmployees = employees.filter(emp =>
    emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.job_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    total: employees.length,
    clocked_in: employees.filter(e => e.status === 'clocked_in').length,
    scheduled_not_in: employees.filter(e => e.status === 'scheduled_not_in').length,
    compliance_issues: employees.filter(e => e.compliance_flags && e.compliance_flags.length > 0).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Real-Time Status
          </h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadEmployeeStatus}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clocked In</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.clocked_in}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missing</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.scheduled_not_in}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.compliance_issues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search employees, locations, or job codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <select
          value={filters.status_filter || 'all'}
          onChange={(e) => setFilters({ ...filters, status_filter: e.target.value as any })}
          className="border border-input bg-background px-3 py-2 text-sm rounded-md"
        >
          <option value="all">All Status</option>
          <option value="clocked_in">Clocked In</option>
          <option value="compliance_issues">Compliance Issues</option>
        </select>
      </div>

      {/* Employee List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="divide-y">
              {filteredEmployees.map((employee) => (
                <div 
                  key={employee.employee_id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onEmployeeClick?.(employee.employee_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.employee_photo} />
                        <AvatarFallback>
                          {employee.employee_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">{employee.employee_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {employee.location_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {employee.location_name}
                            </span>
                          )}
                          {employee.job_code && (
                            <Badge variant="outline" className="text-xs">
                              {employee.job_code}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Clock Times */}
                      <div className="text-sm text-center">
                        <p className="text-muted-foreground">Clock In</p>
                        <p className="font-medium">
                          {formatTime(employee.clock_in_time)}
                        </p>
                        {employee.variance_minutes && (
                          <p className={`text-xs ${
                            employee.variance_minutes > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatVariance(employee.variance_minutes)}
                          </p>
                        )}
                      </div>

                      {/* Scheduled Time */}
                      {employee.scheduled_start && (
                        <div className="text-sm text-center">
                          <p className="text-muted-foreground">Scheduled</p>
                          <p className="font-medium">
                            {formatTime(employee.scheduled_start)} - {formatTime(employee.scheduled_end)}
                          </p>
                        </div>
                      )}

                      {/* Device */}
                      {employee.last_punch_device && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Smartphone className="h-3 w-3" />
                          <span>{employee.last_punch_device}</span>
                        </div>
                      )}

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(employee.status)}
                        {getStatusBadge(employee.status)}
                      </div>
                    </div>
                  </div>

                  {/* Compliance Flags */}
                  {employee.compliance_flags && employee.compliance_flags.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {employee.compliance_flags.map((flag, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employees found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}