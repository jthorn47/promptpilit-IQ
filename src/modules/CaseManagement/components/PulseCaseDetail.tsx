import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Edit, 
  User, 
  Building, 
  Mail, 
  Calendar, 
  Eye,
  EyeOff,
  Plus,
  FileText,
  MessageSquare,
  Upload
} from 'lucide-react';
import { formatDistance, format } from 'date-fns';
import { Case, CaseActivity, CaseFile } from '../types';

import { PulseCaseForm } from './PulseCaseForm';
import { toast } from 'sonner';

interface PulseCaseDetailProps {
  case_: Case;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseUpdate?: () => void;
}

export const PulseCaseDetail = ({ case_, open, onOpenChange, onCaseUpdate }: PulseCaseDetailProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newEmailContent, setNewEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailTo, setEmailTo] = useState('');

  const statusColors = {
    open: 'bg-blue-500/10 text-blue-600 border-blue-200',
    in_progress: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    waiting: 'bg-orange-500/10 text-orange-600 border-orange-200',
    closed: 'bg-green-500/10 text-green-600 border-green-200',
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-600 border-red-200',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    low: 'bg-green-500/10 text-green-600 border-green-200',
  };

  useEffect(() => {
    if (open && case_) {
      fetchCaseActivities();
      fetchCaseFiles();
    }
  }, [open, case_]);

  const fetchCaseActivities = async () => {
    try {
      // Activities will be loaded from the case activity data
      // For now, we'll use the case_ prop which should contain activity data
      // Mock activities since activity property doesn't exist on Case type
      setActivities([]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchCaseFiles = async () => {
    try {
      // Files functionality would need to be implemented via edge functions
      // For now, set empty array
      setFiles([]);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      // This would need to be implemented via the addNote edge function
      console.log('Add note functionality needs edge function implementation');
      setNewNote('');
      await fetchCaseActivities();
      toast.success('Note functionality coming soon');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmailThread = async () => {
    if (!newEmailContent.trim() || !emailSubject.trim()) return;

    try {
      setLoading(true);
      // This would need to be implemented via an edge function
      console.log('Email thread functionality needs edge function implementation');
      setNewEmailContent('');
      setEmailSubject('');
      setEmailTo('');
      await fetchCaseActivities();
      toast.success('Email functionality coming soon');
    } catch (error) {
      toast.error('Failed to add email thread');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'status_change': return <Clock className="h-4 w-4" />;
      case 'assignment_change': return <User className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'note': return 'text-blue-600';
      case 'email': return 'text-green-600';
      case 'file': return 'text-purple-600';
      case 'status_change': return 'text-orange-600';
      case 'assignment_change': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-2xl">{case_.title}</DialogTitle>
                <div className="flex items-center gap-4">
                  <Badge className={statusColors[case_.status]}>
                    {case_.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={priorityColors[case_.priority]}>
                    {case_.priority} priority
                  </Badge>
                  <Badge variant="outline">
                    {case_.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={case_.visibility === 'client_viewable' ? 'default' : 'secondary'}>
                    {case_.visibility === 'client_viewable' ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                    {case_.visibility === 'client_viewable' ? 'Client Viewable' : 'Internal Only'}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Case Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {case_.company_settings?.company_name && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{case_.company_settings.company_name}</span>
                </div>
              )}
              
              {case_.related_contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{case_.related_contact_email}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created {formatDistance(new Date(case_.created_at), new Date(), { addSuffix: true })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{case_.actual_hours || 0}h logged</span>
              </div>
            </div>

            {/* Tags */}
            {case_.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {case_.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="timeline">
                  Timeline ({activities.length})
                </TabsTrigger>
                <TabsTrigger value="files">
                  Files ({files.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {case_.description}
                  </p>
                </Card>

                {case_.internal_notes && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Internal Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {case_.internal_notes}
                    </p>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Assignment</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Assigned User:</span>
                        <span className="ml-2">{case_.assigned_to || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned Team:</span>
                        <span className="ml-2">{case_.assigned_team || 'None'}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Time Tracking</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estimated:</span>
                        <span className="ml-2">{case_.estimated_hours || 0}h</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="ml-2">{case_.actual_hours || 0}h</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                {/* Add Note */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Add Internal Note</h3>
                  <div className="space-y-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Enter your internal note..."
                      rows={3}
                    />
                    <Button onClick={handleAddNote} disabled={loading || !newNote.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </Card>

                {/* Add Email Thread */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Add Email Thread Entry</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email-to">To</Label>
                        <Input
                          id="email-to"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="recipient@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-subject">Subject</Label>
                        <Input
                          id="email-subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Email subject"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email-content">Content</Label>
                      <Textarea
                        id="email-content"
                        value={newEmailContent}
                        onChange={(e) => setNewEmailContent(e.target.value)}
                        placeholder="Email content..."
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={handleAddEmailThread} 
                      disabled={loading || !newEmailContent.trim() || !emailSubject.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Email Thread
                    </Button>
                  </div>
                </Card>

                {/* Activity Timeline */}
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity yet
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.activity_type)}`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium capitalize">
                                {activity.activity_type.replace('_', ' ')}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {formatDistance(new Date(activity.created_at), new Date(), { addSuffix: true })}
                              </span>
                            </div>
                            
                            {activity.activity_type === 'email' && activity.metadata && (
                              <div className="mb-2 text-sm text-muted-foreground">
                                <div>To: {activity.metadata.to}</div>
                                <div>Subject: {activity.metadata.subject}</div>
                              </div>
                            )}
                            
                            <p className="text-sm whitespace-pre-wrap">
                              {activity.content}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <Card className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    File upload functionality coming soon...
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Case Form */}
      <PulseCaseForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        case_={case_}
        onSuccess={() => {
          onCaseUpdate?.();
          setShowEditForm(false);
        }}
      />
    </>
  );
};