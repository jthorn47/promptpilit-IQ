import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VaultSearchFilter } from '../../types';

export interface VaultSearchProps {
  onSearch?: (filter: VaultSearchFilter) => void;
  placeholder?: string;
}

export const VaultSearch: React.FC<VaultSearchProps> = ({
  onSearch,
  placeholder = "Search files, documents, and folders..."
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch?.({ query: query || undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setQuery('');
    onSearch?.({});
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-muted' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {filter}
                <X className="h-3 w-3 cursor-pointer" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {showFilters && (
          <div className="border-t pt-4 space-y-3">
            <div className="text-sm font-medium">Quick Filters</div>
            <div className="flex flex-wrap gap-2">
              {['Recent', 'Shared', 'Images', 'Documents', 'PDFs', 'Large Files'].map((filter) => (
                <Button
                  key={filter}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};