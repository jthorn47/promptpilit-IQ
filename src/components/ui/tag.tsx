/**
 * Universal Tag Components
 * Reusable components for displaying and managing tags across the platform
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface TagProps {
  id: string;
  name: string;
  color: string;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'soft';
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  onClick?: (tagId: string) => void;
  className?: string;
}

export function Tag({
  id,
  name,
  color,
  size = 'md',
  variant = 'soft',
  removable = false,
  onRemove,
  onClick,
  className
}: TagProps) {
  const isHexColor = /^#[0-9A-Fa-f]{6}$/.test(color);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const baseClasses = cn(
    'inline-flex items-center gap-1 rounded-full font-medium transition-colors cursor-pointer',
    sizeClasses[size],
    className
  );

  const getTagStyles = () => {
    if (!isHexColor) {
      // Use as CSS class
      return {
        className: cn(baseClasses, color)
      };
    }

    // Use as hex color
    const styles: React.CSSProperties = {};
    
    switch (variant) {
      case 'solid':
        styles.backgroundColor = color;
        styles.color = getContrastColor(color);
        break;
      case 'outline':
        styles.borderColor = color;
        styles.color = color;
        styles.backgroundColor = 'transparent';
        break;
      case 'soft':
      default:
        styles.backgroundColor = `${color}20`;
        styles.color = color;
        break;
    }

    return {
      className: baseClasses,
      style: styles
    };
  };

  const tagProps = getTagStyles();

  return (
    <Badge
      {...tagProps}
      onClick={() => onClick?.(id)}
      className={cn(
        tagProps.className,
        onClick && 'hover:opacity-80',
        variant === 'outline' && 'border'
      )}
    >
      <span className="truncate">{name}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(id);
          }}
          className={cn(
            'ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors',
            size === 'sm' && 'p-0'
          )}
        >
          <X className={cn(
            size === 'sm' && 'h-2.5 w-2.5',
            size === 'md' && 'h-3 w-3',
            size === 'lg' && 'h-3.5 w-3.5'
          )} />
        </button>
      )}
    </Badge>
  );
}

export interface TagListProps {
  tags: Array<{
    id: string;
    name: string;
    color: string;
    type?: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'soft';
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  onTagClick?: (tagId: string) => void;
  onAddTag?: () => void;
  maxVisible?: number;
  className?: string;
}

export function TagList({
  tags,
  size = 'md',
  variant = 'soft',
  removable = false,
  onRemove,
  onTagClick,
  onAddTag,
  maxVisible,
  className
}: TagListProps) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {visibleTags.map((tag) => (
        <Tag
          key={tag.id}
          id={tag.id}
          name={tag.name}
          color={tag.color}
          size={size}
          variant={variant}
          removable={removable}
          onRemove={onRemove}
          onClick={onTagClick}
        />
      ))}
      
      {hiddenCount > 0 && (
        <Badge variant="outline" className={cn(sizeClasses[size])}>
          +{hiddenCount} more
        </Badge>
      )}

      {onAddTag && (
        <button
          type="button"
          onClick={onAddTag}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/50 bg-transparent hover:border-muted-foreground hover:bg-muted/50 transition-colors',
            sizeClasses[size]
          )}
        >
          <Plus className={cn(
            size === 'sm' && 'h-2.5 w-2.5',
            size === 'md' && 'h-3 w-3',
            size === 'lg' && 'h-3.5 w-3.5'
          )} />
          <span>Add tag</span>
        </button>
      )}
    </div>
  );
}

// Helper function to determine contrasting text color for background
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1', 
  lg: 'text-base px-3 py-1.5'
};

export { sizeClasses };