
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Filter, 
  Plus, 
  CreditCard,
  Search,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { useHROIQServiceLog } from '../hooks/useHROIQServiceLog';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ServiceLogFilters {
  clientId?: string;
  consultantId?: string;
  serviceType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const HROIQServiceLogEnhanced: React.FC = () => {
  const [filters, setFilters] = useState<ServiceLogFilters>({});
  const [showAddLog, setShowAddLog] = useState(false);
  const [showWaiveDialog, setShowWaiveDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [waiveReason, setWaiveReason] = useState('');
  
  const { serviceLogs, isLoading, createServiceLog, waiveHours } = useHROIQServiceLog(filters);
  const { toast } = useToast();

  const [newLog, setNewLog] = useState({
    retainer_id: '',
    service_type: '',
    service_date: '',
    billable_hours: 0,
    description: '',
    consultant_id: '',
    notes: '',
  });

  const handleAddLog = () => {
    if (!newLog.retainer_id || !newLog.service_type || !newLog.service_date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createServiceLog(newLog);
    setNewLog({
      retainer_id: '',
      service_type: '',
      service_date: '',
      billable_hours: 0,
      description: '',
      consultant_id: '',
      notes: '',
    });
    setShowAddLog(false);
  };

  const handleWaiveHours = () => {
    if (!selectedLog || !waiveReason) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for waiving hours',
        variant: 'destructive',
      });
      return;
    }

    waiveHours({ logId: selectedLog.id, reason: waiveReason });
    setShowWaiveDialog(false);
    setWaiveReason('');
    setSelectedLog(null);
  };

  const totalHours = serviceLogs?.reduce((sum, log) => sum + (log.hours_logged || 0), 0) || 0;
  const totalWaived = serviceLogs?.filter(log => log.billable === false).reduce((sum, log) => sum + (log.hours_logged || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payroll IQ Service Log
            </h1>
            <p className="text-muted-foreground text-lg">
              Track time entries and billing for your retainer
            </p>
          </div>
          <div className="hidden md:block opacity-20">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Across all clients
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hours Waived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWaived.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Goodwill credits
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalHours - totalWaived).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Net billable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </div>
            <Dialog open={showAddLog} onOpenChange={setShowAddLog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Service Log Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service_type">Service Type</Label>
                      <Select value={newLog.service_type} onValueChange={(value) => setNewLog({...newLog, service_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="document_review">Document Review</SelectItem>
                          <SelectItem value="policy_development">Policy Development</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="investigation">Investigation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="service_date">Service Date</Label>
                      <Input
                        id="service_date"
                        type="date"
                        value={newLog.service_date}
                        onChange={(e) => setNewLog({...newLog, service_date: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="billable_hours">Billable Hours</Label>
                    <Input
                      id="billable_hours"
                      type="number"
                      step="0.25"
                      value={newLog.billable_hours}
                      onChange={(e) => setNewLog({...newLog, billable_hours: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newLog.description}
                      onChange={(e) => setNewLog({...newLog, description: e.target.value})}
                      placeholder="Describe the work performed..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea
                      id="notes"
                      value={newLog.notes}
                      onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                      placeholder="Internal notes (not visible to client)..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddLog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddLog}>
                      Add Log Entry
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Client</Label>
              <Select value={filters.clientId || ''} onValueChange={(value) => setFilters({...filters, clientId: value || undefined})}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All clients</SelectItem>
                  {/* Add client options */}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Service Type</Label>
              <Select value={filters.serviceType || ''} onValueChange={(value) => setFilters({...filters, serviceType: value || undefined})}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="document_review">Document Review</SelectItem>
                  <SelectItem value="policy_development">Policy Development</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: {
                    start: e.target.value,
                    end: filters.dateRange?.end || ''
                  }
                })}
              />
            </div>
            
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: {
                    start: filters.dateRange?.start || '',
                    end: e.target.value
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Service Log Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : serviceLogs && serviceLogs.length > 0 ? (
              serviceLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">HR Service</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.log_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium">{log.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={!log.billable ? 'secondary' : 'default'}>
                        {log.hours_logged}h {!log.billable && '(Waived)'}
                      </Badge>
                      {log.billable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowWaiveDialog(true);
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Waive
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {!log.billable && (
                    <div className="bg-yellow-50 p-2 rounded text-sm">
                      <strong>Waived:</strong> Hours not billable
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No service log entries found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Waive Hours Dialog */}
      <Dialog open={showWaiveDialog} onOpenChange={setShowWaiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Hours</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to waive {selectedLog?.hours_logged} hours for this service entry.
              Please provide a reason for the waiver.
            </p>
            
            <div>
              <Label htmlFor="waive_reason">Reason for Waiver</Label>
              <Textarea
                id="waive_reason"
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="Enter reason for waiving these hours..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWaiveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleWaiveHours}>
                Waive Hours
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
