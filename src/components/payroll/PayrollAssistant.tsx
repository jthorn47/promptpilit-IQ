import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Lightbulb,
  History,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
  actions?: AssistantAction[];
}

interface AssistantAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

interface PayrollIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  employee?: string;
  payPeriod?: string;
}

const SAMPLE_PROMPTS = [
  "Why did John's net pay change this period?",
  "How do I process an off-cycle payroll?",
  "Show me all pending payroll exceptions",
  "Walk me through tax setup for new employee",
  "What's the status of this week's ACH batch?",
  "How do I correct a payroll calculation error?"
];

const MOCK_ISSUES: PayrollIssue[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Overtime calculation variance',
    description: 'Employee #001234 has 45 hours with unusual overtime rate',
    employee: 'John Smith',
    payPeriod: '2024-01-15'
  },
  {
    id: '2',
    type: 'error',
    title: 'Missing tax withholding',
    description: 'Federal tax not calculated for new employee',
    employee: 'Jane Doe',
    payPeriod: '2024-01-15'
  },
  {
    id: '3',
    type: 'info',
    title: 'New employee setup complete',
    description: 'All payroll profiles configured successfully',
    employee: 'Mike Johnson',
    payPeriod: '2024-01-15'
  }
];

export const PayrollAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHelpLog, setShowHelpLog] = useState(false);
  const [contextIssues] = useState<PayrollIssue[]>(MOCK_ISSUES);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('/payroll/processing')) return 'Payroll Processing';
    if (path.includes('/payroll/dashboard')) return 'Payroll Dashboard';
    if (path.includes('/payroll/ach-processing')) return 'ACH Processing';
    if (path.includes('/payroll/reports')) return 'Payroll Reports';
    if (path.includes('/payroll/')) return 'Payroll System';
    return 'General';
  };

  const simulateTyping = async (response: string, context?: string, actions?: AssistantAction[]) => {
    setIsTyping(true);
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    setIsTyping(false);
    
    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      context,
      actions
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Generate contextual response
    const pageContext = getPageContext();
    let response = '';
    let actions: AssistantAction[] = [];

    if (message.toLowerCase().includes('john') && message.toLowerCase().includes('pay')) {
      response = `I found that John Smith's net pay changed due to overtime calculation adjustments in the current pay period. His base pay remained $25/hour, but he worked 45 hours (5 hours overtime at 1.5x rate). The variance is due to a retroactive overtime policy update.

**Details:**
• Base Hours: 40 × $25.00 = $1,000.00
• Overtime: 5 × $37.50 = $187.50
• Gross Pay: $1,187.50
• Net Change: +$187.50 from previous period`;

      actions = [
        {
          label: 'View John\'s Pay Details',
          action: () => console.log('Navigate to employee pay details'),
        },
        {
          label: 'Review Overtime Rules',
          action: () => console.log('Open overtime configuration'),
          variant: 'outline'
        }
      ];
    } else if (message.toLowerCase().includes('off-cycle') || message.toLowerCase().includes('off cycle')) {
      response = `Here's how to process an off-cycle payroll run:

**Step 1:** Navigate to Payroll Processing
**Step 2:** Click "New Off-Cycle Run"
**Step 3:** Select employees and date range
**Step 4:** Choose reason (bonus, correction, missed hours)
**Step 5:** Review tax calculations
**Step 6:** Generate pay stubs and ACH batch

Would you like me to guide you through this process?`;

      actions = [
        {
          label: 'Start Off-Cycle Run',
          action: () => console.log('Navigate to off-cycle processing'),
        },
        {
          label: 'Learn More',
          action: () => console.log('Open documentation'),
          variant: 'outline'
        }
      ];
    } else if (message.toLowerCase().includes('exception') || message.toLowerCase().includes('pending')) {
      response = `I found ${contextIssues.length} items requiring attention:

${contextIssues.map(issue => `• **${issue.title}** (${issue.employee}): ${issue.description}`).join('\n')}

The most critical item is the missing tax withholding for Jane Doe - this needs immediate attention before processing.`;

      actions = [
        {
          label: 'View All Exceptions',
          action: () => console.log('Navigate to exceptions'),
        },
        {
          label: 'Fix Tax Issue',
          action: () => console.log('Open tax configuration'),
          variant: 'destructive'
        }
      ];
    } else {
      response = `I understand you're asking about "${message}" in the context of ${pageContext}. Based on your current payroll data and system configuration, I can help you with specific payroll operations, employee questions, or process guidance.

Try asking me about:
• Specific employee pay calculations
• Payroll processing steps
• Tax configuration issues
• ACH batch status
• Exception resolution`;

      actions = [
        {
          label: 'View Current Issues',
          action: () => setShowHelpLog(true),
          variant: 'outline'
        }
      ];
    }

    await simulateTyping(response, pageContext, actions);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    handleSendMessage(prompt);
  };

  const getIssueIcon = (type: PayrollIssue['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <Clock className="h-4 w-4 text-warning" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3"
    >
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Floating Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-primary to-primary/80 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
          {contextIssues.filter(i => i.type === 'error').length > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {contextIssues.filter(i => i.type === 'error').length}
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Assistant Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Payroll Assistant</h3>
                      <p className="text-sm text-muted-foreground">
                        Context: {getPageContext()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Issues Toggle */}
              {contextIssues.length > 0 && (
                <div className="p-3 border-b bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelpLog(!showHelpLog)}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Active Issues ({contextIssues.length})</span>
                    </div>
                    {showHelpLog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  <AnimatePresence>
                    {showHelpLog && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {contextIssues.map(issue => (
                          <Card key={issue.id} className="p-3">
                            <div className="flex items-start gap-2">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">{issue.title}</div>
                                <div className="text-xs text-muted-foreground">{issue.description}</div>
                                {issue.employee && (
                                  <Badge variant="outline" className="mt-1">
                                    {issue.employee}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <h4 className="font-medium mb-2">How can I help with payroll?</h4>
                      <p className="text-sm text-muted-foreground">
                        Ask me about calculations, processes, or any payroll questions
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Try asking:
                      </h5>
                      <div className="space-y-2">
                        {SAMPLE_PROMPTS.slice(0, 4).map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => handlePromptClick(prompt)}
                            className="w-full text-left p-3 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                          >
                            "{prompt}"
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.type === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-lg p-3' 
                            : 'space-y-2'
                        }`}>
                          {message.type === 'user' ? (
                            <p className="text-sm">{message.content}</p>
                          ) : (
                            <>
                              <div className="bg-muted rounded-lg p-3">
                                <pre className="text-sm whitespace-pre-wrap font-sans">
                                  {message.content}
                                </pre>
                                {message.context && (
                                  <Badge variant="outline" className="mt-2">
                                    {message.context}
                                  </Badge>
                                )}
                              </div>
                              
                              {message.actions && message.actions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {message.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      size="sm"
                                      variant={action.variant || 'default'}
                                      onClick={action.action}
                                      className="text-xs"
                                    >
                                      <Zap className="h-3 w-3 mr-1" />
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me about payroll..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={isTyping || !inputValue.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {SAMPLE_PROMPTS.slice(4).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-xs px-2 py-1 bg-muted/50 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};