import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  Plus,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCRMMatching } from '@/hooks/useCRMMatching';
import { toast } from 'sonner';

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
}

interface CRMSidePanelProps {
  email: Email;
  isOpen: boolean;
  onClose: () => void;
}

export const CRMSidePanel = ({ email, isOpen, onClose }: CRMSidePanelProps) => {
  const { matchEmailToCRM, addCRMNote, logCRMActivity, isLoading, error } = useCRMMatching();
  const [crmData, setCrmData] = useState<any>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (isOpen && email.senderEmail) {
      handleCRMMatch();
    }
  }, [isOpen, email.senderEmail]);

  const handleCRMMatch = async () => {
    try {
      const result = await matchEmailToCRM(email.senderEmail, email.sender);
      setCrmData(result);
    } catch (err) {
      console.error('CRM matching error:', err);
      toast.error('Failed to load CRM data');
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !crmData?.contact?.id) return;

    setIsAddingNote(true);
    try {
      const fullNote = `Email: ${email.subject}\n\n${noteText}`;
      await addCRMNote(crmData.contact.id, fullNote);
      
      toast.success('Note added successfully');
      setNoteText('');
      setShowAddNote(false);
      
      // Refresh CRM data
      handleCRMMatch();
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleLogActivity = async (activityType: string) => {
    if (!crmData?.contact?.id) return;

    try {
      await logCRMActivity(
        crmData.contact.id,
        activityType,
        `Email: ${email.subject}`,
        `Email communication with ${email.sender} regarding: ${email.subject}`
      );
      
      toast.success('Activity logged successfully');
      
      // Refresh CRM data
      handleCRMMatch();
    } catch (err) {
      toast.error('Failed to log activity');
    }
  };

  const handleViewInCRM = () => {
    if (crmData?.contact?.id) {
      // Navigate to CRM contact view
      window.open(`/crm/contacts/${crmData.contact.id}`, '_blank');
    } else if (crmData?.lead?.id) {
      // Navigate to CRM lead view
      window.open(`/crm/leads/${crmData.lead.id}`, '_blank');
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
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">CRM Context</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading CRM data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* No Match State */}
          {!isLoading && !error && crmData?.matchType === 'none' && (
            <Card className="p-4 border-dashed">
              <div className="text-center py-6">
                <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No CRM Match Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This email address is not in your CRM system.
                </p>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to CRM
                </Button>
              </div>
            </Card>
          )}

          {/* CRM Data Display */}
          {!isLoading && !error && crmData?.matchType !== 'none' && (
            <div className="space-y-4">
              {/* Match Type Badge */}
              <div className="flex items-center gap-2">
                <Badge variant={crmData.matchType === 'email' ? 'default' : 'secondary'}>
                  {crmData.matchType === 'email' ? 'Exact Match' : 'Domain Match'}
                </Badge>
                {crmData.matchType === 'domain' && (
                  <span className="text-xs text-muted-foreground">
                    Matched by domain
                  </span>
                )}
              </div>

              {/* Contact/Lead Information */}
              {(crmData.contact || crmData.lead) && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {crmData.contact ? 
                          `${crmData.contact.first_name} ${crmData.contact.last_name}` :
                          `${crmData.lead.first_name} ${crmData.lead.last_name}`
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {crmData.contact?.job_title || crmData.lead?.job_title || 'Contact'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {(crmData.contact?.email || crmData.lead?.email) && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{crmData.contact?.email || crmData.lead?.email}</span>
                          </div>
                        )}
                        {(crmData.contact?.phone || crmData.lead?.phone) && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{crmData.contact?.phone || crmData.lead?.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Company Information */}
              {crmData.company && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{crmData.company.company_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {crmData.company.lifecycle_stage || 'Company'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Deals */}
              {crmData.deals && crmData.deals.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Active Deals
                  </h4>
                  <div className="space-y-2">
                    {crmData.deals.slice(0, 3).map((deal: any) => (
                      <div key={deal.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{deal.title}</p>
                          <p className="text-xs text-muted-foreground">{deal.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{deal.currency} {deal.value}</p>
                          {deal.probability && (
                            <p className="text-xs text-muted-foreground">{deal.probability}%</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Activities */}
              {crmData.activities && crmData.activities.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {crmData.activities.slice(0, 3).map((activity: any) => (
                      <div key={activity.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.subject}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={handleViewInCRM}
                  className="w-full"
                  disabled={!crmData.contact && !crmData.lead}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in CRM
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddNote(true)}
                    className="flex-1"
                    disabled={!crmData.contact && !crmData.lead}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleLogActivity('email')}
                    className="flex-1"
                    disabled={!crmData.contact && !crmData.lead}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </div>
              </div>

              {/* Add Note Form */}
              {showAddNote && (
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-3">Add Note</h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter your note about this email interaction..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddNote}
                        disabled={!noteText.trim() || isAddingNote}
                        size="sm"
                      >
                        {isAddingNote ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add Note
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddNote(false);
                          setNoteText('');
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
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