import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DynamicField } from '@/types/document-builder';

interface DynamicFieldsPanelProps {
  fields: DynamicField[];
  values: Record<string, any>;
  onFieldValueChange: (fieldName: string, value: any) => void;
}

export const DynamicFieldsPanel = ({ fields, values, onFieldValueChange }: DynamicFieldsPanelProps) => {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.id}>
          <Label className="text-xs">{field.field_label}</Label>
          <Input
            value={values[field.field_name] || ''}
            onChange={(e) => onFieldValueChange(field.field_name, e.target.value)}
            placeholder={field.description}
            className="text-xs"
          />
        </div>
      ))}
    </div>
  );
};