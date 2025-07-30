/**
 * ACH Dashboard Component
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Download,
  Send,
  CheckCircle, 
  AlertCircle,
  Clock,
  CreditCard,
  FileText,
  Banknote,
  Activity,
  Settings
} from 'lucide-react';

interface ACHFileData {
  id: string;
  fileName: string;
  status: 'generated' | 'transmitted' | 'failed' | 'acknowledged';
  totalEntries: number;
  totalAmount: number;
  effectiveDate: string;
  createdAt: string;
  transmittedAt?: string;
  acknowledgmentStatus?: string;
}

const ACHDashboard: React.FC = () => {
  // Mock data - in real implementation, this would come from API
  const recentFiles: ACHFileData[] = [
    {
      id: '1',
      fileName: 'ACH_20240122_001.txt',
      status: 'acknowledged',
      totalEntries: 42,
      totalAmount: 98250.00,
      effectiveDate: '2024-01-26',
      createdAt: '2024-01-22T10:30:00Z',
      transmittedAt: '2024-01-22T10:35:00Z',
      acknowledgmentStatus: 'Accepted'
    },
    {
      id: '2',
      fileName: 'ACH_20240122_002.txt',
      status: 'transmitted',
      totalEntries: 38,
      totalAmount: 85000.00,
      effectiveDate: '2024-01-26',
      createdAt: '2024-01-22T11:15:00Z',
      transmittedAt: '2024-01-22T11:20:00Z'
    },
    {
      id: '3',
      fileName: 'ACH_20240122_003.txt',
      status: 'failed',
      totalEntries: 12,
      totalAmount: 28500.00,
      effectiveDate: '2024-01-26',
      createdAt: '2024-01-22T12:00:00Z'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Acknowledged</Badge>;
      case 'transmitted':
        return <Badge variant="secondary"><Send className="w-3 h-3 mr-1" />Transmitted</Badge>;
      case 'generated':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Generated</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const acknowledgedFiles = recentFiles.filter(f => f.status === 'acknowledged').length;
  const transmittedFiles = recentFiles.filter(f => f.status === 'transmitted').length;
  const failedFiles = recentFiles.filter(f => f.status === 'failed').length;
  const totalAmount = recentFiles.reduce((sum, file) => sum + file.totalAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ACH File Dashboard</h1>
          <p className="text-muted-foreground">Monitor NACHA file generation and transmission</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Generate ACH File
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Today</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentFiles.length}</div>
            <p className="text-xs text-muted-foreground">{acknowledgedFiles} acknowledged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Across all files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transmission Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acknowledgedFiles + transmittedFiles}</div>
            <p className="text-xs text-muted-foreground">{failedFiles} failed transmissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Cutoff</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3:00 PM</div>
            <p className="text-xs text-muted-foreground">2 hours remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent ACH Files */}
      <Card>
        <CardHeader>
          <CardTitle>Recent ACH Files</CardTitle>
          <CardDescription>Monitor NACHA file generation and bank transmission status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Transmitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.fileName}</TableCell>
                  <TableCell>{getStatusBadge(file.status)}</TableCell>
                  <TableCell>{file.totalEntries}</TableCell>
                  <TableCell>{formatCurrency(file.totalAmount)}</TableCell>
                  <TableCell>{formatDate(file.effectiveDate)}</TableCell>
                  <TableCell>{formatDateTime(file.createdAt)}</TableCell>
                  <TableCell>
                    {file.transmittedAt ? formatDateTime(file.transmittedAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      {file.status === 'generated' && (
                        <Button variant="outline" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      {file.status === 'failed' && (
                        <Button variant="outline" size="sm">
                          Retry
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Generation</CardTitle>
            <CardDescription>Create new ACH files for transmission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Generate from Batch
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Create Manual File
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transmission</CardTitle>
            <CardDescription>Send files to bank for processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Transmit Pending Files
              </Button>
              <Button variant="outline" className="w-full">
                <Activity className="w-4 h-4 mr-2" />
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banking</CardTitle>
            <CardDescription>Manage bank connections and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Banking Profiles
              </Button>
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                ACH Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current status of ACH processing systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">NACHA File Generator</span>
              </div>
              <Badge variant="outline" className="text-green-600">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Bank Transmission</span>
              </div>
              <Badge variant="outline" className="text-green-600">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Validation Service</span>
              </div>
              <Badge variant="outline" className="text-yellow-600">Warning</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Acknowledgment Monitor</span>
              </div>
              <Badge variant="outline" className="text-green-600">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ACHDashboard;