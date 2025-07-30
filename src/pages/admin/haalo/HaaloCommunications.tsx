import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Bell, 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Users, 
  Eye,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'policy' | 'event';
  status: 'draft' | 'published' | 'scheduled';
  audience: string[];
  publishedAt?: string;
  scheduledFor?: string;
  createdBy: string;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipient: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  readAt?: string;
  channel: 'email' | 'in-app' | 'sms';
}

const HaaloCommunications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const [announcements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'New Security Policy Updates',
      content: 'Please review the updated security policies effective immediately.',
      type: 'policy',
      status: 'published',
      audience: ['all_employees'],
      publishedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin@company.com',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      title: 'System Maintenance Scheduled',
      content: 'System will be down for maintenance on Jan 20th from 2-4 AM.',
      type: 'urgent',
      status: 'scheduled',
      audience: ['all_employees'],
      scheduledFor: '2024-01-20T01:00:00Z',
      createdBy: 'admin@company.com',
      createdAt: '2024-01-15T14:00:00Z'
    }
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Training Reminder',
      message: 'Your annual compliance training is due in 3 days.',
      type: 'warning',
      recipient: 'john.doe@company.com',
      status: 'read',
      sentAt: '2024-01-15T10:30:00Z',
      readAt: '2024-01-15T11:00:00Z',
      channel: 'email'
    },
    {
      id: '2',
      title: 'Welcome Message',
      message: 'Welcome to the HaaLO platform!',
      type: 'info',
      recipient: 'jane.smith@company.com',
      status: 'delivered',
      sentAt: '2024-01-15T09:00:00Z',
      channel: 'in-app'
    }
  ]);

  const getAnnouncementTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'policy': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': case 'sent': case 'delivered': case 'read':
        return 'default';
      case 'draft': case 'failed':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications Center</h1>
          <p className="text-muted-foreground">
            Manage organizational announcements and user notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Announcements</p>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => a.status === 'published').length}
                </p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Posts</p>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifications Sent</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.status !== 'failed').length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((notifications.filter(n => n.status === 'read').length / notifications.length) * 100)}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Organization Announcements</CardTitle>
                <CardDescription>
                  Create and manage company-wide announcements
                </CardDescription>
              </div>
              <Button onClick={() => setAnnouncementDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getAnnouncementTypeIcon(announcement.type)}
                          {announcement.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {announcement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(announcement.status)}>
                          {announcement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {announcement.audience.length} groups
                        </div>
                      </TableCell>
                      <TableCell>
                        {announcement.publishedAt 
                          ? formatDate(announcement.publishedAt)
                          : announcement.scheduledFor 
                          ? `Scheduled: ${formatDate(announcement.scheduledFor)}`
                          : 'Draft'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Notifications</CardTitle>
              <CardDescription>
                Track and manage individual user notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getNotificationTypeIcon(notification.type)}
                          {notification.title}
                        </div>
                      </TableCell>
                      <TableCell>{notification.recipient}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {notification.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(notification.status)}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(notification.sentAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Templates</CardTitle>
              <CardDescription>
                Pre-built templates for common announcements and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Policy Update', type: 'announcement', category: 'HR' },
                  { name: 'System Maintenance', type: 'announcement', category: 'IT' },
                  { name: 'Training Reminder', type: 'notification', category: 'Learning' },
                  { name: 'Welcome Message', type: 'notification', category: 'Onboarding' },
                  { name: 'Security Alert', type: 'announcement', category: 'Security' },
                  { name: 'Holiday Notice', type: 'announcement', category: 'HR' }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.type === 'announcement' ? 'Company-wide announcement' : 'User notification'}
                      </p>
                      <Button size="sm" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure default notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="in-app">In-App</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Auto-delete read notifications after (days)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Announcement Settings</CardTitle>
                <CardDescription>
                  Configure announcement defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="managers">Managers Only</SelectItem>
                      <SelectItem value="hr">HR Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Auto-archive announcements after (days)</Label>
                  <Input type="number" defaultValue="90" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Announcement Dialog */}
      <Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Create a new company-wide announcement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input placeholder="Enter announcement title" />
            </div>
            <div>
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select announcement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea placeholder="Enter announcement content" rows={6} />
            </div>
            <div>
              <Label>Audience</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="managers">Managers</SelectItem>
                  <SelectItem value="hr">HR Department</SelectItem>
                  <SelectItem value="it">IT Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementDialog(false)}>
              Cancel
            </Button>
            <Button>Save as Draft</Button>
            <Button>Publish Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HaaloCommunications;