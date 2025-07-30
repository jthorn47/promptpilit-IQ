
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IQTooltip } from "@/components/ui/iq-tooltip";
import { Edit, Save, X, Loader2 } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  readonly?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
  tooltip?: string;
}

interface SettingsFieldProps {
  label: string;
  value: any;
  type?: 'text' | 'select' | 'switch' | 'multiselect' | 'display';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  onSave: (value: any) => void;
  readonly?: boolean;
  isLoading?: boolean;
  tooltip?: string;
}

export const SettingsCard = ({ 
  title, 
  description, 
  icon, 
  readonly = false, 
  isLoading = false,
  children,
  onClick,
  clickable = false,
  tooltip
}: SettingsCardProps) => {
  return (
    <Card 
      className={clickable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          {tooltip && (
            <IQTooltip content={<p>{tooltip}</p>} size="sm" />
          )}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export const SettingsField = ({ 
  label, 
  value, 
  type = 'text', 
  options = [], 
  placeholder, 
  onSave, 
  readonly = false,
  isLoading = false,
  tooltip
}: SettingsFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const renderDisplayValue = () => {
    if (type === 'switch') {
      return value ? 'Enabled' : 'Disabled';
    }
    if (type === 'select' && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      return option?.label || (value !== undefined && value !== null ? String(value) : "—");
    }
    if (type === 'multiselect' && Array.isArray(value)) {
      return value.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {value.map((val, idx) => {
            const option = options.find(opt => opt.value === val);
            return (
              <Badge key={idx} variant="secondary">
                {option?.label || val}
              </Badge>
            );
          })}
        </div>
      ) : 'None selected';
    }
    return value !== undefined && value !== null ? String(value) : "—";
  };

  const renderEditField = () => {
    switch (type) {
      case 'select':
        return (
          <Select value={editValue || ''} onValueChange={setEditValue}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={editValue || false}
              onCheckedChange={setEditValue}
            />
            <span>{editValue ? 'Enabled' : 'Disabled'}</span>
          </div>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`option-${option.value}`}
                  checked={(editValue || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = editValue || [];
                    if (e.target.checked) {
                      setEditValue([...currentValues, option.value]);
                    } else {
                      setEditValue(currentValues.filter((val: string) => val !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`option-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <Input
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          {label}
          {tooltip && (
            <IQTooltip content={<p>{tooltip}</p>} size="sm" />
          )}
        </Label>
        {!readonly && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          {renderEditField()}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {renderDisplayValue()}
        </div>
      )}
    </div>
  );
};
