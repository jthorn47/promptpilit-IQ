import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isDone: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  avatar: string;
}

interface SearchFilters {
  from?: string;
  subject?: string;
  content?: string;
  timeframe?: string;
}

interface EmailSummary {
  id: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low';
}

interface SearchResult {
  searchFilters: SearchFilters;
  emailSummaries: EmailSummary[];
  queryUnderstood: boolean;
}

interface InboxSearchWithAIProps {
  emails: Email[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchResults: (results: Email[], isAISearch: boolean, summaries?: EmailSummary[]) => void;
}

export const InboxSearchWithAI = ({ emails, searchQuery, onSearchChange, onSearchResults }: InboxSearchWithAIProps) => {
  const [isAISearching, setIsAISearching] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const performNativeSearch = (query: string) => {
    if (!query.trim()) {
      onSearchResults(emails, false);
      return;
    }

    const filtered = emails.filter(email => {
      const searchTerm = query.toLowerCase();
      return email.subject.toLowerCase().includes(searchTerm) ||
             email.sender.toLowerCase().includes(searchTerm) ||
             email.preview.toLowerCase().includes(searchTerm);
    });

    onSearchResults(filtered, false);
  };

  const performAISearch = async (query: string) => {
    if (!query.trim()) {
      performNativeSearch(query);
      return;
    }

    setIsAISearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-email-assistant', {
        body: {
          type: 'search_intent',
          emails: emails.map(email => ({
            id: email.id,
            subject: email.subject,
            sender: email.sender,
            body: email.preview,
            timestamp: email.timestamp
          })),
          searchQuery: query
        }
      });

      if (error) throw error;

      const result: SearchResult = data;
      
      if (result.queryUnderstood) {
        // Apply AI-parsed filters
        const filtered = emails.filter(email => {
          let matches = true;
          
          if (result.searchFilters.from) {
            matches = matches && email.sender.toLowerCase().includes(result.searchFilters.from.toLowerCase());
          }
          
          if (result.searchFilters.subject) {
            matches = matches && email.subject.toLowerCase().includes(result.searchFilters.subject.toLowerCase());
          }
          
          if (result.searchFilters.content) {
            matches = matches && email.preview.toLowerCase().includes(result.searchFilters.content.toLowerCase());
          }
          
          // TODO: Add timeframe filtering logic
          
          return matches;
        });

        setSearchFilters(result.searchFilters);
        setEmailSummaries(result.emailSummaries);
        onSearchResults(filtered, true, result.emailSummaries);
        
        toast.success('AI search completed');
      } else {
        // Fall back to native search
        performNativeSearch(query);
        toast.info('Falling back to native search');
      }
    } catch (error) {
      console.error('AI search error:', error);
      performNativeSearch(query);
      toast.error('AI search failed, using native search');
    } finally {
      setIsAISearching(false);
    }
  };

  const handleSearch = (query: string) => {
    onSearchChange(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      if (isAIEnabled) {
        performAISearch(query);
      } else {
        performNativeSearch(query);
      }
    }, 300);
  };

  const clearSearch = () => {
    handleSearch('');
    setSearchFilters({});
    setEmailSummaries([]);
  };

  const toggleAISearch = () => {
    setIsAIEnabled(!isAIEnabled);
    if (!isAIEnabled && searchQuery) {
      // Re-run search with AI enabled
      performAISearch(searchQuery);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={isAIEnabled ? "Search with AI (e.g., 'emails from Sarah about Q4 strategy')" : "Search conversations..."}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-20 border-0 bg-muted/30 hover:bg-muted/50 focus:bg-muted/70 transition-colors"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isAISearching && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="p-1 h-auto hover:bg-muted/50"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant={isAIEnabled ? "default" : "ghost"}
            size="sm"
            onClick={toggleAISearch}
            className="p-1 h-auto"
            title={isAIEnabled ? "AI Search Enabled" : "Enable AI Search"}
          >
            <Sparkles className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Search Filters Display */}
      <AnimatePresence>
        {Object.keys(searchFilters).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {searchFilters.from && (
              <Badge variant="outline" className="text-xs">
                From: {searchFilters.from}
              </Badge>
            )}
            {searchFilters.subject && (
              <Badge variant="outline" className="text-xs">
                Subject: {searchFilters.subject}
              </Badge>
            )}
            {searchFilters.content && (
              <Badge variant="outline" className="text-xs">
                Content: {searchFilters.content}
              </Badge>
            )}
            {searchFilters.timeframe && (
              <Badge variant="outline" className="text-xs">
                Time: {searchFilters.timeframe}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const EmailSummaryCard = ({ summary, relevance }: { summary: string; relevance: 'high' | 'medium' | 'low' }) => {
  const relevanceColors = {
    high: 'border-green-200 bg-green-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-gray-200 bg-gray-50'
  };

  return (
    <Card className={`p-3 mt-2 ${relevanceColors[relevance]}`}>
      <div className="flex items-start gap-2">
        <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">{summary}</p>
      </div>
    </Card>
  );
};