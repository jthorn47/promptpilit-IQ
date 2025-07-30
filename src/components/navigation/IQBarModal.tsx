import React, { useState, useEffect, useMemo } from 'react';
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Search, 
  Building2, 
  User, 
  FileText, 
  BarChart3,
  Clock,
  Archive,
  Shield,
  Folder,
  Settings,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { commandParserService } from '@/services/commandParserService';
import { useIQSearch } from '@/hooks/useIQSearch';

interface IQBarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IQBarModal: React.FC<IQBarModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { searchResults, isLoading, executeSearch } = useIQSearch();

  // Execute search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      executeSearch(searchQuery);
    }
  }, [searchQuery, executeSearch]);

  // Parse commands and get suggestions
  const parsedCommand = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return commandParserService.parseCommand(searchQuery);
  }, [searchQuery]);

  const handleSelect = (item: any) => {
    if (item.type === 'command') {
      // Execute command
      if (item.action === 'navigate') {
        navigate(item.url);
      } else if (item.action === 'create') {
        navigate(item.createUrl);
      } else if (item.action === 'submit') {
        navigate(item.submitUrl);
      }
    } else {
      // Navigate to record/page
      navigate(item.url);
    }
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, any[]> = {
      commands: [],
      modules: [],
      companies: [],
      proposals: [],
      employees: [],
      recent: []
    };

    // Add parsed command if it exists
    if (parsedCommand) {
      groups.commands.push(parsedCommand);
    }

    // Group search results
    searchResults.forEach(result => {
      if (groups[result.type]) {
        groups[result.type].push(result);
      }
    });

    return groups;
  }, [searchResults, parsedCommand]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'company': return Building2;
      case 'employee': return User;
      case 'proposal': return FileText;
      case 'module': return BarChart3;
      case 'dashboard': return BarChart3;
      case 'command': return ChevronRight;
      default: return Search;
    }
  };

  const getGroupTitle = (groupKey: string) => {
    switch (groupKey) {
      case 'commands': return 'Commands';
      case 'modules': return 'Pages & Modules';
      case 'companies': return 'Companies';
      case 'proposals': return 'Proposals';
      case 'employees': return 'People';
      case 'recent': return 'Recent';
      default: return groupKey;
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={handleClose}>
      <CommandInput
        placeholder="Type to search companies, modules, people, or commands..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? 'Searching...' : 'No results found.'}
        </CommandEmpty>

        {/* Show quick help if no query */}
        {!searchQuery.trim() && (
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => handleSelect({ type: 'command', action: 'navigate', url: '/admin/companies' })}
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>View Companies</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect({ type: 'command', action: 'navigate', url: '/admin/proposals' })}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>View Proposals</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect({ type: 'command', action: 'navigate', url: '/admin/my-work' })}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>My Work</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect({ type: 'command', action: 'navigate', url: '/vault' })}
            >
              <Archive className="mr-2 h-4 w-4" />
              <span>Go to Vault</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Render grouped results */}
        {Object.entries(groupedResults).map(([groupKey, items]) => {
          if (items.length === 0) return null;

          return (
            <React.Fragment key={groupKey}>
              <CommandGroup heading={getGroupTitle(groupKey)}>
                {items.map((item, index) => {
                  const Icon = getIconForType(item.type);
                  
                  return (
                    <CommandItem
                      key={`${groupKey}-${index}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.external && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {groupKey !== 'recent' && <CommandSeparator />}
            </React.Fragment>
          );
        })}

        {/* Example searches */}
        {searchQuery.trim() && groupedResults.commands.length === 0 && (
          <CommandGroup heading="Try searching for">
            <CommandItem disabled>
              <span className="text-muted-foreground">• "Create proposal for Company Name"</span>
            </CommandItem>
            <CommandItem disabled>
              <span className="text-muted-foreground">• "Submit timecard"</span>
            </CommandItem>
            <CommandItem disabled>
              <span className="text-muted-foreground">• "Go to Vault"</span>
            </CommandItem>
            <CommandItem disabled>
              <span className="text-muted-foreground">• "Open SB 553"</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};