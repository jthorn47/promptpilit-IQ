import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Search, Calendar, User } from 'lucide-react';

export const HROIQDeliverablesCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data - will be replaced with real API calls
  const deliverables = [
    {
      id: '1',
      title: 'Employee Safety Policy',
      description: 'Comprehensive workplace safety guidelines and procedures',
      type: 'policy',
      version: '2.1',
      status: 'delivered',
      deliveredAt: '2024-01-23',
      createdBy: 'HR Consultant A',
      fileSize: '2.4 MB',
      downloadCount: 15
    },
    {
      id: '2',
      title: 'New Hire Onboarding Checklist',
      description: 'Step-by-step checklist for onboarding new employees',
      type: 'checklist',
      version: '1.3',
      status: 'delivered',
      deliveredAt: '2024-01-22',
      createdBy: 'HR Consultant B',
      fileSize: '1.8 MB',
      downloadCount: 8
    },
    {
      id: '3',
      title: 'Compensation Analysis Report',
      description: 'Market analysis and salary benchmarking report',
      type: 'report',
      version: '1.0',
      status: 'delivered',
      deliveredAt: '2024-01-21',
      createdBy: 'HR Consultant A',
      fileSize: '5.2 MB',
      downloadCount: 3
    },
    {
      id: '4',
      title: 'Updated Employee Handbook',
      description: 'Revised handbook with new remote work policies',
      type: 'handbook',
      version: '3.2',
      status: 'in-review',
      deliveredAt: null,
      createdBy: 'HR Consultant C',
      fileSize: null,
      downloadCount: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'in-review': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'policy': return '📋';
      case 'handbook': return '📖';
      case 'checklist': return '✅';
      case 'report': return '📊';
      default: return '📄';
    }
  };

  const filteredDeliverables = deliverables.filter(deliverable => {
    const matchesSearch = deliverable.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliverable.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || deliverable.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payroll IQ Deliverables Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Access all completed work and documents from Easeworks
            </p>
          </div>
          <div className="hidden md:block opacity-20">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deliverables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="policy">Policies</SelectItem>
                <SelectItem value="handbook">Handbooks</SelectItem>
                <SelectItem value="checklist">Checklists</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Version Control Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">VaultIQ Integration:</span>
            <span className="text-muted-foreground">
              All deliverables are version-controlled and stored securely in VaultIQ. 
              Previous versions are accessible through the version history.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeliverables.map((deliverable) => (
          <Card key={deliverable.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(deliverable.type)}</span>
                    <CardTitle className="text-lg">{deliverable.title}</CardTitle>
                  </div>
                  <CardDescription>{deliverable.description}</CardDescription>
                </div>
                <Badge variant={getStatusColor(deliverable.status)}>
                  {deliverable.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span>Version {deliverable.version}</span>
                    {deliverable.fileSize && (
                      <>
                        <span>•</span>
                        <span>{deliverable.fileSize}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{deliverable.createdBy}</span>
                  </div>
                  {deliverable.deliveredAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Delivered {deliverable.deliveredAt}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs">{deliverable.downloadCount} downloads</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                {deliverable.status === 'delivered' && (
                  <Button size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
              </div>

              {deliverable.status === 'delivered' && (
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View Version History
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeliverables.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No deliverables found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};