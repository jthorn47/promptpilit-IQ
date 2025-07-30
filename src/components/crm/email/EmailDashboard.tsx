import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Send, 
  Inbox, 
  Settings, 
  Plus, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  Star,
  CheckCircle,
  Sun,
  Moon,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useCRMEmail } from '@/hooks/useCRMEmail';
import { EmailComposer } from './EmailComposer';
import { EmailList } from './EmailList';
import { EmailSettings } from './EmailSettings';
import { ProfileEmailButton } from '@/components/email/ProfileEmailButton';
import { useTheme } from 'next-themes';
import { AITriageToggle } from './ai/AITriageToggle';
import { EmailProductTour } from '@/components/email/EmailProductTour';

export function EmailDashboard() {
  const { 
    connection, 
    messages, 
    settings, 
    loading, 
    isConnecting,
    connectMicrosoft365,
    disconnectMicrosoft365,
    isConnected,
    canConnect,
    syncEmails
  } = useCRMEmail();
  
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('today');
  const [showComposer, setShowComposer] = useState(false);
  const [aiTriageEnabled, setAiTriageEnabled] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Smart email grouping with fallback properties
  const smartGroups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMessages = messages.filter(m => {
      const msgDate = new Date(m.received_at || m.sent_at || m.created_at);
      msgDate.setHours(0, 0, 0, 0);
      return msgDate.getTime() === today.getTime();
    });

    const unreadMessages = messages.filter(m => !m.is_read && m.message_type === 'received');
    // Use fallback for missing properties
    const starredMessages = messages.filter(m => (m as any).is_starred || false);
    const doneMessages = messages.filter(m => m.is_read);

    return {
      today: todayMessages,
      unread: unreadMessages,
      starred: starredMessages,
      done: doneMessages
    };
  }, [messages]);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Zap; // zen mode
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'zen'];
    const currentIndex = themes.indexOf(theme || 'light');
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const sections = [
    { id: 'today', label: 'Today', icon: Clock, count: smartGroups.today.length },
    { id: 'unread', label: 'Unread', icon: Mail, count: smartGroups.unread.length },
    { id: 'starred', label: 'Starred', icon: Star, count: smartGroups.starred.length },
    { id: 'done', label: 'Done', icon: CheckCircle, count: smartGroups.done.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading email dashboard...</p>
        </div>
      </div>
    );
  }

  // Domain restriction check
  if (!canConnect) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            CRM Email is only available for @easeworks.com accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              This email feature is exclusively for Easeworks team members. 
              Please contact your administrator if you need access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Frameless Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium tracking-tight">Inbox</h1>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">{connection?.email_address}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* AI Triage Toggle */}
            {isConnected && (
              <AITriageToggle 
                enabled={aiTriageEnabled}
                onToggle={setAiTriageEnabled}
              />
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              className="h-8 w-8 p-0"
            >
              {React.createElement(getThemeIcon(), { className: "h-4 w-4" })}
            </Button>
            
            {/* Tour Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTour(true)}
              className="h-8 w-8 p-0"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            
            {isConnected ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => syncEmails(true)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => setShowComposer(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </>
            ) : (
              <Button 
                onClick={connectMicrosoft365} 
                disabled={isConnecting}
                size="sm"
              >
                {isConnecting ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {isConnected ? (
        <div className="flex flex-col">
          {/* Section Navigation */}
          <div className="border-b border-border/40 px-6 py-4">
            <div className="flex items-center gap-6">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                    {section.count > 0 && (
                      <Badge 
                        variant={isActive ? "default" : "secondary"} 
                        className="h-5 px-1.5 text-xs"
                      >
                        {section.count}
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {sections.find(s => s.id === activeSection)?.label}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {smartGroups[activeSection as keyof typeof smartGroups]?.length || 0} messages
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {activeSection === 'today' && (
                    <EmailList 
                      messages={smartGroups.today} 
                      type="inbox"
                      emptyMessage="No emails today"
                      aiTriageEnabled={aiTriageEnabled}
                    />
                  )}
                  {activeSection === 'unread' && (
                    <EmailList 
                      messages={smartGroups.unread} 
                      type="inbox"
                      emptyMessage="All caught up! No unread messages"
                      aiTriageEnabled={aiTriageEnabled}
                    />
                  )}
                  {activeSection === 'starred' && (
                    <EmailList 
                      messages={smartGroups.starred} 
                      type="inbox"
                      emptyMessage="No starred messages yet"
                      aiTriageEnabled={aiTriageEnabled}
                    />
                  )}
                  {activeSection === 'done' && (
                    <EmailList 
                      messages={smartGroups.done} 
                      type="inbox"
                      emptyMessage="No completed messages"
                      aiTriageEnabled={aiTriageEnabled}
                    />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Mail className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Connect your email</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connect your @easeworks.com Microsoft 365 account to start managing emails with a beautiful, modern interface.
              </p>
            </div>
            <Button 
              onClick={connectMicrosoft365} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Connect Microsoft 365
                </>
              )}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Email Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <EmailComposer
            open={showComposer}
            onClose={() => setShowComposer(false)}
          />
        )}
      </AnimatePresence>

      {/* Product Tour */}
      {showTour && (
        <EmailProductTour onClose={() => setShowTour(false)} />
      )}
    </div>
  );
}