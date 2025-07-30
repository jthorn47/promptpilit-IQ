import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from "@/hooks/useCompanies";

interface SortControlProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions = [
  { value: 'created_newest' as SortOption, label: 'Created Date (Newest First)' },
  { value: 'created_oldest' as SortOption, label: 'Created Date (Oldest First)' },
  { value: 'name_asc' as SortOption, label: 'Company Name (A–Z)' },
  { value: 'name_desc' as SortOption, label: 'Company Name (Z–A)' },
  { value: 'lifecycle_stage' as SortOption, label: 'Lifecycle Stage (Funnel Order)' },
];

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}