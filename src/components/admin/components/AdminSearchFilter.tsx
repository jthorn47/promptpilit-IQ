import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AdminSearchFilter: React.FC<AdminSearchFilterProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search companies, EINs, employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-64"
        />
      </div>
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4" />
      </Button>
    </div>
  );
};