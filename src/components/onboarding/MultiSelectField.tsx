import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectFieldProps {
  options: string[];
  value: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelection?: number;
}

export const MultiSelectField = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  maxSelection
}: MultiSelectFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    
    onChange(newValue);
  };

  const handleRemove = (option: string) => {
    onChange(value.filter(v => v !== option));
  };

  const canAddMore = !maxSelection || value.length < maxSelection;

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {value.length === 0 
                ? placeholder 
                : `${value.length} selected`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-auto p-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                <Checkbox
                  id={option}
                  checked={value.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                  disabled={disabled || (!value.includes(option) && !canAddMore)}
                />
                <Label htmlFor={option} className="text-sm font-normal cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Display selected values as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs">
              {item}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {maxSelection && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxSelection} selected
        </p>
      )}
    </div>
  );
};