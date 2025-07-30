import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type ClientType = 'easeworks' | 'easelearn' | 'both' | 'all';

interface ClientTypeFilterProps {
  selectedType: ClientType;
  onFilterChange: (type: ClientType) => void;
}

const CLIENT_TYPE_LABELS = {
  all: 'All Clients',
  easeworks: 'Easeworks',
  easelearn: 'EaseLearn', 
  both: 'Both'
};

const CLIENT_TYPE_COLORS = {
  easeworks: 'bg-blue-500/10 text-blue-700 border-blue-200',
  easelearn: 'bg-green-500/10 text-green-700 border-green-200',
  both: 'bg-purple-500/10 text-purple-700 border-purple-200'
};

export const ClientTypeFilter: React.FC<ClientTypeFilterProps> = ({
  selectedType,
  onFilterChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Client Type:</label>
        <Select value={selectedType} onValueChange={(value) => onFilterChange(value as ClientType)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="easeworks">Easeworks</SelectItem>
            <SelectItem value="easelearn">EaseLearn</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedType !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={CLIENT_TYPE_COLORS[selectedType as keyof typeof CLIENT_TYPE_COLORS]}
          >
            {CLIENT_TYPE_LABELS[selectedType]}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange('all')}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};