import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, X, Lightbulb, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: Array<{ type: string; description: string }>
  suggestions?: string[]
}

interface AIAssistantProps {
  onAction?: (action: any) => void
  context?: {
    reportId?: string
    currentComponents?: any[]
    selectedComponent?: string
  }
  onClose?: () => void
}

export function AIAssistant({ onAction, context, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: "Hi! I'm Sarah, your AI report assistant. I can help you build professional reports with natural language. What would you like to create today?",
      timestamp: new Date(),
      suggestions: [
        "Create a sales performance chart",
        "Add a KPI dashboard",
        "Build a monthly revenue table",
        "Set up date range filters"
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('ai-report-assistant', {
        body: {
          message: input.trim(),
          sessionId,
          context
        }
      })

      if (error) throw error

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.message,
        timestamp: new Date(),
        actions: data.actions,
        suggestions: data.suggestions
      }

      setMessages(prev => [...prev, assistantMessage])
      setSessionId(data.sessionId)

    } catch (error) {
      console.error('AI Assistant Error:', error)
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleActionClick = (action: any) => {
    onAction?.(action)
    
    // Add confirmation message
    const confirmMessage: Message = {
      id: `confirm-${Date.now()}`,
      type: 'assistant',
      content: `✅ I've ${action.description.toLowerCase()}. Anything else you'd like me to help with?`,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, confirmMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Sarah</h3>
            <p className="text-xs text-muted-foreground">AI Report Assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[280px] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <Card className={`p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </Card>
                  
                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs h-auto py-2"
                          onClick={() => handleActionClick(action)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {action.description}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer text-xs hover:bg-secondary/80"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="p-3 bg-card">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </Card>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your report..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "Add a bar chart showing sales by region" or "Create a KPI card for revenue"
        </p>
      </div>
    </div>
  )
}