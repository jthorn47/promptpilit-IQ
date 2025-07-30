import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, UserPlus, Shield, FileText, MessageSquare, Lock } from "lucide-react";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { format } from 'date-fns';

const legalReviews = [
  {
    id: '1',
    caseId: 'CASE-001',
    caseTitle: 'Harassment Investigation - Engineering',
    reviewType: 'Privilege Review',
    assignedCounsel: 'Sarah Johnson, Esq.',
    requestedBy: 'John Admin',
    requestDate: new Date('2024-01-15'),
    status: 'In Review',
    urgency: 'High',
    estimatedCompletion: new Date('2024-01-20')
  },
  {
    id: '2',
    caseId: 'CASE-003',
    caseTitle: 'ADA Accommodation Request',
    reviewType: 'Compliance Review',
    assignedCounsel: 'Michael Davis, Esq.',
    requestedBy: 'HR Team',
    requestDate: new Date('2024-01-14'),
    status: 'Completed',
    urgency: 'Medium',
    estimatedCompletion: new Date('2024-01-18')
  }
];

const counselList = [
  {
    id: '1',
    name: 'Sarah Johnson, Esq.',
    firm: 'Johnson & Associates',
    specialty: 'Employment Law',
    status: 'Active',
    caseCount: 5
  },
  {
    id: '2',
    name: 'Michael Davis, Esq.',
    firm: 'Internal Counsel',
    specialty: 'Compliance & Risk',
    status: 'Active',
    caseCount: 3
  },
  {
    id: '3',
    name: 'Lisa Chen, Esq.',
    firm: 'Chen Legal Group',
    specialty: 'Labor Relations',
    status: 'Invited',
    caseCount: 0
  }
];

export const PulseLegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reviews');

  const getStatusBadge = (status: string) => {
    const colors = {
      'In Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'Completed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'Active': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'Invited': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'Medium': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'High': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[urgency as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <StandardPageLayout
      title="Legal Review"
      subtitle="Privileged review and counsel collaboration"
      badge="Coming Soon"
    >
      <div className="space-y-6">
        {/* Coming Soon Banner */}
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Legal Review Features Coming Soon
                </h3>
                <p className="text-purple-700 dark:text-purple-200">
                  Secure attorney-client privileged review capabilities and external counsel collaboration 
                  are currently in development. Preview the interface below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { key: 'reviews', label: 'Active Reviews', icon: FileText },
            { key: 'counsel', label: 'Counsel Management', icon: UserPlus },
            { key: 'privilege', label: 'Privilege Log', icon: Shield }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2"
                disabled
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Legal Review Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="opacity-75">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Reviews</p>
                  <p className="text-2xl font-bold">{legalReviews.filter(r => r.status === 'In Review').length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned Counsel</p>
                  <p className="text-2xl font-bold">{counselList.filter(c => c.status === 'Active').length}</p>
                </div>
                <Scale className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Privileged Items</p>
                  <p className="text-2xl font-bold">47</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Secure Messages</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Reviews Table */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Legal Reviews</CardTitle>
                <CardDescription>
                  Cases currently under attorney review
                </CardDescription>
              </div>
              <Button disabled>
                <UserPlus className="h-4 w-4 mr-2" />
                Request Review
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Review Type</TableHead>
                  <TableHead>Assigned Counsel</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {legalReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.caseId}</p>
                        <p className="text-sm text-muted-foreground">{review.caseTitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{review.reviewType}</Badge>
                    </TableCell>
                    <TableCell>{review.assignedCounsel}</TableCell>
                    <TableCell>{review.requestedBy}</TableCell>
                    <TableCell>
                      <Badge className={getUrgencyBadge(review.urgency)}>
                        {review.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(review.status)}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(review.estimatedCompletion, 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Counsel Management */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Counsel Management</CardTitle>
                <CardDescription>
                  Manage internal and external legal counsel access
                </CardDescription>
              </div>
              <Button disabled>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Counsel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Counsel</TableHead>
                  <TableHead>Firm/Organization</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Cases</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counselList.map((counsel) => (
                  <TableRow key={counsel.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        {counsel.name}
                      </div>
                    </TableCell>
                    <TableCell>{counsel.firm}</TableCell>
                    <TableCell>{counsel.specialty}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(counsel.status)}>
                        {counsel.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{counsel.caseCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" disabled>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" disabled>
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Legal Collaboration</h3>
            <p className="text-muted-foreground mb-4">
              Enhanced security features including attorney-client privilege protection, 
              encrypted communications, and secure document sharing will be available soon.
            </p>
            <Button disabled>
              Request Early Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};