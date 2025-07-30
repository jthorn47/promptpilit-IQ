import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Star, 
  Clock, 
  Mail, 
  CheckCircle2, 
  Settings, 
  Sun, 
  Moon, 
  Eye,
  ArrowLeft,
  Trash2,
  Archive,
  Reply,
  Forward,
  Building2,
  FileText,
  TrendingUp,
  DollarSign,
  Inbox,
  Send,
  Brain,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCRMEmail, EmailMessage } from '@/hooks/useCRMEmail';
import { useToast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark' | 'zen';
type Section = 'today' | 'unread' | 'starred' | 'done';
type SidebarTab = 'inbox' | 'sent' | 'drafts' | 'settings';

export const CRMInboxPage = () => {
  const { 
    connection, 
    messages, 
    settings, 
    loading, 
    isConnecting,
    isConnected,
    canConnect,
    connectMicrosoft365,
    disconnectMicrosoft365,
    syncEmails,
    deleteEmail,
    archiveEmail,
    markAsRead,
    updateSettings
  } = useCRMEmail();

  console.log('🔍 CRM Email Debug - Messages loaded:', messages?.length || 0);
  console.log('🔍 CRM Email Debug - Loading state:', loading);
  console.log('🔍 CRM Email Debug - Connection state:', connection?.connection_status);
  console.log('🔍 CRM Email Debug - Is connected:', isConnected);

  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>('light');
  const [activeSection, setActiveSection] = useState<Section>('unread');
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<EmailMessage[]>([]);

  // Filter messages based on section and search
  useEffect(() => {
    let filtered = messages;

    // Apply section filter
    switch (activeSection) {
      case 'today':
        const today = new Date().toDateString();
        filtered = messages.filter(msg => 
          !msg.is_read && new Date(msg.created_at).toDateString() === today
        );
        break;
      case 'unread':
        filtered = messages.filter(msg => !msg.is_read);
        break;
      case 'starred':
        // Note: We'd need to add a starred field to the database
        filtered = messages.filter(msg => msg.message_type === 'starred');
        break;
      case 'done':
        filtered = messages.filter(msg => msg.is_read);
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.body_preview?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  }, [messages, activeSection, searchQuery]);

  const sections = [
    { 
      id: 'today' as Section, 
      label: 'Today', 
      icon: Clock, 
      count: messages.filter(m => !m.is_read && new Date(m.created_at).toDateString() === new Date().toDateString()).length 
    },
    { id: 'unread' as Section, label: 'Unread', icon: Mail, count: messages.filter(m => !m.is_read).length },
    { id: 'starred' as Section, label: 'Starred', icon: Star, count: messages.filter(m => m.message_type === 'starred').length },
    { id: 'done' as Section, label: 'Done', icon: CheckCircle2, count: messages.filter(m => m.is_read).length }
  ];

    const sidebarTabs = [
    { id: 'inbox' as SidebarTab, label: 'Inbox', icon: Inbox, count: messages.filter(m => m.message_type === 'received' && !m.is_read).length },
    { id: 'sent' as SidebarTab, label: 'Sent', icon: Send, count: messages.filter(m => m.message_type === 'sent' || m.is_sent).length },
    { id: 'drafts' as SidebarTab, label: 'Drafts', icon: FileText, count: 0 },
    { id: 'settings' as SidebarTab, label: 'Settings', icon: Settings, count: 0 }
  ];

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'zen'];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  };

  const handleEmailClick = async (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      await markAsRead(email.id);
    }
  };

  const handleDelete = async (messageId: string) => {
    await deleteEmail(messageId);
    if (selectedEmail?.id === messageId) {
      setSelectedEmail(null);
    }
  };

  const handleArchive = async (messageId: string) => {
    await archiveEmail(messageId);
    if (selectedEmail?.id === messageId) {
      setSelectedEmail(null);
    }
  };

  const handleSync = async () => {
    if (isConnected) {
      await syncEmails(true); // Show toast for manual sync
    } else {
      toast({
        title: "Not Connected",
        description: "Please connect to Microsoft 365 first",
        variant: "destructive"
      });
    }
  };

  const renderMainContent = () => {
    switch (activeSidebarTab) {
      case 'sent':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Sent Messages</h2>
            <div className="space-y-3">
              {messages.filter(m => m.message_type === 'sent' || m.is_sent).map(message => (
                <EmailCard 
                  key={message.id} 
                  message={message} 
                  onClick={() => handleEmailClick(message)} 
                  onDelete={() => handleDelete(message.id)}
                  onArchive={() => handleArchive(message.id)}
                />
              ))}
              {messages.filter(m => m.message_type === 'sent' || m.is_sent).length === 0 && (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-light">No sent emails found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Emails you send will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 'drafts':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Drafts</h2>
            <p className="text-muted-foreground">Draft messages will appear here.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Email Settings</h2>
            
            {/* Connection Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Microsoft 365 Connection</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status: {connection?.connection_status || 'Not connected'}</p>
                    {connection?.email_address && (
                      <p className="text-sm text-muted-foreground">{connection.email_address}</p>
                    )}
                  </div>
                  {isConnected ? (
                    <Button onClick={disconnectMicrosoft365} variant="outline">
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      onClick={connectMicrosoft365} 
                      disabled={!canConnect || isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
                {!canConnect && (
                  <p className="text-sm text-red-600">
                    Only @easeworks.com email addresses can connect to Microsoft 365
                  </p>
                )}
              </div>
            </Card>

            {/* Email Settings */}
            {settings && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Email Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-sync">Auto-sync emails</Label>
                    <Switch 
                      id="auto-sync"
                      checked={settings.auto_sync_enabled}
                      onCheckedChange={(checked) => updateSettings({ auto_sync_enabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Email notifications</Label>
                    <Switch 
                      id="notifications"
                      checked={settings.enable_notifications}
                      onCheckedChange={(checked) => updateSettings({ enable_notifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tracking">Email tracking</Label>
                    <Switch 
                      id="tracking"
                      checked={settings.enable_tracking}
                      onCheckedChange={(checked) => updateSettings({ enable_tracking: checked })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sync-frequency">Sync frequency (minutes)</Label>
                    <Input 
                      id="sync-frequency"
                      type="number"
                      value={settings.sync_frequency_minutes}
                      onChange={(e) => updateSettings({ sync_frequency_minutes: parseInt(e.target.value) })}
                      min={5}
                      max={1440}
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        );
      default:
        return renderInboxContent();
    }
  };

  const renderInboxContent = () => {
    if (selectedEmail) {
      return (
        <div className="flex flex-col h-full">
          {/* Email Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmail(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                <p className="text-sm text-muted-foreground">
                  From: {selectedEmail.sender_name} &lt;{selectedEmail.sender_email}&gt;
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleArchive(selectedEmail.id)}>
                  <Archive className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(selectedEmail.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Email Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: selectedEmail.body_content || selectedEmail.body_preview || 'No content available'
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-hidden">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sections */}
        <div className="overflow-hidden">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {sections.map(section => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                onClick={() => setActiveSection(section.id)}
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap shrink-0 text-xs px-2 py-1 h-8"
              >
                <section.icon className="w-3 h-3" />
                <span className="hidden xs:inline">{section.label}</span>
                <span className="xs:hidden">{section.label.charAt(0)}</span>
                {section.count > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {section.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading emails...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-light">No emails found</p>
              {!isConnected && (
                <p className="text-sm text-muted-foreground mt-2">
                  Connect to Microsoft 365 to sync your emails
                </p>
              )}
            </div>
          ) : (
            filteredMessages.map(message => (
              <EmailCard 
                key={message.id} 
                message={message} 
                onClick={() => handleEmailClick(message)}
                onDelete={() => handleDelete(message.id)}
                onArchive={() => handleArchive(message.id)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 ease-out overflow-hidden",
      theme === 'light' && "bg-background text-foreground",
      theme === 'dark' && "bg-background text-foreground dark",
      theme === 'zen' && "bg-gradient-to-br from-slate-50 to-stone-100 text-slate-800"
    )}>
      {/* Mobile Top Sidebar - visible on mobile only */}
      <div className="md:hidden bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        {/* Mobile Header */}
        <div className="px-4 py-3 border-b border-border">
          <h1 className="text-lg font-semibold truncate">Halo Mail</h1>
          <p className="text-xs text-muted-foreground truncate">
            {isConnected ? 'Connected' : 'Not connected'}
          </p>
        </div>
        
        {/* Mobile Navigation - horizontal scroll */}
        <div className="px-4 py-2 overflow-hidden">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {sidebarTabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeSidebarTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveSidebarTab(tab.id)}
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap shrink-0 text-xs px-2 py-1 h-8"
              >
                <tab.icon className="w-3 h-3" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.charAt(0)}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex md:min-h-screen overflow-hidden">
        {/* Desktop Left Sidebar - hidden on mobile */}
        <div className="hidden md:flex w-64 bg-background/95 backdrop-blur-sm border-r border-border flex-col shadow-sm">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-semibold">Halo Mail</h1>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarTabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeSidebarTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveSidebarTab(tab.id)}
                className="w-full justify-start text-left"
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm z-10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="border-l border-border pl-3">
                <h2 className="text-2xl font-semibold">
                  {selectedEmail ? selectedEmail.subject : 
                   activeSidebarTab === 'sent' ? 'Sent Messages' :
                   activeSidebarTab === 'drafts' ? 'Drafts' : 
                   activeSidebarTab === 'settings' ? 'Settings' : 'Inbox'}
                </h2>
                {!selectedEmail && activeSidebarTab === 'inbox' && (
                  <p className="text-sm text-muted-foreground">
                    {filteredMessages.length} conversations
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                disabled={!isConnected}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Email Card Component
const EmailCard = ({ 
  message, 
  onClick, 
  onDelete, 
  onArchive 
}: { 
  message: EmailMessage; 
  onClick: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md relative",
        !message.is_read && "border-l-4 border-l-primary bg-muted/30"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between" onClick={onClick}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm truncate">
              {message.sender_name || message.sender_email}
            </p>
            {!message.is_read && (
              <Badge variant="secondary" className="text-xs">New</Badge>
            )}
          </div>
          <h3 className="font-semibold mb-1 truncate">
            {message.subject || 'No subject'}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {message.body_preview || 'No preview available'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(message.sent_at || message.received_at || message.created_at).toLocaleString()}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className={cn(
          "flex gap-1 ml-4 transition-all duration-200 bg-background/80 backdrop-blur-sm rounded-md p-1",
          showActions ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-2"
        )}>
          {onArchive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
              onClick={(e) => {
                console.log('🗂️ Archive button clicked for message:', message.id);
                e.stopPropagation();
                onArchive();
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              onClick={(e) => {
                console.log('🗑️ Delete button clicked for message:', message.id);
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};