import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  ExternalLink,
  MessageSquare,
  Calendar,
  Loader2,
  Link,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePulseIntegration, PulseCase, CaseNote, CaseTask } from '@/hooks/usePulseIntegration';
import { toast } from 'sonner';

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
}

interface PulseSidePanelProps {
  email: Email;
  isOpen: boolean;
  onClose: () => void;
}

export const PulseSidePanel = ({ email, isOpen, onClose }: PulseSidePanelProps) => {
  const {
    searchCases,
    createCase,
    linkEmailToCase,
    getCaseDetails,
    getCaseNotes,
    getCaseTasks,
    createTaskFromEmail,
    addCaseNote,
    getEmailCaseLink,
    isLoading,
    error
  } = usePulseIntegration();

  const [linkedCase, setLinkedCase] = useState<PulseCase | null>(null);
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([]);
  const [caseTasks, setCaseTasks] = useState<CaseTask[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<PulseCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState('');

  // Form states
  const [caseForm, setCaseForm] = useState({
    title: '',
    type: 'general_support',
    priority: 'medium',
    description: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    if (isOpen && email.id) {
      checkEmailCaseLink();
    }
  }, [isOpen, email.id]);

  useEffect(() => {
    if (linkedCase) {
      loadCaseData();
    }
  }, [linkedCase]);

  const checkEmailCaseLink = async () => {
    const link = await getEmailCaseLink(email.id);
    if (link) {
      const caseDetails = await getCaseDetails(link.case_id);
      if (caseDetails) {
        setLinkedCase(caseDetails);
      }
    }
  };

  const loadCaseData = async () => {
    if (!linkedCase) return;

    const [notes, tasks] = await Promise.all([
      getCaseNotes(linkedCase.id),
      getCaseTasks(linkedCase.id)
    ]);

    setCaseNotes(notes);
    setCaseTasks(tasks);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await searchCases(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleLinkToCase = async (caseId: string) => {
    const success = await linkEmailToCase(email.id, caseId);
    if (success) {
      const caseDetails = await getCaseDetails(caseId);
      if (caseDetails) {
        setLinkedCase(caseDetails);
        setShowLinkDialog(false);
        toast.success('Email linked to case successfully');
      }
    } else {
      toast.error('Failed to link email to case');
    }
  };

  const handleCreateCase = async () => {
    if (!caseForm.title.trim()) {
      toast.error('Case title is required');
      return;
    }

    const newCase = await createCase(
      caseForm.title,
      caseForm.description,
      caseForm.priority,
      email.senderEmail
    );

    if (newCase) {
      const success = await linkEmailToCase(email.id, newCase.id);
      if (success) {
        setLinkedCase(newCase);
        setShowCreateDialog(false);
        setCaseForm({ title: '', type: 'general_support', priority: 'medium', description: '' });
        toast.success('Case created and linked successfully');
      }
    } else {
      toast.error('Failed to create case');
    }
  };

  const handleCreateTask = async () => {
    if (!linkedCase || !taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const newTask = await createTaskFromEmail(
      linkedCase.id,
      taskForm.title,
      taskForm.description,
      taskForm.priority,
      taskForm.dueDate || undefined
    );

    if (newTask) {
      setShowCreateTaskDialog(false);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      loadCaseData(); // Refresh case data
      toast.success('Task created successfully');
    } else {
      toast.error('Failed to create task');
    }
  };

  const handleAddNote = async () => {
    if (!linkedCase || !newNote.trim()) {
      toast.error('Note content is required');
      return;
    }

    const success = await addCaseNote(linkedCase.id, newNote);
    if (success) {
      setNewNote('');
      setShowAddNoteDialog(false);
      loadCaseData(); // Refresh case data
      toast.success('Note added successfully');
    } else {
      toast.error('Failed to add note');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'waiting': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg z-50 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Pulse CMS</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* No Case Linked */}
          {!linkedCase && !isLoading && (
            <Card className="p-4 border-dashed">
              <div className="text-center py-6">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Case Linked</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Link this email to an existing case or create a new one.
                </p>
                <div className="flex flex-col gap-2">
                  <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Link className="w-4 h-4 mr-2" />
                        Link to Case
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Link to Existing Case</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search cases..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {searchResults.map((case_) => (
                            <Card key={case_.id} className="p-3 cursor-pointer hover:bg-muted/50" onClick={() => handleLinkToCase(case_.id)}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{case_.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={cn("text-xs", getPriorityColor(case_.priority))}>
                                      {case_.priority}
                                    </Badge>
                                    <Badge variant="outline" className={cn("text-xs", getStatusColor(case_.status))}>
                                      {case_.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Case
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Case</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={caseForm.title}
                            onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                            placeholder={`Re: ${email.subject}`}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select value={caseForm.type} onValueChange={(value) => setCaseForm({ ...caseForm, type: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hr">HR</SelectItem>
                              <SelectItem value="payroll">Payroll</SelectItem>
                              <SelectItem value="compliance">Compliance</SelectItem>
                              <SelectItem value="safety">Safety</SelectItem>
                              <SelectItem value="onboarding">Onboarding</SelectItem>
                              <SelectItem value="general_support">General Support</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Select value={caseForm.priority} onValueChange={(value) => setCaseForm({ ...caseForm, priority: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={caseForm.description}
                            onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                            placeholder="Case description..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                          <Button onClick={handleCreateCase}>Create Case</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          )}

          {/* Linked Case Display */}
          {linkedCase && (
            <div className="space-y-4">
              {/* Case Header */}
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{linkedCase.title}</h3>
                    <p className="text-sm text-muted-foreground">#{linkedCase.id.slice(0, 8)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/pulse/cases/${linkedCase.id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(linkedCase.priority))}>
                    {linkedCase.priority}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(linkedCase.status))}>
                    {linkedCase.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {linkedCase.type}
                  </Badge>
                </div>

                {linkedCase.assigned_to && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Assigned to {linkedCase.assigned_to}</span>
                  </div>
                )}
              </Card>

              {/* Case Notes */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Latest Notes</h4>
                  <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Case Note</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note about this email..."
                          rows={4}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>Cancel</Button>
                          <Button onClick={handleAddNote}>Add Note</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2">
                  {caseNotes.length > 0 ? (
                    caseNotes.map((note) => (
                      <div key={note.id} className="p-2 bg-muted/50 rounded text-sm">
                        <p className="mb-1">{note.note}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{note.user_id}</span>
                          <span>•</span>
                          <span>{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h4 className="font-medium text-sm mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Task from Email
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Task from Email</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            placeholder={`Follow up: ${email.subject}`}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            placeholder={`Email from ${email.sender}: ${email.preview}`}
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Due Date</label>
                          <Input
                            type="date"
                            value={taskForm.dueDate}
                            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>Cancel</Button>
                          <Button onClick={handleCreateTask}>Create Task</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(`/pulse/cases/${linkedCase.id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Pulse
                  </Button>
                </div>
              </Card>

              {/* Case Tasks */}
              {caseTasks.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium text-sm mb-3">Recent Tasks</h4>
                  <div className="space-y-2">
                    {caseTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};