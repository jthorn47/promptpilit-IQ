import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BrandIdentity, BRAND_OPTIONS, getBrandConfig } from "@/types/brand";
import { Filter } from "lucide-react";

interface BrandFilterProps {
  selectedBrands: BrandIdentity[];
  onBrandChange: (brands: BrandIdentity[]) => void;
  showAllOption?: boolean;
  className?: string;
}

export const BrandFilter: React.FC<BrandFilterProps> = ({
  selectedBrands,
  onBrandChange,
  showAllOption = true,
  className = ""
}) => {
  const handleBrandToggle = (brand: BrandIdentity) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  const handleSelectAll = () => {
    if (selectedBrands.length === BRAND_OPTIONS.length) {
      onBrandChange([]);
    } else {
      onBrandChange(BRAND_OPTIONS.map(option => option.value));
    }
  };

  const isAllSelected = selectedBrands.length === BRAND_OPTIONS.length;
  const hasSelection = selectedBrands.length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by Brand</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {showAllOption && (
          <Badge
            variant={isAllSelected ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            onClick={handleSelectAll}
          >
            All Brands
          </Badge>
        )}
        
        {BRAND_OPTIONS.map((option) => {
          const isSelected = selectedBrands.includes(option.value);
          const config = getBrandConfig(option.value);
          
          return (
            <Badge
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleBrandToggle(option.value)}
              style={{
                borderColor: isSelected ? config.primaryColor : undefined,
                backgroundColor: isSelected ? config.primaryColor : undefined
              }}
            >
              {option.label}
            </Badge>
          );
        })}
      </div>

      {hasSelection && !isAllSelected && (
        <p className="text-xs text-muted-foreground">
          Showing {selectedBrands.length} of {BRAND_OPTIONS.length} brands
        </p>
      )}
    </div>
  );
};