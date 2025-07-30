import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, User, FileText, Plus, ArrowLeft } from 'lucide-react';

export const HROIQServiceLogSimple: React.FC = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [serviceLogs, setServiceLogs] = useState([
    {
      id: '1',
      date: '2024-01-15',
      consultant: 'Sarah Johnson',
      service: 'Policy Review',
      hours: 2.5,
      description: 'Reviewed employee handbook and updated workplace policies',
      status: 'Completed',
      billable: true
    },
    {
      id: '2',
      date: '2024-01-14',
      consultant: 'Mike Chen',
      service: 'Compliance Audit',
      hours: 4.0,
      description: 'Conducted quarterly compliance audit and documentation review',
      status: 'Completed',
      billable: true
    },
    {
      id: '3',
      date: '2024-01-12',
      consultant: 'Sarah Johnson',
      service: 'HR Consultation',
      hours: 1.5,
      description: 'Employee relations consultation and guidance',
      status: 'Completed',
      billable: false
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    consultant: '',
    service: '',
    hours: '',
    description: '',
    billable: true
  });

  const handleAddEntry = () => {
    if (!newEntry.consultant || !newEntry.service || !newEntry.hours) {
      return; // Basic validation
    }

    const entry = {
      id: (serviceLogs.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      consultant: newEntry.consultant,
      service: newEntry.service,
      hours: parseFloat(newEntry.hours),
      description: newEntry.description,
      status: 'Completed',
      billable: newEntry.billable
    };

    setServiceLogs([entry, ...serviceLogs]);
    setNewEntry({
      consultant: '',
      service: '',
      hours: '',
      description: '',
      billable: true
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/hro-iq')}
        className="flex items-center mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to HRO IQ
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Log</h2>
          <p className="text-muted-foreground">Track all HR services and consulting hours</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Service Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="consultant">Consultant</Label>
                <Input
                  id="consultant"
                  value={newEntry.consultant}
                  onChange={(e) => setNewEntry({ ...newEntry, consultant: e.target.value })}
                  placeholder="Enter consultant name"
                />
              </div>
              
              <div>
                <Label htmlFor="service">Service Type</Label>
                <Select value={newEntry.service} onValueChange={(value) => setNewEntry({ ...newEntry, service: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR Consultation">HR Consultation</SelectItem>
                    <SelectItem value="Policy Review">Policy Review</SelectItem>
                    <SelectItem value="Compliance Audit">Compliance Audit</SelectItem>
                    <SelectItem value="Employee Relations">Employee Relations</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={newEntry.hours}
                  onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                  placeholder="0.0"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="Describe the service provided..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="billable">Billable</Label>
                <Select value={newEntry.billable.toString()} onValueChange={(value) => setNewEntry({ ...newEntry, billable: value === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Billable</SelectItem>
                    <SelectItem value="false">Non-billable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddEntry} className="flex-1">
                  Add Entry
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {serviceLogs.map((log) => (
          <Card key={log.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{log.service}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={log.billable ? "default" : "secondary"}>
                    {log.billable ? "Billable" : "Non-billable"}
                  </Badge>
                  <Badge variant="outline">{log.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{log.description}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{log.consultant}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{log.hours} hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{log.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">8.0</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold">6.5</div>
              <div className="text-sm text-muted-foreground">Billable Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1.5</div>
              <div className="text-sm text-muted-foreground">Non-billable Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};