import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Plus, Search, AlertTriangle, Clock, Zap, Settings } from "lucide-react";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { format } from 'date-fns';

const alerts = [
  {
    id: '1',
    name: 'Overdue Case Alert',
    description: 'Notify when cases exceed 14 days without update',
    type: 'time_based',
    status: 'active',
    lastTriggered: new Date('2024-01-15'),
    triggerCount: 3,
    severity: 'high'
  },
  {
    id: '2',
    name: 'High Priority Case Assignment',
    description: 'Alert supervisors when high priority cases are created',
    type: 'priority_based',
    status: 'active',
    lastTriggered: new Date('2024-01-14'),
    triggerCount: 12,
    severity: 'medium'
  },
  {
    id: '3',
    name: 'Legal Deadline Reminder',
    description: 'Send alerts 3 days before legal deadlines',
    type: 'deadline',
    status: 'active',
    lastTriggered: new Date('2024-01-13'),
    triggerCount: 5,
    severity: 'critical'
  },
  {
    id: '4',
    name: 'Workload Balance Alert',
    description: 'Notify when case assignments are unbalanced',
    type: 'workload',
    status: 'paused',
    lastTriggered: new Date('2024-01-10'),
    triggerCount: 8,
    severity: 'low'
  }
];

const triggerTemplates = [
  {
    name: 'Time-based Trigger',
    description: 'Alert based on elapsed time or deadlines',
    icon: Clock,
    color: 'text-blue-500'
  },
  {
    name: 'Priority Trigger',
    description: 'Alert based on case priority levels',
    icon: AlertTriangle,
    color: 'text-orange-500'
  },
  {
    name: 'Status Change Trigger',
    description: 'Alert when case status changes',
    icon: Zap,
    color: 'text-green-500'
  },
  {
    name: 'Custom Trigger',
    description: 'Create custom alert conditions',
    icon: Settings,
    color: 'text-purple-500'
  }
];

export const PulseAlertsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'paused': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'medium': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'high': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'critical': 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <StandardPageLayout
      title="Alerts & Triggers"
      subtitle="Set up automatic alerts and escalation triggers"
      badge="Active"
    >
      <div className="space-y-6">
        {/* Search and Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts and triggers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Filters */}
        <div className="flex gap-2">
          {['all', 'active', 'paused', 'inactive'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All Alerts' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{alerts.filter(a => a.status === 'active').length}</p>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold">{alerts.filter(a => a.severity === 'critical').length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Triggers</p>
                  <p className="text-2xl font-bold">7</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Setup Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup Templates</CardTitle>
            <CardDescription>
              Get started quickly with pre-configured alert templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {triggerTemplates.map((template, index) => {
                const IconComponent = template.icon;
                return (
                  <Card key={index} className="border-border hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <IconComponent className={`h-8 w-8 mx-auto mb-2 ${template.color}`} />
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Alerts ({filteredAlerts.length})</CardTitle>
            <CardDescription>
              Manage and monitor all alert rules and triggers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Trigger Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{alert.name}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {alert.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityBadge(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(alert.lastTriggered, 'MMM d, yyyy')}</TableCell>
                    <TableCell>{alert.triggerCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost">
                          Test
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
    </StandardPageLayout>
  );
};