import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, DollarSign, Calendar, User, FileText, BarChart3 } from 'lucide-react';

export const HROIQServiceLog: React.FC = () => {
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);

  // Mock data - will be replaced with real API calls
  const serviceLogs = [
    {
      id: '1',
      date: '2024-01-23',
      consultant: 'HR Consultant A',
      client: 'Acme Corporation',
      serviceRequest: 'Employee Handbook Update',
      hoursLogged: 3.5,
      description: 'Reviewed and updated remote work policy sections, compliance review',
      billable: true,
      ratePerHour: 175,
      totalAmount: 612.50
    },
    {
      id: '2',
      date: '2024-01-23',
      consultant: 'HR Consultant B',
      client: 'Tech Innovations Inc',
      serviceRequest: 'New Hire Onboarding',
      hoursLogged: 2.0,
      description: 'Created onboarding checklist and coordinated with hiring manager',
      billable: true,
      ratePerHour: 175,
      totalAmount: 350.00
    },
    {
      id: '3',
      date: '2024-01-22',
      consultant: 'HR Consultant A',
      client: 'Global Services LLC',
      serviceRequest: 'Compliance Review',
      hoursLogged: 4.0,
      description: 'Annual policy review and regulatory compliance assessment',
      billable: true,
      ratePerHour: 175,
      totalAmount: 700.00
    },
    {
      id: '4',
      date: '2024-01-22',
      consultant: 'HR Consultant C',
      client: 'StartupX',
      serviceRequest: 'Internal Training',
      hoursLogged: 1.5,
      description: 'Team training on HROIQ platform usage',
      billable: false,
      ratePerHour: 0,
      totalAmount: 0
    }
  ];

  const totalHours = serviceLogs.reduce((sum, log) => sum + log.hoursLogged, 0);
  const billableHours = serviceLogs.filter(log => log.billable).reduce((sum, log) => sum + log.hoursLogged, 0);
  const totalRevenue = serviceLogs.reduce((sum, log) => sum + log.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Log</h2>
          <p className="text-muted-foreground">Track consultant time and service delivery</p>
        </div>
        
        <Dialog open={isNewLogOpen} onOpenChange={setIsNewLogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Service Time</DialogTitle>
              <DialogDescription>
                Record time spent on client services for billing and reporting.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="log-date">Date</Label>
                <Input id="log-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <div>
                <Label htmlFor="client">Client</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acme">Acme Corporation</SelectItem>
                    <SelectItem value="tech-innovations">Tech Innovations Inc</SelectItem>
                    <SelectItem value="global-services">Global Services LLC</SelectItem>
                    <SelectItem value="startupx">StartupX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service-request">Service Request</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service request" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="handbook-update">Employee Handbook Update</SelectItem>
                    <SelectItem value="onboarding">New Hire Onboarding</SelectItem>
                    <SelectItem value="compliance">Compliance Review</SelectItem>
                    <SelectItem value="training">Training Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hours">Hours Logged</Label>
                <Input id="hours" type="number" step="0.25" placeholder="0.00" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detailed description of work performed"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="billable" defaultChecked />
                <Label htmlFor="billable">Billable hours</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsNewLogOpen(false)} className="flex-1">
                  Save Log
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewLogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billableHours}</div>
            <p className="text-xs text-muted-foreground">
              {((billableHours / totalHours) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From billable hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Logs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Logs</TabsTrigger>
          <TabsTrigger value="billing">Billing View</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <div className="space-y-4">
            {serviceLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{log.serviceRequest}</CardTitle>
                      <CardDescription>{log.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {log.billable ? (
                        <Badge variant="default">Billable</Badge>
                      ) : (
                        <Badge variant="secondary">Non-billable</Badge>
                      )}
                      <Badge variant="outline">${log.totalAmount.toFixed(2)}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {log.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {log.consultant}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {log.hoursLogged}h
                      </span>
                      {log.billable && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${log.ratePerHour}/hr
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.client}</span>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Summary</CardTitle>
              <CardDescription>Billable hours breakdown by client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Group logs by client for billing view */}
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Acme Corporation</h4>
                      <p className="text-sm text-muted-foreground">3.5 hours • $175/hour</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$612.50</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Tech Innovations Inc</h4>
                      <p className="text-sm text-muted-foreground">2.0 hours • $175/hour</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$350.00</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Global Services LLC</h4>
                      <p className="text-sm text-muted-foreground">4.0 hours • $175/hour</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$700.00</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Billable</span>
                    <span className="font-bold text-lg">${totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Generate detailed reports for time tracking and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Time Sheet Report</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Billing Report</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Utilization Report</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <User className="h-5 w-5" />
                  <span>Consultant Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};