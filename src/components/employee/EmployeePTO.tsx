// Employee PTO Management Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PTORequest {
  id: string;
  startDate: string;
  endDate: string;
  requestType: 'vacation' | 'sick' | 'personal' | 'bereavement';
  status: 'pending' | 'approved' | 'denied';
  reason: string;
  daysRequested: number;
  submittedDate: string;
  approvedBy?: string;
  notes?: string;
}

interface PTOBalance {
  vacation: { available: number; used: number; total: number };
  sick: { available: number; used: number; total: number };
  personal: { available: number; used: number; total: number };
}

export const EmployeePTO: React.FC = () => {
  const [ptoRequests, setPtoRequests] = useState<PTORequest[]>([]);
  const [ptoBalance, setPtoBalance] = useState<PTOBalance | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    startDate: '',
    endDate: '',
    requestType: 'vacation' as PTORequest['requestType'],
    reason: ''
  });

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockRequests: PTORequest[] = [
      {
        id: '1',
        startDate: '2024-02-14',
        endDate: '2024-02-16',
        requestType: 'vacation',
        status: 'approved',
        reason: 'Family vacation',
        daysRequested: 3,
        submittedDate: '2024-01-10',
        approvedBy: 'Sarah Manager'
      },
      {
        id: '2',
        startDate: '2024-01-22',
        endDate: '2024-01-22',
        requestType: 'sick',
        status: 'approved',
        reason: 'Doctor appointment',
        daysRequested: 1,
        submittedDate: '2024-01-20',
        approvedBy: 'Sarah Manager'
      },
      {
        id: '3',
        startDate: '2024-03-01',
        endDate: '2024-03-01',
        requestType: 'personal',
        status: 'pending',
        reason: 'Personal matter',
        daysRequested: 1,
        submittedDate: '2024-01-15'
      }
    ];

    const mockBalance: PTOBalance = {
      vacation: { available: 15.5, used: 3, total: 20 },
      sick: { available: 9, used: 1, total: 10 },
      personal: { available: 4, used: 1, total: 5 }
    };

    setTimeout(() => {
      setPtoRequests(mockRequests);
      setPtoBalance(mockBalance);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmitRequest = () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const daysRequested = Math.ceil(
      (new Date(newRequest.endDate).getTime() - new Date(newRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const request: PTORequest = {
      id: Math.random().toString(36).substr(2, 9),
      ...newRequest,
      status: 'pending',
      daysRequested,
      submittedDate: new Date().toISOString().split('T')[0]
    };

    setPtoRequests(prev => [request, ...prev]);
    setNewRequest({
      startDate: '',
      endDate: '',
      requestType: 'vacation',
      reason: ''
    });
    setShowRequestForm(false);

    toast({
      title: "Request Submitted",
      description: `Your ${newRequest.requestType} request has been submitted for approval`
    });
  };

  const getStatusIcon = (status: PTORequest['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTypeColor = (type: PTORequest['requestType']) => {
    switch (type) {
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'bereavement': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Off</h1>
          <p className="text-muted-foreground">
            Manage your paid time off requests and view your balance
          </p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Time Off
        </Button>
      </div>

      {/* PTO Balance Cards */}
      {ptoBalance && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacation Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ptoBalance.vacation.available}</div>
              <p className="text-xs text-muted-foreground">
                {ptoBalance.vacation.used} used of {ptoBalance.vacation.total} total
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(ptoBalance.vacation.used / ptoBalance.vacation.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sick Days</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ptoBalance.sick.available}</div>
              <p className="text-xs text-muted-foreground">
                {ptoBalance.sick.used} used of {ptoBalance.sick.total} total
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${(ptoBalance.sick.used / ptoBalance.sick.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ptoBalance.personal.available}</div>
              <p className="text-xs text-muted-foreground">
                {ptoBalance.personal.used} used of {ptoBalance.personal.total} total
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(ptoBalance.personal.used / ptoBalance.personal.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Form */}
      {showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                <Select
                  value={newRequest.requestType}
                  onValueChange={(value) => setNewRequest(prev => ({ ...prev, requestType: value as PTORequest['requestType'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Day</SelectItem>
                    <SelectItem value="bereavement">Bereavement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  value={newRequest.startDate}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  value={newRequest.endDate}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                placeholder="Please provide a brief reason for your time off request..."
                value={newRequest.reason}
                onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitRequest}>
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PTO Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ptoRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Badge className={getTypeColor(request.requestType)}>
                      {request.requestType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{request.daysRequested}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(request.submittedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{request.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {ptoRequests.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No time off requests</h3>
              <p className="text-muted-foreground">Click "Request Time Off" to create your first request</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};