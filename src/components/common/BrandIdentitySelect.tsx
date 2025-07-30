import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandIdentity, BRAND_OPTIONS } from "@/types/brand";

interface BrandIdentitySelectProps {
  value?: BrandIdentity;
  onValueChange: (value: BrandIdentity) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

export const BrandIdentitySelect: React.FC<BrandIdentitySelectProps> = ({
  value,
  onValueChange,
  required = true,
  disabled = false,
  placeholder = "Select brand identity...",
  error
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Brand Identity
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {BRAND_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <p className="text-xs text-gray-600">
        Used for email domain routing, UI branding, and template control
      </p>
    </div>
  );
};