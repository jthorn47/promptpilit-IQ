import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HaaLODropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface HaaLODropdownProps {
  options: HaaLODropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

export const HaaLODropdown: React.FC<HaaLODropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};