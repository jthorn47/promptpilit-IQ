import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Globe, AlertTriangle, User, Bot, Clock } from 'lucide-react';

export const HROIQAIAssistant: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock conversation data - will be replaced with real API calls
  const conversations = [
    {
      id: '1',
      type: 'user',
      message: 'What is the process for requesting time off?',
      timestamp: '2024-01-23 10:30 AM',
      language: 'english'
    },
    {
      id: '2',
      type: 'assistant',
      message: 'To request time off, you need to: 1) Log into the employee portal, 2) Navigate to the Time Off section, 3) Select your request type (vacation, sick leave, personal day), 4) Choose your dates, 5) Submit for manager approval. The request will be processed within 24-48 hours.',
      timestamp: '2024-01-23 10:30 AM',
      language: 'english',
      escalated: false
    },
    {
      id: '3',
      type: 'user',
      message: '¿Cuál es la política de trabajo remoto?',
      timestamp: '2024-01-23 09:15 AM',
      language: 'spanish'
    },
    {
      id: '4',
      type: 'assistant',
      message: 'La política de trabajo remoto permite trabajar desde casa hasta 3 días por semana, previa aprobación del supervisor. Debe mantener las horas de trabajo estándar y estar disponible para reuniones virtuales. Para solicitar trabajo remoto, complete el formulario en el portal de empleados.',
      timestamp: '2024-01-23 09:16 AM',
      language: 'spanish',
      escalated: false
    },
    {
      id: '5',
      type: 'user',
      message: 'I need help with a complex harassment complaint investigation',
      timestamp: '2024-01-23 08:45 AM',
      language: 'english'
    },
    {
      id: '6',
      type: 'assistant',
      message: 'This is a complex issue that requires immediate attention from our HR specialists. I\'m escalating this to our human HR representative who will contact you within 30 minutes to discuss the proper investigation procedures and next steps.',
      timestamp: '2024-01-23 08:46 AM',
      language: 'english',
      escalated: true,
      escalatedTo: 'HR Specialist - Sarah Johnson'
    }
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    // Here would be API call to HROIQ AI service
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payroll IQ AI Assistant
            </h1>
            <p className="text-muted-foreground text-lg">
              Get instant answers to your HR questions in multiple languages
            </p>
          </div>
          <div className="hidden md:block opacity-20">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Bot className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-muted-foreground">Bilingual HR support with intelligent escalation</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">🇺🇸 English</SelectItem>
                <SelectItem value="spanish">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="text-green-600">
            ● Online
          </Badge>
        </div>
      </div>

      {/* AI Capabilities */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Bot className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="flex-1">
              <h3 className="font-medium">AI-Powered HR Support</h3>
              <p className="text-sm text-muted-foreground">
                Get instant answers to common HR questions in English and Spanish. 
                Complex issues are automatically escalated to human experts.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">🇺🇸 English</Badge>
              <Badge variant="secondary">🇪🇸 Español</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                HR Assistant Chat
              </CardTitle>
              <CardDescription>
                Ask questions about HR policies, procedures, and guidelines
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4 space-y-4">
                {conversations.map((conv) => (
                  <div key={conv.id} className={`flex ${conv.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      conv.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {conv.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">{conv.timestamp}</span>
                        {conv.language === 'spanish' && (
                          <Badge variant="outline" className="text-xs">🇪🇸</Badge>
                        )}
                        {conv.escalated && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Escalated
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{conv.message}</p>
                      {conv.escalated && conv.escalatedTo && (
                        <p className="text-xs mt-2 opacity-70">
                          Escalated to: {conv.escalatedTo}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm">Thinking...</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={currentLanguage === 'spanish' ? 'Escribe tu pregunta aquí...' : 'Type your question here...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {currentLanguage === 'spanish' 
                    ? 'Presiona Enter para enviar. Las consultas complejas se escalan automáticamente.'
                    : 'Press Enter to send. Complex issues are automatically escalated to human experts.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left h-auto p-3">
                <div>
                  <div className="font-medium">Time Off Policy</div>
                  <div className="text-xs text-muted-foreground">View vacation and sick leave</div>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-left h-auto p-3">
                <div>
                  <div className="font-medium">Benefits Information</div>
                  <div className="text-xs text-muted-foreground">Health, dental, retirement</div>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-left h-auto p-3">
                <div>
                  <div className="font-medium">Performance Reviews</div>
                  <div className="text-xs text-muted-foreground">Review process and timeline</div>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-left h-auto p-3">
                <div>
                  <div className="font-medium">Workplace Policies</div>
                  <div className="text-xs text-muted-foreground">Code of conduct, safety</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Escalation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Today's Escalations</span>
                <Badge variant="secondary">3</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Avg Response Time</span>
                <span className="text-muted-foreground">15 min</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Resolution Rate</span>
                <span className="text-green-600">94%</span>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                <Clock className="h-4 w-4 mr-1" />
                View All Escalations
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Language Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">🇺🇸 English</Badge>
                  <span className="text-sm text-muted-foreground">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">🇪🇸 Español</Badge>
                  <span className="text-sm text-muted-foreground">Supported</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI Assistant automatically detects language and responds appropriately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};