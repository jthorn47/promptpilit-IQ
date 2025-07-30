import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Archive, Grid3X3, List, Search, Filter } from "lucide-react";
import { ClientSelector } from "./ClientSelector";

interface AdminTrainingModulesHeaderProps {
  onCreateModule: () => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedClientId?: string;
  onClientSelect: (clientId: string) => void;
}

export const AdminTrainingModulesHeader = ({
  onCreateModule,
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedClientId,
  onClientSelect
}: AdminTrainingModulesHeaderProps) => {
  return (
    <div className="relative bg-gradient-card rounded-2xl p-4 md:p-8 shadow-soft border border-border/50 backdrop-blur-sm">
      <div className="flex flex-col gap-6">
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Training Modules
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Create and manage your training content library
            </p>
          </div>
          
          <Button 
            onClick={onCreateModule}
            size="sm"
            className="bg-gradient-primary hover:opacity-90 shadow-medium transition-all duration-200 hover:shadow-strong w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Module
          </Button>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search training modules..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
                <SelectItem value="Diversity & Inclusion">Diversity & Inclusion</SelectItem>
                <SelectItem value="Environmental">Environmental</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <ClientSelector
              selectedClientId={selectedClientId}
              onClientSelect={onClientSelect}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg p-1 bg-background/50 w-fit">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="px-4"
            >
              <List className="w-4 h-4 mr-2" />
              <span>Table</span>
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
              className="px-4"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              <span>Cards</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};