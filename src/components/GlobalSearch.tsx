import { useState, useEffect } from "react";
import { Search, X, User, Building, Activity, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface SearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  content: string;
  metadata: any;
  created_at: string;
}

const entityConfig = {
  lead: { icon: User, color: "bg-blue-500", label: "Lead", route: "/admin/companies" },
  deal: { icon: Building, color: "bg-green-500", label: "Deal", route: "/admin/crm" },
  activity: { icon: Activity, color: "bg-orange-500", label: "Activity", route: "/admin/companies" },
  email: { icon: Mail, color: "bg-purple-500", label: "Email", route: "/admin/crm/email-campaigns" },
  task: { icon: FileText, color: "bg-red-500", label: "Task", route: "/admin/crm/tasks" }
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchDelay = setTimeout(() => {
      if (query.length > 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDelay);
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('search_index')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(20)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const config = entityConfig[result.entity_type as keyof typeof entityConfig];
    if (config) {
      navigate(`${config.route}?highlight=${result.entity_id}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
    );
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads, deals, activities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (query.length > 0) && (
        <Card className="absolute top-full mt-1 w-full max-w-2xl z-50 shadow-lg">
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y">
                {results.map((result) => {
                  const config = entityConfig[result.entity_type as keyof typeof entityConfig];
                  if (!config) return null;
                  
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={result.id}
                      className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-1 ${config.color}`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                          <div className="font-medium text-sm truncate">
                            {highlightText(result.title, query)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {highlightText(result.content.substring(0, 150), query)}
                            {result.content.length > 150 && "..."}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            {result.metadata?.status && (
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.status}
                              </Badge>
                            )}
                            <span>
                              {new Date(result.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : query.length > 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Type at least 3 characters to search
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}